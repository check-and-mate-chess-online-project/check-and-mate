namespace Application.Events;

public record TimeExpired(Guid GameId, Guid UserId);