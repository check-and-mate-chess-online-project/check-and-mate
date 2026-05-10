using Application.Dtos;
using Core.Models.Chess;

namespace Application.Mappers;

public static class MoveMapper
{
    public static MoveDto ToDto(Move move) => new()
    {
        A = move.A,
        B = move.B,
        X = move.X,
        Y = move.Y,
        Options = MoveOptionsMapper.ToDto([.. move.Options])
    };
}