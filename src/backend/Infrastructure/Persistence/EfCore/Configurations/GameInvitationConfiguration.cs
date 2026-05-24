using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Metadata.Builders;
using Infrastructure.Persistence.EfCore.Entities;

namespace Infrastructure.Persistence.EfCore.Configurations;

public class GameInvitationConfiguration : IEntityTypeConfiguration<GameInvitationEntity>
{
    public void Configure(EntityTypeBuilder<GameInvitationEntity> builder)
    {
        builder.ToTable("game_invitations");
        builder.HasKey(gi => gi.Id);

        builder.HasOne(gi => gi.Sender)
            .WithMany(u => u.SentGameInvitations)
            .HasForeignKey(gi => gi.SenderId)
            .OnDelete(DeleteBehavior.Cascade);

        builder.HasOne(gi => gi.Receiver)
            .WithMany(u => u.ReceivedGameInvitations)
            .HasForeignKey(gi => gi.ReceiverId)
            .OnDelete(DeleteBehavior.Cascade);
    }
}