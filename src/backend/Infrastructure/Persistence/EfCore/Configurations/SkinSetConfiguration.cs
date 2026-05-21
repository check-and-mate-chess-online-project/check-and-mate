using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class SkinSetConfiguration : IEntityTypeConfiguration<SkinSetEntity>
{
    public void Configure(EntityTypeBuilder<SkinSetEntity> builder)
    {
        builder.ToTable("skin_sets");
        builder.HasKey(ss => ss.Id);

        builder.Property(ss => ss.Name)
            .IsRequired()
            .HasMaxLength(25);
        
        builder.Property(ss => ss.Description)
            .IsRequired(false)
            .HasMaxLength(255);
    }
}