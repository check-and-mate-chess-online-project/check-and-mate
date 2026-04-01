namespace Core.Models;

public class User
{
    public int Id { get; private set; }
    public string Login { get; private set; } = null!;
    public string PasswordHash { get; private set; } = null!;
    public int Rating { get; private set; }
    public int Balance { get; private set; }
    public int LootBoxCount { get; private set; }
    public UserRole Role { get; private set; }
    private readonly int _defaultRating = 500;
    private readonly int _defaultBalance = 0;
    private readonly int _defaultLootBoxCount = 0;

    public User(string login, string passwordHash, UserRole role)
    {
        if (string.IsNullOrWhiteSpace(login)) throw new ArgumentException("login cannot be empty");
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("password hash cannot be empty");

        Login = login;
        PasswordHash = passwordHash;
        Rating = _defaultRating;
        Balance = _defaultBalance;
        LootBoxCount = _defaultLootBoxCount;
        Role = role;
    }

    private User() {}

    public void ChangeLogin(string login)
    {
        if (string.IsNullOrWhiteSpace(login)) throw new ArgumentException("login cannot be empty");
        Login = login;
    }

    public void ChangePasswordHash(string passwordHash)
    {
        if (string.IsNullOrWhiteSpace(passwordHash)) throw new ArgumentException("password hash cannot be empty");
        PasswordHash = passwordHash;
    }

    public void ChangeRating(int diff)
    {
        Rating += diff;
        if (Rating < 0) Rating = 0;
    }

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

    public void ChangeRole(UserRole role)
    {
        Role = role;
    }
}