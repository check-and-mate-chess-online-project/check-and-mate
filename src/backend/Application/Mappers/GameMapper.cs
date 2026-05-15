using Application.Dtos;
using Core.Models.Games;
using Core.Models.Users;
using Core.Repositories;

namespace Application.Mappers;

public static class GameMapper
{
    public static async Task<GameDto> ToDto(Game game, IUserRepository userRepos)
    {
        User whitePlayer = await userRepos.GetAsync(game.WhitePlayerId) 
            ?? throw new InvalidOperationException($"user {game.WhitePlayerId} not exist");
        User blackPlayer = await userRepos.GetAsync(game.BlackPlayerId) 
            ?? throw new InvalidOperationException($"user {game.BlackPlayerId} not exist");
        GameDto gameDto = new()
        {
            Id = game.Id,
            WhitePlayer = UserPublicMapper.ToDto(whitePlayer),
            BlackPlayer = UserPublicMapper.ToDto(blackPlayer),
            Result = game.Result,
            TerminationReason = game.TerminationReason,
            StartTimeUtc = game.StartTimeUtc,
            EndTimeUtc = game.EndTimeUtc,
            TimeControlIsEnabled = game.TimeControl.IsEnabled,
            InitialTimeSec = game.TimeControl.InitialTimeSec,
            IncrementPerMoveSec = game.TimeControl.IncrementPerMoveSec,
            Figures = [.. game.GetFigures().Select(FigureMapper.ToDto)],
            Moves = [.. game.GetMoves().Select(PlyMapper.ToDto)]
        };
        return gameDto;
    }
}