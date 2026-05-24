using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Infrastructure.Persistence.EfCore.Context;
using Infrastructure.Persistence.EfCore.Entities;
using Infrastructure.Persistence.EfCore.Mappers;
using Core.Models.Users;
using Core.Repositories;

namespace Infrastructure.Persistence.EfCore.Repositories;

public class UserRepository(AppDbContext context) : IUserRepository
{
    private readonly AppDbContext _context = context;

    public async Task<User?> GetAsync(Guid userId)
    {
        UserEntity? user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        return user != null ? UserMapper.ToDomain(user) : null;
    }

    public async Task<User?> GetAsync(string login)
    {
        UserEntity? user = await _context.Users.FirstOrDefaultAsync(u => u.Login == login);
        return user != null ? UserMapper.ToDomain(user) : null;
    }

    public async Task<User?> GetByEmailAsync(string email)
    {
        UserEntity? user = await _context.Users.FirstOrDefaultAsync(u => u.Email == email);
        return user != null ? UserMapper.ToDomain(user) : null;
    }

    public void Add(User user) => _context.Users.Add(UserMapper.ToDb(user));
    
    public async Task Update(User user)
    {
        UserEntity userEntity = UserMapper.ToDb(user);
        EntityEntry<UserEntity>? existingEntry = _context.ChangeTracker.Entries<UserEntity>()
            .FirstOrDefault(e => e.Entity.Id == userEntity.Id);
        if (existingEntry != null)
        {
            existingEntry.CurrentValues.SetValues(userEntity);
        }
        else
        {
            _context.Users.Attach(userEntity);
            _context.Entry(userEntity).State = EntityState.Modified;
        }
    }
}