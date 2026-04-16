using Core.Models.Chess;

namespace Core.Models.Users;

public class User
{
    public Guid Id { get; private set; }
    public string Login { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public string Email { get; private set; } = null!;
    public int Rating { get; private set; } = 500;
    public int Balance { get; private set; } = 0;
    public int LootBoxCount { get; private set; } = 0;
    public UserRole Role { get; private set; }

    internal User(string login, string passwordHash, string email, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(login)) throw new ArgumentException("login cannot be empty");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("password hash cannot be empty");
        Id = Guid.NewGuid();
        Login = login;
        PasswordHash = passwordHash;
        Email = email;
        Role = role;
    }

    public void ChangeRating(int delta) => Rating = Math.Max(0, Rating + delta);

    public void AddBalance(int amount)
    {
        if (amount <= 0) throw new ArgumentException("amount must be positive");
        Balance += amount;
    }

    public void SpendBalance(int amount)
    {
        if (amount <= 0) throw new ArgumentException("amount must be positive");
        if (Balance < amount) throw new InvalidOperationException("not enough balance"); 
        Balance -= amount;
    }

    public void AddLootBoxes(int count)
    {
        if (count <= 0) throw new ArgumentException("count must be positive");
        LootBoxCount += count;
    }

    public void OpenLootBox()
    {
        if (LootBoxCount == 0) throw new InvalidOperationException("no lootboxes");
        LootBoxCount--;
    }

    public void ChangeRole(UserRole role) => Role = role;

    internal void ChangeLogin(string login)
    {
        if (string.IsNullOrWhiteSpace(login)) throw new ArgumentException("login cannot be empty");
        Login = login;
    }

    internal void ChangePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("password hash cannot be empty");
        PasswordHash = passwordHash;
    }

    internal void ChangeEmail(string email)
    {
        if (string.IsNullOrWhiteSpace(email)) throw new ArgumentException("email cannot be empty");
        Email = email;
    }
}