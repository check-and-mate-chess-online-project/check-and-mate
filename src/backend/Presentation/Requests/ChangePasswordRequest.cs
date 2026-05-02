namespace Presentation.Requests;

public record ChangePasswordRequest(string OldPassword, string NewPassword);