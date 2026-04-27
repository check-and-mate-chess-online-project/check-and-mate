using Core.Repositories;
using Core.Models.Skins;

namespace Application.Orchestration.SkinDrops;

public class SkinDropService(ISkinRepository skinRepos) : ISkinDropService
{
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly List<(SkinRarity rarity, int weight)> _rarityWeights =
    [
        (SkinRarity.Common, 50),
        (SkinRarity.Rare, 30),
        (SkinRarity.Legendary, 20)
    ];

    public async Task<Skin> DropSkinAsync()
    {
        SkinRarity rarity = RollRarity();
        List<Skin> skins = await _skinRepos.GetByRarityAsync(rarity);
        Skin skin = skins[Random.Shared.Next(skins.Count)];
        return skin;
    }

    private SkinRarity RollRarity()
    {
        int totalWeight = _rarityWeights.Sum(x => x.weight);
        int drop = Random.Shared.Next(totalWeight);
        int sum = 0;
        foreach (var (rarity, weight) in _rarityWeights)
        {
            sum += weight;
            if (drop < sum) return rarity;
        }
        return SkinRarity.Common;
    }
}