using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class FriendConfiguration : IEntityTypeConfiguration<FriendshipEntity>
{
    public void Configure(EntityTypeBuilder<FriendshipEntity> builder)
    {
        builder.ToTable("friends");
        builder.HasKey(f => new { f.UserId, f.FriendId });

        builder.HasOne(f => f.User)
            .WithMany(u => u.Friends)
            .HasForeignKey(f => f.UserId)
            .OnDelete(DeleteBehavior.Restrict);

        builder.HasOne(f => f.Friend)
            .WithMany(u => u.FriendOf)
            .HasForeignKey(f => f.FriendId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}