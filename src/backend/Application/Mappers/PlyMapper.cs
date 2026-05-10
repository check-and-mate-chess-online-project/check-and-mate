using Application.Dtos;
using Core.Models.Chess;

namespace Application.Mappers;

public static class PlyMapper
{
    public static PlyDto ToDto(Ply ply) => new()
    {
        MoveNumber = ply.MoveNumber,
        Color = ply.Color,
        Coordinates = [.. ply.Coordinates.Select(MoveMapper.ToDto)]
    };
}