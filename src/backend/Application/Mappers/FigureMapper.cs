using Application.Dtos;
using Core.Models.Chess;

namespace Application.Mappers;

public static class FigureMapper
{
    public static FigureDto ToDto(Figure figure) => new()
    {
        A = figure.A,
        B = figure.B,
        Type = figure.Type,
        Color = figure.Color
    };
}