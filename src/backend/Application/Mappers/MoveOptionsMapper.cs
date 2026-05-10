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

    public static MoveOptionsDto ToDto(List<IMoveOption> options)
    {
        MoveOptionsDto optionsDto = new();
        foreach (var option in options)
        {
            switch (option)
            {
                case ReplacementOption: 
                    optionsDto.SelectedFigure = ((ReplacementOption)option).SelectedFigure;
                    break;
            }
        }
        return optionsDto;
    }
}