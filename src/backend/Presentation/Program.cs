using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Diagnostics;
using Microsoft.AspNetCore.SignalR;
using System.Text;
using Presentation.Hubs;
using Presentation.Events.Handlers;
using Presentation.Events;
using Presentation.Responces;
using Application.Services.Interfaces;
using Application.Services;
using Application.Abstractions.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.Security;
using Application.Abstractions.Settings;
using Application.Abstractions.Chess;
using Application.Abstractions.Tokens;
using Application.Abstractions.UnitOfWork;
using Application.Abstractions.Events;
using Application.Orchestration.EventHandlers;
using Application.Orchestration.UserSkins;
using Application.Orchestration.SkinDrops;
using Application.Orchestration.GameSessions;
using Application.Abstractions.Connections;
using Application.Events;
using Application.Exceptions;
using Infrastructure.Settings;
using Infrastructure.Security;
using Infrastructure.Persistence.InMemory;
using Infrastructure.Chess;
using Infrastructure.Events;
using Infrastructure.Connections;
using Infrastructure.Background;
using Core.Repositories;
using Core.Exceptions;
using Application.Orchestration.RatingCalculation;


namespace Presentation;

public class Program
{
    public static void Main(string[] args)
    {
        WebApplicationBuilder builder = WebApplication.CreateBuilder(args);

        builder.Configuration.AddEnvironmentVariables(); 

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();

        builder.Services.AddSwaggerGen();

        builder.Services.AddControllers();
        builder.Services.AddSignalR(hubOptions =>
        {
            hubOptions.KeepAliveInterval = TimeSpan.FromSeconds(10);
            hubOptions.ClientTimeoutInterval = TimeSpan.FromSeconds(60);
            hubOptions.AddFilter<HubExceptionFilter>();
        });

        string key = builder.Configuration["JwtSettings:Key"] ?? throw new InvalidOperationException("jwt key not found");
        if (key.Length < 32) throw new InvalidOperationException("jwt key too short");
        builder.Services.AddAuthentication("Bearer")
            .AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = true,
                    ValidIssuer = builder.Configuration["JwtSettings:Issuer"] ?? throw new InvalidOperationException("issuer not found"),
                    ValidateAudience = true,
                    ValidAudience = builder.Configuration["JwtSettings:Audience"] ?? throw new InvalidOperationException("audience not found"),
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
        builder.Services.AddSingleton<IGameSettingsProvider, GameSettingsProvider>();

        builder.Services.AddSingleton<IGameRepository, GameRepository>();
        builder.Services.AddSingleton<IUserRepository, UserRepository>();
        builder.Services.AddSingleton<ISkinRepository, SkinRepository>();
        builder.Services.AddSingleton<IUserSkinRepository, UserSkinRepository>();
        builder.Services.AddSingleton<IGameInvitationRepository, GameInvitationRepository>();
        builder.Services.AddSingleton<IFriendRequestRepository, FriendRequestRepository>();
        builder.Services.AddSingleton<IFriendshipRepository, FriendshipRepository>();
        builder.Services.AddSingleton<IUserCustomizationRepository, UserCustomizationRepository>();

        builder.Services.AddSingleton<IGameSessionStore, GameSessionStore>();
        builder.Services.AddSingleton<IMatchmakingPool, MatchmakingPool>();

        builder.Services.AddSingleton<IChessEngineFactory, ChessEngineFactory>();
        builder.Services.AddSingleton<ITokenGenerator, JwtTokenGenerator>();
        builder.Services.AddSingleton<IPasswordHasher, PasswordHasher>();
        builder.Services.AddSingleton<IRatingCalculator, RatingCalculator>();
        builder.Services.AddSingleton<IGameSessionService, GameSessionService>();
        builder.Services.AddSingleton<IConnectionGracePeriodTimer, ConnectionGracePeriodTimer>();
        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IUserSkinService, UserSkinService>();
        builder.Services.AddScoped<ISkinDropService, SkinDropService>();

        builder.Services.AddSingleton<IEventDispatcher, EventDispatcher>();
        builder.Services.AddTransient<IEventHandler<TimeExpired>, TimeExpiredHandler>();
        builder.Services.AddTransient<IEventHandler<TimeExpired>, TimeExpiredSignalRHandler>();
        builder.Services.AddTransient<IEventHandler<GameStarted>, GameStartedHandler>();
        builder.Services.AddSingleton<INotifier, Notifier>();

        builder.Services.AddHostedService<TimeService>();

        builder.Services.AddScoped<IAuthService, AuthService>();
        builder.Services.AddScoped<IFriendshipService, FriendshipService>();
        builder.Services.AddScoped<IGameInvitationService, GameInvitationService>();
        builder.Services.AddScoped<IGameplayService, GameplayService>();
        builder.Services.AddScoped<IInventoryService, InventoryService>();
        builder.Services.AddScoped<ILootBoxService, LootBoxService>();
        builder.Services.AddScoped<IMatchmakingService, MatchmakingService>();
        builder.Services.AddScoped<IProfileService, ProfileService>();
        builder.Services.AddScoped<IRegistrationService, RegistrationService>();
        builder.Services.AddScoped<ISkinConfigurationService, SkinConfigurationService>();
        builder.Services.AddScoped<IArchiveService, ArchiveService>();

        WebApplication app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseCors(policy => policy
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials()
            .SetIsOriginAllowed(origin => true));

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<GameHub>("/hub/game");

        app.UseExceptionHandler(ex =>
        {
            ex.Run(async context =>
            {
                IExceptionHandlerFeature? exceptionFeature = context.Features.Get<IExceptionHandlerFeature>();
                if (exceptionFeature == null) return;
                Exception exception = exceptionFeature.Error;
                context.Response.StatusCode = exception switch
                {
                    CoreLogicException => StatusCodes.Status400BadRequest,
                    ArgumentException => StatusCodes.Status400BadRequest,
                    UnauthorizedAccessException => StatusCodes.Status401Unauthorized,
                    NotFoundException => StatusCodes.Status404NotFound,
                    ConflictException => StatusCodes.Status409Conflict,
                    UserDeletedException => StatusCodes.Status410Gone,
                    InvalidOperationException => StatusCodes.Status500InternalServerError,
                    _ => StatusCodes.Status500InternalServerError
                };
                ErrorResponse errorResponse = new
                (
                    context.Response.StatusCode, 
                    context.Response.StatusCode == StatusCodes.Status500InternalServerError
                        ? "an unexpected error occurred"
                        : exception.Message
                );

                await context.Response.WriteAsJsonAsync(errorResponse);
            });
        });

        app.Run();
    }
}