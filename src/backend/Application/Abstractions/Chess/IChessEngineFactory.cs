using Core.Models.Interfaces;

namespace Application.Abstractions.Chess;

public interface IChessEngineFactory
{
    IChessEngine CreateEngine();
}