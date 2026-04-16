namespace Application.Services.Interfaces;

public interface IUserDeletionService
{
    Task DeleteUser(Guid userId);
}