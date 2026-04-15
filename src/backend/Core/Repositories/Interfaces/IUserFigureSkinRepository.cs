using Core.Models.Chess;
using Core.Models.Skins;

namespace Core.Repositories.Interfaces;

public interface IUserFigureSkinRepository
{
    Task<Skin?> GetAsync(Guid userId, FigureType figure);
    Task<List<Skin>> GetByUserIdAsync(Guid userId);
    void Initialize(Guid userId, Dictionary<FigureType, Guid> figureSkins);
    void Update(Guid userId, FigureType figure, Guid skinId);
}