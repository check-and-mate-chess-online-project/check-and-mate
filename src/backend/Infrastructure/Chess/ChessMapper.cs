using Core.Models.Chess;
using Core.Models.Interfaces;

namespace Infrastructure.Chess;

public static class ChessMapper
{
    public static ChessLib.MoveOptions.MoveOption ToEngine(IMoveOption option)
    {
        return option switch
        {
            ReplacementOption => new ChessLib.MoveOptions.ReplacementOption(((ChessLib.MoveOptions.ReplacementOption)option).SelectedFigure),
            _ => throw new ArgumentException("invalid option type")
        };
    }

    public static ChessGameTerminationReason FromEngine(ChessLib.Entities.TerminalPositionType type)
    {
        return type switch
        {
            ChessLib.Entities.TerminalPositionType.CheckMate => ChessGameTerminationReason.CheckMate,
            ChessLib.Entities.TerminalPositionType.StaleMate => ChessGameTerminationReason.StaleMate,
            _ => throw new ArgumentException("invalid terminal position type")
        };
    }

    public static ChessLib.Entities.Color ToEngine(PlayerColor color)
    {
        return color switch
        {
            PlayerColor.White => ChessLib.Entities.Color.White,
            PlayerColor.Black => ChessLib.Entities.Color.Black,
            _ => throw new ArgumentException("invalid player color")
        };
    }

    public static PlayerColor FromEngine(ChessLib.Entities.Color color)
    {
        return color switch
        {
            ChessLib.Entities.Color.White => PlayerColor.White,
            ChessLib.Entities.Color.Black => PlayerColor.Black,
            _ => throw new ArgumentException("invalid player color")
        };
    }

    public static FigureType FromEngine(ChessLib.Entities.FigureType type)
    {
        return type switch
        {
            ChessLib.Entities.FigureType.King => FigureType.King,
            ChessLib.Entities.FigureType.Queen => FigureType.Queen,
            ChessLib.Entities.FigureType.Rook => FigureType.Rook,
            ChessLib.Entities.FigureType.Bishop => FigureType.Bishop,
            ChessLib.Entities.FigureType.Knight => FigureType.Knight,
            ChessLib.Entities.FigureType.Pawn => FigureType.Pawn,
            _ => throw new ArgumentException("invalid figure type")
        };
    }


}