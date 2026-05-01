using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Presentation.Hubs;
using Presentation.Events.Handlers;
using Application.Services.Interfaces;
using Application.Services;
using Application.Abstractions.Settings;
using Application.Orchestration.GameSessions;
using Application.Abstractions.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.Security;
using Application.Abstractions.UnitOfWork;
using Application.Orchestration.EventHandlers;
using Application.Abstractions.Events;
using Application.Events;
using Infrastructure.Settings;
using Infrastructure.Connections;
using Infrastructure.Security;
using Infrastructure.Persistence.InMemory;
using Infrastructure.Chess;
using Infrastructure.Events;
using Infrastructure.Background;
using Core.Repositories;
using Core.Models.Interfaces;
using Presentation.Events;
using Microsoft.AspNetCore.Diagnostics;
using Application.Abstractions.Tokens;


namespace Presentation;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddEnvironmentVariables(); 

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();
        builder.Services.AddSignalR();

        string key = builder.Configuration["JwtSettings:Key"] ?? throw new InvalidOperationException("jwt key not found");
        if (key.Length < 32) throw new InvalidOperationException("jwt key too short");
        builder.Services.AddAuthentication("Bearer")
            .AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidateAudience = true,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(key))
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        string? accessToken = context.Request.Query["access_token"];
                        PathString path = context.HttpContext.Request.Path;
                        if (!string.IsNullOrEmpty(accessToken) && path.StartsWithSegments("/hub")) 
                            context.Token = accessToken;
                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.Configure<JwtTokenSettings>(builder.Configuration.GetSection("JwtSettings"));
        builder.Services.Configure<GameSettings>(builder.Configuration.GetSection("GameSettings"));
        builder.Services.AddScoped<IGameSettingsProvider, GameSettingsProvider>();

        builder.Services.AddSingleton<IGameRepository, GameRepository>();
        builder.Services.AddSingleton<IUserRepository, UserRepository>();

        builder.Services.AddSingleton<IChessEngine, ChessEngine>();
        builder.Services.AddSingleton<IGameSessionStore, GameSessionStore>();
        builder.Services.AddSingleton<IMatchmakingPool, MatchmakingPool>();
        builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();
        builder.Services.AddSingleton<IPasswordHasher, SimplePasswordHasher>();
        builder.Services.AddScoped<IGameSessionService, GameSessionService>();

        builder.Services.AddSingleton<IEventDispatcher, EventDispatcher>();
        builder.Services.AddScoped<IEventHandler<TimeExpired>, TimeExpiredHandler>();
        builder.Services.AddScoped<IEventHandler<TimeExpired>, TimeExpiredSignalRHandler>();
        builder.Services.AddSingleton<INotifier, Notifier>();

        builder.Services.AddHostedService<TimeService>();
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IUserAuthService, UserAuthService>();
        builder.Services.AddScoped<IUserRegistrationService, UserRegistrationService>();
        builder.Services.AddScoped<IMatchmakingService, MatchmakingService>();
        builder.Services.AddScoped<IGameplayService, GameplayService>();

        builder.Services.AddSingleton<ConnectionManager>();

        WebApplication app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseAuthentication();
        app.UseAuthorization();

        app.UseCors(policy => policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(origin => true));

        app.MapControllers();
        app.MapHub<GameHub>("/hub");

        app.UseExceptionHandler(ex =>
        {
            ex.Run(async context =>
            {
                IExceptionHandlerFeature? exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
                if (exceptionFeature == null) return;
                Exception exception = exceptionFeature.Error;
                context.Response.StatusCode = exception switch
                {
                    InvalidOperationException => StatusCodes.Status400BadRequest,
                    ArgumentException => StatusCodes.Status400BadRequest,
                    UnauthorizedAccessException => StatusCodes.Status403Forbidden,
                    _ => StatusCodes.Status500InternalServerError
                };
                var errorResponse = new
                {
                    message = context.Response.StatusCode == StatusCodes.Status500InternalServerError
                        ? "an unexpected error occurred"
                        : exception.Message,
                    statusCode = context.Response.StatusCode
                };
                await context.Response.WriteAsJsonAsync(errorResponse);
            });
        });

        app.Run();
    }
}