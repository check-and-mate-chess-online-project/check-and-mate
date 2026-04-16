using Core.Services.Interfaces;
using Core.Repositories.Interfaces;
using Core.Models.Skins;
using Core.Models.Chess;

namespace Core.Services;

public class SkinService(ISkinRepository skinRepos, ISkinSetRepository skinSetRepos) : ISkinService
{
    private readonly ISkinRepository _skinRepos = skinRepos;
    private readonly ISkinSetRepository _skinSetRepos = skinSetRepos;

    public async Task<Skin?> GetSkinAsync(Guid skinId) => await _skinRepos.GetAsync(skinId);

    public async Task<Dictionary<FigureType, Skin>> GetDefaultSkinsAsync() => await _skinRepos.GetDefaultsAsync();

    public async Task<List<Skin>> GetAllSkinsAsync() => await _skinRepos.GetAllAsync();

    public async Task AddSkinAsync(Guid setId, FigureType figure, SkinRarity rarity)
    {
        Skin skin = new(setId, figure, rarity);
        SkinSet skinSet = await _skinSetRepos.GetAsync(setId) ?? throw new ArgumentException("skin set not exist");
        skinSet.AddSkin(figure, skin.Id);
        _skinRepos.Add(skin);
    }

    public async Task AddSkinSetAsync(string name, string? description = null)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(name);
        if (await _skinSetRepos.GetAsync(name) != null) throw new InvalidOperationException("skin set already exist"); 
        SkinSet skinSet = new(name, description);
        _skinSetRepos.Add(skinSet);
    }
}