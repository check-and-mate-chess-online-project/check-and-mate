using Core.Models.Chess;

namespace Core.Models.Skins;

public class SkinConfiguration(Guid userId, Dictionary<FigureType, Guid> figureSkinIds)
{
    public Guid UserId { get; } = userId;
    public IReadOnlyDictionary<FigureType, Guid> UserFigureSkinIds => _figureSkinIds;
    private readonly Dictionary<FigureType, Guid> _figureSkinIds = figureSkinIds;

    public void ChangeFigureSkin(FigureType figure, Guid skinId) => _figureSkinIds[figure] = skinId;
}