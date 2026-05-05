using Core.Models.Interfaces;
using Core.Models.Users;

namespace Application.Models;

public record MatchmakingContext(User User, ITimeControl TimeControl);