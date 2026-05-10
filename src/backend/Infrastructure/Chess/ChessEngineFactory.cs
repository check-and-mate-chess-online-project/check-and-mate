using Application.Abstractions.Chess;
using Core.Models.Interfaces;

namespace Infrastructure.Chess;

public class ChessEngineFactory : IChessEngineFactory
{
    public IChessEngine CreateEngine() => new ChessEngine();
}