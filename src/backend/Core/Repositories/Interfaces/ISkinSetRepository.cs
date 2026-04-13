using Core.Models.Skins;

namespace Core.Repositories.Interfaces;

public interface ISkinSetRepository
{
    Task<SkinSet> GetAsync(Guid skinSetId);
    Task<List<SkinSet>> GetAllAsync();
    Task AddAsync(SkinSet skinSet);
}