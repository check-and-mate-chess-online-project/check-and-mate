using Core.Models.Chess;

namespace Infrastructure.Assets.DefaultSkins;

public static class DefaultSkinInfo
{
    private static readonly string _setName = "Earth";
    private static readonly string _setDescription = "Our dear fellow earthlings";
    private static readonly Dictionary<FigureType, (string Name, string Description)> _skinInfo = new()
    {
        { FigureType.King,   ("Gagarin", "First man in space. Leads earthlings to the stars.") },
        { FigureType.Queen,  ("Joan of Arc", "A young heroine, a simple girl from Domrémy whose faith and determination change the course of history. With a sword and a sacred banner in her hands, she leads people forward, remaining a symbol of courage, purity, and unbreakable will.") },
        { FigureType.Rook,   ("Tux Penguinson", "A living deity among terminal dwellers, recompiling kernels as a form of prayer and reading his Git commits as sacred prophecies. Emerged victorious after decades of arguing with strangers on the internet about code quality, operating systems, and why everyone else is wrong. Moves only in straight lines because 'diagonals are feature creep'.") },
        { FigureType.Bishop, ("Pashid Durullaev", "Once an ordinary Caucasian shepherd, Pashid is now a Dagestani techno-messiah. To fund his grand plan for a free internet, he skipped Dubai investors and asked his uncle from Makhachkala to chip in. Owning countless crypto-auls wears him down, so in the evenings he lies in the mountain grass, looks at the stars, and dreams of electric sheep — because the real ones keep forwarding his messages, spend more on beauty treatments than he does, and, most importantly, work for Mossad.") },
        { FigureType.Knight, ("Ksenia Chak-Chak", "She is the daughter of Anatoly Alexandrovich Chak-chak.") },
        { FigureType.Pawn,   ("Magspin Carlson", "Former World Chess Champion. He used to calculate games twenty moves ahead, yet somehow still managed to be late for move one. Then he developed a jam addiction, let himself go, and fully entered his “past his prime but still very confident” era. Before his decisive “brilliant master plan,” he loaded up on jam “for concentration” and promptly fell asleep. The Federation decided that was a bit much, even for a grandmaster, and demoted him to pawn. After that, everything started spinning: a fan on his back, someone else game ahead of him, and no way back.") }
    };

    public static (string Name, string Description) Get(FigureType figure)
    {
        if (!_skinInfo.TryGetValue(figure, out (string, string) info)) throw new ArgumentException("incorrect figure type");
        return info;
    }

    public static string GetSetName() => _setName;

    public static string GetSetDescription() => _setDescription;

    public static string GetName(FigureType figure) => Get(figure).Name;

    public static string GetDescription(FigureType figure) => Get(figure).Description;
}