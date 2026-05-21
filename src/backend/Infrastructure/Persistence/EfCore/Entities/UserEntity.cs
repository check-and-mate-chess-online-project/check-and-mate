namespace Infrastructure.Persistence.EfCore.Entities;

public class UserEntity
{
    public Guid Id { get; private set; }
    public string Login { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public int Rating { get; private set; }
    public int Balance { get; private set; }
    public int LootBoxCount { get; private set; }
    public int Role { get; private set; }
    public bool IsDeleted { get; private set; }

    public ICollection<GameEntity> WhiteGames { get; private set; } = [];
    public ICollection<GameEntity> BlackGames { get; private set; } = [];
    public ICollection<FriendEntity> Friends { get; private set; } = [];
    public ICollection<FriendEntity> FriendOf { get; private set; } = [];
    public ICollection<FriendRequestEntity> SentFriendRequests { get; private set; } = [];
    public ICollection<FriendRequestEntity> ReceivedFriendRequests { get; private set; } = [];
    public ICollection<GameInvitationEntity> SentGameInvitations { get; private set; } = [];
    public ICollection<GameInvitationEntity> ReceivedGameInvitations { get; private set; } = [];
    public ICollection<UserSkinEntity> OwnedSkins { get; private set; } = [];
    public ICollection<UserFigureSkinEntity> EquippedSkins { get; private set; } = [];

    private UserEntity() {}
}