using Core.Models.Skins;

namespace Application.Orchestration.Skins;

public interface ISkinDropService
{
    Task<Skin> DropSkinAsync();
}