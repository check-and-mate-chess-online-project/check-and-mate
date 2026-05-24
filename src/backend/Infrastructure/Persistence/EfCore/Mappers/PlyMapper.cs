using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Chess;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class PlyMapper
{
    public static Ply ToDomain(PlyEntity plyEntity) 
        => new(plyEntity.N, (PlayerColor)plyEntity.P, MoveMapper.ToDomain(plyEntity.M));

    public static PlyEntity ToDb(Ply ply)
    {
        PlyEntity plyEntity = new()
        {
            N = ply.MoveNumber,
            P = (int)ply.Color,
            M = MoveMapper.ToDb(ply.Move)
        };
        return plyEntity;
    }
}