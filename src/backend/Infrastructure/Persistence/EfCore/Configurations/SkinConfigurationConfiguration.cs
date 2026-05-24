using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class SkinConfigurationConfiguration : IEntityTypeConfiguration<SkinConfigurationEntity>
{
    public void Configure(EntityTypeBuilder<SkinConfigurationEntity> builder)
    {
        builder.ToTable("skin_configurations");
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