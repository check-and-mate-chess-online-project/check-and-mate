namespace Application.Orchestration.Settings;

public interface IGameSettingsProvider
{
    int LootBoxPrice { get; init; }
    int DuplicateSkinReward { get; init; }
    int GameWinReward { get; init; }
    int GameLoseReward { get; init; }
    int RatingRange { get; init; }
}