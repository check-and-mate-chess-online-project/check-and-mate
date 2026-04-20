using Core.Models.Games;

namespace Application.Orchestration.Events;

public record TimeExpired(Game Game, Guid UserId);