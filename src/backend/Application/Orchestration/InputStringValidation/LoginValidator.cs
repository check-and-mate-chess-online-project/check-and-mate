using System.Text.RegularExpressions;
using Core.Exceptions;

namespace Application.Orchestration.InputStringValidation;

public partial class LoginValidator : IValidator
{
    public void Check(string login)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(login);
        if (!GetPattern().IsMatch(login)) 
            throw new CoreLogicException("login must contains only letters, numbers and underscores");
    }

    [GeneratedRegex("^[a-zA-Z0-9_]+$")]
    private static partial Regex GetPattern();
}