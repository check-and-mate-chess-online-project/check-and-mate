using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using Presentation.Hubs;
using Application.Services.Interfaces;
using Application.Services;
using Application.Abstractions.Settings;
using Application.Orchestration.GameSessions;
using Application.Abstractions.GameSessions;
using Application.Abstractions.Matchmaking;
using Application.Abstractions.Security;
using Application.Abstractions.UnitOfWork;
using Infrastructure.Settings;
using Infrastructure.Realtime;
using Infrastructure.Security;
using Infrastructure.Persistence.InMemory;
using Core.Repositories;
using Core.Models.Interfaces;
using Infrastructure.Chess;


namespace Presentation;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddControllers();
        builder.Services.AddSignalR();

        builder.Services.AddAuthentication("Bearer")
            .AddJwtBearer("Bearer", options =>
            {
                options.TokenValidationParameters = options.TokenValidationParameters = new TokenValidationParameters
                {
                    ValidateIssuer = false,
                    ValidateAudience = false,
                    ValidateLifetime = true,
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes("SUPER_SECRET_KEY_123456"))
                };
                options.Events = new JwtBearerEvents
                {
                    OnMessageReceived = context =>
                    {
                        var accessToken = context.Request.Query["access_token"];
                        var path = context.HttpContext.Request.Path;

                        if (!string.IsNullOrEmpty(accessToken) &&
                            path.StartsWithSegments("/hub"))
                        {
                            context.Token = accessToken;
                        }

                        return Task.CompletedTask;
                    }
                };
            });

        builder.Services.AddAuthorization();

        builder.Services.Configure<GameSettings>(
        builder.Configuration.GetSection("GameSettings"));
        builder.Services.AddScoped<IGameSettingsProvider, GameSettingsProvider>();

        builder.Services.AddSingleton<IGameRepository, GameRepository>();
        builder.Services.AddSingleton<IUserRepository, UserRepository>();

        builder.Services.AddSingleton<IChessEngine, ChessEngine>();
        builder.Services.AddSingleton<IGameSessionStore, GameSessionStore>();
        builder.Services.AddSingleton<IMatchmakingPool, MatchmakingPool>();
        builder.Services.AddSingleton<IPasswordHasher, SimplePasswordHasher>();

        builder.Services.AddScoped<IGameSessionService, GameSessionService>();

        builder.Services.AddScoped<IUnitOfWork, UnitOfWork>();
        builder.Services.AddScoped<IUserRegistrationService, UserRegistrationService>();
        builder.Services.AddScoped<IMatchmakingService, MatchmakingService>();
        builder.Services.AddScoped<IGameplayService, GameplayService>();

        builder.Services.AddSingleton<ConnectionManager>();

        var app = builder.Build();

        app.UseSwagger();
        app.UseSwaggerUI();

        app.UseAuthentication();
        app.UseAuthorization();

        app.MapControllers();
        app.MapHub<GameHub>("/hub");

        app.Run();
    }
}
