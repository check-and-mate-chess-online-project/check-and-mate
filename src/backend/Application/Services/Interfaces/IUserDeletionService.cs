namespace Application.Services.Interfaces;

public interface IUserDeletionService
{
    Task DeleteAsync(Guid userId);
}