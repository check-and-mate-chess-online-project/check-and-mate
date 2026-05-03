using Core.Models.Chess;

namespace Presentation.Requests;

public record EquipSkinRequest(FigureType Figure, Guid SkinId);