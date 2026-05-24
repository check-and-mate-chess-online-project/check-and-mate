using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class UserSkinConfiguration : IEntityTypeConfiguration<UserSkinEntity>
{
    public void Configure(EntityTypeBuilder<UserSkinEntity> builder)
    {
        builder.ToTable("user_skins");
        builder.HasKey(us => new { us.UserId, us.SkinId });

        builder.HasOne(us => us.User)
            .WithMany(u => u.OwnedSkins)
            .HasForeignKey(us => us.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(us => us.Skin)
            .WithMany(s => s.Owners)
            .HasForeignKey(us => us.SkinId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}