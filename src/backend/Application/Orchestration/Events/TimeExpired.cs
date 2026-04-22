using Core.Models.Games;

namespace Application.Orchestration.Events;

public record TimeExpired(Guid GameId, Guid UserId);