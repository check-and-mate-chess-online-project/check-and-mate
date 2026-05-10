using Core.Models.Chess;

namespace Application.Dtos;

public class MoveOptionsDto
{
    public FigureType? SelectedFigure { get; init; }
}