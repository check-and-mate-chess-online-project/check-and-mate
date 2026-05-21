using Infrastructure.Persistence.EfCore.Entities;
using Core.Models.Chess;
using Core.Models.Interfaces;

namespace Infrastructure.Persistence.EfCore.Mappers;

public static class MoveMapper
{
    public static MoveEntity ToDb(Move move)
    {
        MoveEntity moveEntity = new()
        {
            A = move.A,
            B = move.B,
            X = move.X,
            Y = move.Y
        };
        ReplacementOption? replacement = move.Options.OfType<ReplacementOption>().FirstOrDefault();
        if (replacement != null) moveEntity.O = new MoveOptionsEntity{ R = replacement.SelectedFigure.ToString() };
        return moveEntity;
    }

    public static Move ToDomain(MoveEntity moveEntity)
    {
        List<IMoveOption> options = [];
        if (moveEntity.O?.R != null && Enum.TryParse(moveEntity.O.R, out FigureType figure))
            options.Add(new ReplacementOption(figure));
        return new Move(moveEntity.A, moveEntity.B, moveEntity.X, moveEntity.Y, options);
    }
}