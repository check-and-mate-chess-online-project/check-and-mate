using Microsoft.EntityFrameworkCore;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Context;

public class AppDbContext(DbContextOptions<AppDbContext> options) : DbContext(options)
{
    public DbSet<UserEntity> Users => Set<UserEntity>();
    public DbSet<GameEntity> Games => Set<GameEntity>();
    public DbSet<FriendshipEntity> Friends => Set<FriendshipEntity>();
    public DbSet<FriendRequestEntity> FriendRequests => Set<FriendRequestEntity>();
    public DbSet<GameInvitationEntity> GameInvitations => Set<GameInvitationEntity>();
    public DbSet<SkinSetEntity> SkinSets => Set<SkinSetEntity>();
    public DbSet<SkinEntity> Skins => Set<SkinEntity>();
    public DbSet<UserSkinEntity> UserSkins => Set<UserSkinEntity>();
    public DbSet<SkinConfigurationEntity> SkinConfigurations => Set<SkinConfigurationEntity>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);
        modelBuilder.ApplyConfigurationsFromAssembly(typeof(AppDbContext).Assembly);
    }
}