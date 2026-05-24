using Core.Models.Chess;

namespace Application.Dtos;

public class SkinConfigurationDto
{
    public Dictionary<FigureType, SkinDto> UserFigureSkins { get; set; } = [];
}