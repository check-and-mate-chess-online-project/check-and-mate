using Application.Models;
using Core.Models.Chess;
using Core.Models.Games;

namespace Application.Orchestration.RatingCalculation;

public class RatingCalculator : IRatingCalculator
{
    private readonly int _k = 15;

    public RatingResult CalculateRating(int whiteRating, int blackRating, GameResult result)
    {
        int whiteRatingDelta = 0;
        int blackRatingDelta = 0;
        switch (result)
        {
            case GameResult.WhiteVictory: 
                whiteRatingDelta = CalculateRatingDelta(whiteRating, blackRating, PlayerResult.Win);
                blackRatingDelta = CalculateRatingDelta(blackRating, whiteRating, PlayerResult.Loss);
                break;
            case GameResult.BlackVictory: 
                whiteRatingDelta = CalculateRatingDelta(whiteRating, blackRating, PlayerResult.Loss);
                blackRatingDelta = CalculateRatingDelta(blackRating, whiteRating, PlayerResult.Win);
                break;
            case GameResult.Draw:
                whiteRatingDelta = CalculateRatingDelta(whiteRating, blackRating, PlayerResult.Draw);
                blackRatingDelta = CalculateRatingDelta(blackRating, whiteRating, PlayerResult.Draw);
                break;
        }
        return new RatingResult(whiteRatingDelta, blackRatingDelta);
    }

    private int CalculateRatingDelta(int rating, int opponentRating, PlayerResult result) 
        => (int)(_k * (GetScore(result) - PointsPercentage(rating - opponentRating)));

    private double PointsPercentage(int ratingRange)
    {
        double percent = (ratingRange / 750.0) + 0.5;
        if (percent > 1.0) percent = 1.0;
        if (percent < 0.0) percent = 0.0;
        return percent;
    }

    private double GetScore(PlayerResult result)
    {
        return result switch
        {
            PlayerResult.Win => 1,
            PlayerResult.Loss => 0,
            PlayerResult.Draw => 0.5,
            _ => throw new ArgumentException("invalid player result type")
        };
    }
}