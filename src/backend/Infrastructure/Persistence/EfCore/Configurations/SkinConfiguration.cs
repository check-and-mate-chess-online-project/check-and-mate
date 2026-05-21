using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class SkinConfiguration : IEntityTypeConfiguration<SkinEntity>
{
    public void Configure(EntityTypeBuilder<SkinEntity> builder)
    {
        builder.ToTable("skins");
        builder.HasKey(s => s.Id);

        builder.HasOne(s => s.Set)
            .WithMany(ss => ss.Skins)
            .HasForeignKey(s => s.SetId)
            .OnDelete(DeleteBehavior.Cascade);
        
        builder.Property(s => s.Name)
            .IsRequired()
            .HasMaxLength(25);
        
        builder.Property(s => s.Description)
            .IsRequired(false)
            .HasMaxLength(255);
        
        builder.Property(s => s.WhiteBoardImage).IsRequired();
        builder.Property(s => s.BlackBoardImage).IsRequired();
        builder.Property(s => s.IdleImage).IsRequired();
        builder.Property(s => s.StartFightWinImage).IsRequired();
        builder.Property(s => s.StartFightLoseImage).IsRequired();
        builder.Property(s => s.EndFightWinImage).IsRequired();
        builder.Property(s => s.EndFightLoseImage).IsRequired();
    }
}