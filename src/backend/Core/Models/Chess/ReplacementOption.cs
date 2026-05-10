using Core.Models.Interfaces;

namespace Core.Models.Chess;

public class ReplacementOption(FigureType figure) : IMoveOption
{
    public FigureType SelectedFigure { get; init; } = figure;
}