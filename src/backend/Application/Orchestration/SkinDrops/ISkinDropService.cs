using Core.Models.Skins;

namespace Application.Orchestration.SkinDrops;

public interface ISkinDropService
{
    Task<Skin> DropSkinAsync();
}