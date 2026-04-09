namespace Core.Models.Games;

public enum GameTerminationReason
{
    CheckMate = 1,
    StaleMate = 2,
    Resignation = 3,
    Timeout = 4,
    DrawAgreement = 5,
    Disconnect = 6
}