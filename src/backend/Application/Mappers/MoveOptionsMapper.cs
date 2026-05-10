using Application.Dtos;
using Core.Models.Chess;
using Core.Models.Interfaces;

namespace Application.Mappers;

public static class MoveOptionsMapper
{
    public static List<IMoveOption> ToDomain(MoveOptionsDto optionsDto)
    {
        List<IMoveOption> options = [];
        if (optionsDto.SelectedFigure != null) options.Add(new ReplacementOption((FigureType)optionsDto.SelectedFigure));
        return options;
    }
}