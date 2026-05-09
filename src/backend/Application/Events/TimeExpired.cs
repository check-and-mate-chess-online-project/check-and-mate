using Application.Dtos;

namespace Application.Events;

public record TimeExpired(GameDto Game, Guid UserId);