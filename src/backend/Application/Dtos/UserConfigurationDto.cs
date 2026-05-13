using Core.Models.Chess;

namespace Application.Dtos;

public class UserConfigurationDto
{
    public Dictionary<FigureType, SkinDto> UserFigureSkins { get; set; } = null!;
}