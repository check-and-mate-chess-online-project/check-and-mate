namespace Application.Abstractions.Settings;

public interface IGameSettingsProvider
{
    int LootBoxPrice { get; }
    int DuplicateSkinReward { get; }
    int GameWinReward { get; }
    int GameLoseReward { get; }
    int RatingRange { get; }
}