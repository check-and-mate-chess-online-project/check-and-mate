using Application.Models;
using Core.Models.Games;

namespace Application.Orchestration.RatingCalculation;

public interface IRatingCalculator
{
    RatingResult CalculateRating(int whiteRating, int blackRating, GameResult result);
}