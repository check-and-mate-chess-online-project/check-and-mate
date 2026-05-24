using Core.Exceptions;

namespace Application.Orchestration.InputStringValidation;

public class PasswordValidator : IValidator
{
    public void Check(string password)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        if (password.Length < 4)
            throw new CoreLogicException("password must be at least 4 characters long");
    }
}