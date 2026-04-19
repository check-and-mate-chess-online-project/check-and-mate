using Core.Models.Skins;

namespace Core.Repositories;

public interface ISkinSetRepository
{
    Task<SkinSet?> GetAsync(Guid skinSetId);
    Task<SkinSet?> GetAsync(string name);
    Task<List<SkinSet>> GetAllAsync();
    void Add(SkinSet skinSet);
}