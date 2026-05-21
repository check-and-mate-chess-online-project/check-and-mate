using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class UserFigureSkinConfiguration : IEntityTypeConfiguration<UserFigureSkinEntity>
{
    public void Configure(EntityTypeBuilder<UserFigureSkinEntity> builder)
    {
        builder.ToTable("user_figure_skins");
        builder.HasKey(ufs => new {ufs.UserId, ufs.Figure});

        builder.HasOne(ufs => ufs.User)
            .WithMany(u => u.EquippedSkins)
            .HasForeignKey(ufs => ufs.UserId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(ufs => ufs.Skin)
            .WithMany()
            .HasForeignKey(ufs => ufs.SkinId)
            .OnDelete(DeleteBehavior.Restrict);
    }
}