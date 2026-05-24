using System.ComponentModel.DataAnnotations;
using Core.Exceptions;

namespace Application.Orchestration.InputStringValidation;

public class EmailValidator : IValidator
{
    private readonly EmailAddressAttribute _email = new();

    public void Check(string email)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(email);
        if (!_email.IsValid(email))
            throw new CoreLogicException("invalid email format");
    }
}