using Core.Models.Skins;

namespace Core.Repositories;

public interface ISkinConfigurationRepository
{
    Task<SkinConfiguration?> GetAsync(Guid userId);
    void Add(SkinConfiguration skinConfiguration);
    Task Update(SkinConfiguration skinConfiguration);
}