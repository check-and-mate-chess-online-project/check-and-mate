using Infrastructure.Persistence.EfCore.Entities;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Microsoft.EntityFrameworkCore;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class GameConfiguration : IEntityTypeConfiguration<GameEntity>
{
    public void Configure(EntityTypeBuilder<GameEntity> builder)
    {
        builder.ToTable("games");
        builder.HasKey(g => g.Id);

        builder.HasOne(g => g.WhitePlayer)
            .WithMany(u => u.WhiteGames)
            .HasForeignKey(g => g.WhitePlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(g => g.BlackPlayer)
            .WithMany(u => u.BlackGames)
            .HasForeignKey(g => g.BlackPlayerId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.Property(g => g.Moves)
            .IsRequired(false)
            .HasColumnType("jsonb");

        builder.Property(g => g.Result)
            .IsRequired(false);

        builder.Property(g => g.TerminationReason)
            .IsRequired(false);

        builder.Property(g => g.InitialTimeSec)
            .IsRequired(false);

        builder.Property(g => g.IncrementPerMoveSec)
            .IsRequired(false);
            
        builder.Property(g => g.StartTimeUtc)
            .IsRequired(false)
            .HasColumnType("timestamptz");

        builder.Property(g => g.EndTimeUtc)
            .IsRequired(false)
            .HasColumnType("timestamptz");
    }
}