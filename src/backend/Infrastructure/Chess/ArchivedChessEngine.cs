using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using ChessLib.GameLogic;
using Core.Models.Chess;
using Core.Models.Interfaces;

namespace Infrastructure.Chess;

public class ArchivedChessEngine : IChessEngine
{
    public int MoveCount { get; }
    public List<Ply> Moves { get; }
    public List<Figure> Figures { get; }

    public ArchivedChessEngine(List<PlyEntity> moves)
    {
        Moves = [];
        Figures = [];
        foreach (var ply in moves) Moves.Add(PlyMapper.ToDomain(ply));
        GameHandler game = new();
        Moves.Sort((p1, p2) => p1.MoveNumber.CompareTo(p2.MoveNumber));
        foreach (var ply in Moves) 
            game.MakeMove(ply.Move.A, ply.Move.B, ply.Move.X, ply.Move.Y, [.. ply.Move.Options.Select(ChessMapper.ToEngine)]);
        MoveCount = game.Field.AmountMovesOnField;
        foreach (var figure in game.Field.GetCopyOfField())
        {
            if (figure == null) continue;
            Figures.Add(ChessMapper.ToDomain(figure));
        }
    }

    public ChessMoveResult MakeMove(Move move) => throw new InvalidOperationException("game already over");

    public bool IsValidMove(Move move, PlayerColor playerColor) => throw new InvalidOperationException("game already over");

    public List<Figure> GetFigures() => Figures;

    public List<Ply> GetMoves() => Moves;

    public PlayerColor GetCurrentPlayer() => throw new InvalidOperationException("game already over");
    
    public PlayerColor GetDefendingPlayer() => throw new InvalidOperationException("game already over");
}