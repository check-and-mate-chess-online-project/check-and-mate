using Microsoft.Extensions.Options;
using Application.Abstractions.Settings;

namespace Infrastructure.Settings;

public class GameSettingsProvider(IOptions<GameSettings> options) : IGameSettingsProvider
{
    private readonly GameSettings _settings = options.Value;

    public int LootBoxPrice => _settings.LootBoxPrice;
    public int DuplicateSkinReward => _settings.DuplicateSkinReward;
    public int GameWinReward => _settings.GameWinReward;
    public int GameLoseReward => _settings.GameLoseReward;
    public int RatingRange => _settings.RatingRange;
}