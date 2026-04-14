using Core.Models.Skins;
using Core.Models.Chess;

namespace Core.Services.Interfaces;

public interface ISkinService
{
    Task<Skin?> GetSkinAsync(Guid skinId);
    Task<List<Skin>> GetAllSkinsAsync();
    Task AddSkinAsync(Guid setId, FigureType figure, SkinRarity rarity);
    Task AddSkinSetAsync(string name, string? description = null);
}