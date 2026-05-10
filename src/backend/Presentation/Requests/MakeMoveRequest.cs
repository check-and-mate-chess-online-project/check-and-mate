using Application.Dtos;

namespace Presentation.Requests;

public record MakeMoveRequest(int A, int B, int X, int Y, MoveOptionsDto Options);