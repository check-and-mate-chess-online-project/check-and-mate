using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Application.Abstractions.UnitOfWork;
using Infrastructure.Assets.Loaders;
using Infrastructure.Assets.DefaultSkins;
using Core.Models.Skins;
using Core.Models.Chess;
using Core.Repositories;

namespace Infrastructure.Background;

public class DatabaseSeeder(IServiceScopeFactory scopeFactory) : IHostedService
{
    private readonly IServiceScopeFactory _scopeFactory = scopeFactory;

    public async Task StartAsync(CancellationToken token)
    {
        using IServiceScope scope = _scopeFactory.CreateScope();
        IUnitOfWork uow = scope.ServiceProvider.GetRequiredService<IUnitOfWork>();
        ISkinSetRepository skinSetRepos = scope.ServiceProvider.GetRequiredService<ISkinSetRepository>();
        if ((await skinSetRepos.GetAllAsync()).Any()) return;
        SkinSet skinSet = new(DefaultSkinInfo.GetSetName(), DefaultSkinInfo.GetSetDescription());
        skinSetRepos.Add(skinSet);
        ISkinRepository skinRepos = scope.ServiceProvider.GetRequiredService<ISkinRepository>();
        IDefaultSkinAssetsLoader assetsLoader = scope.ServiceProvider.GetRequiredService<IDefaultSkinAssetsLoader>();
        foreach (var figure in Enum.GetValues<FigureType>())
        {
            Skin skin = new
            (
                skinSet.Id,
                DefaultSkinInfo.GetName(figure),
                DefaultSkinInfo.GetDescription(figure),
                figure,
                SkinRarity.Common,
                new SkinAssets
                (
                    assetsLoader.Load(figure, SkinImageType.WhiteBoard),
                    assetsLoader.Load(figure, SkinImageType.BlackBoard),
                    assetsLoader.Load(figure, SkinImageType.Idle),
                    assetsLoader.Load(figure, SkinImageType.StartFightWin),
                    assetsLoader.Load(figure, SkinImageType.StartFightLose),
                    assetsLoader.Load(figure, SkinImageType.EndFightWin),
                    assetsLoader.Load(figure, SkinImageType.EndFightLose)
                ),
                true
            );
            skinRepos.Add(skin);
        }
        await uow.CommitChangesAsync();
    }

    public Task StopAsync(CancellationToken token) => Task.CompletedTask;
}