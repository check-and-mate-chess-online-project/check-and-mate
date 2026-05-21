using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class InitialCreate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "skin_sets",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skin_sets", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "users",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    Login = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    PasswordHash = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Email = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: false),
                    Rating = table.Column<int>(type: "integer", nullable: false),
                    Balance = table.Column<int>(type: "integer", nullable: false),
                    LootBoxCount = table.Column<int>(type: "integer", nullable: false),
                    Role = table.Column<int>(type: "integer", nullable: false),
                    IsDeleted = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_users", x => x.Id);
                });

            migrationBuilder.CreateTable(
                name: "skins",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    SetId = table.Column<Guid>(type: "uuid", nullable: false),
                    Name = table.Column<string>(type: "character varying(25)", maxLength: 25, nullable: false),
                    Description = table.Column<string>(type: "character varying(255)", maxLength: 255, nullable: true),
                    Figure = table.Column<int>(type: "integer", nullable: false),
                    Rarity = table.Column<int>(type: "integer", nullable: false),
                    WhiteBoardImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    BlackBoardImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    IdleImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    StartFightWinImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    StartFightLoseImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    EndFightWinImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    EndFightLoseImage = table.Column<byte[]>(type: "bytea", nullable: false),
                    IsDefault = table.Column<bool>(type: "boolean", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_skins", x => x.Id);
                    table.ForeignKey(
                        name: "FK_skins_skin_sets_SetId",
                        column: x => x.SetId,
                        principalTable: "skin_sets",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "friend_requests",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_friend_requests", x => x.Id);
                    table.ForeignKey(
                        name: "FK_friend_requests_users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_friend_requests_users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "friends",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    FriendId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_friends", x => new { x.UserId, x.FriendId });
                    table.ForeignKey(
                        name: "FK_friends_users_FriendId",
                        column: x => x.FriendId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_friends_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "game_invitations",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    ReceiverId = table.Column<Guid>(type: "uuid", nullable: false),
                    SenderId = table.Column<Guid>(type: "uuid", nullable: false),
                    State = table.Column<int>(type: "integer", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_game_invitations", x => x.Id);
                    table.ForeignKey(
                        name: "FK_game_invitations_users_ReceiverId",
                        column: x => x.ReceiverId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_game_invitations_users_SenderId",
                        column: x => x.SenderId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "games",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uuid", nullable: false),
                    WhitePlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    BlackPlayerId = table.Column<Guid>(type: "uuid", nullable: false),
                    Moves = table.Column<string>(type: "jsonb", nullable: true),
                    Result = table.Column<int>(type: "integer", nullable: true),
                    TerminationReason = table.Column<int>(type: "integer", nullable: true),
                    InitialTimeSec = table.Column<int>(type: "integer", nullable: true),
                    IncrementPerMoveSec = table.Column<int>(type: "integer", nullable: true),
                    StartTimeUtc = table.Column<DateTime>(type: "timestamptz", nullable: true),
                    EndTimeUtc = table.Column<DateTime>(type: "timestamptz", nullable: true)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_games", x => x.Id);
                    table.ForeignKey(
                        name: "FK_games_users_BlackPlayerId",
                        column: x => x.BlackPlayerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_games_users_WhitePlayerId",
                        column: x => x.WhitePlayerId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                });

            migrationBuilder.CreateTable(
                name: "user_figure_skins",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    Figure = table.Column<int>(type: "integer", nullable: false),
                    SkinId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_figure_skins", x => new { x.UserId, x.Figure });
                    table.ForeignKey(
                        name: "FK_user_figure_skins_skins_SkinId",
                        column: x => x.SkinId,
                        principalTable: "skins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_figure_skins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateTable(
                name: "user_skins",
                columns: table => new
                {
                    UserId = table.Column<Guid>(type: "uuid", nullable: false),
                    SkinId = table.Column<Guid>(type: "uuid", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_user_skins", x => new { x.UserId, x.SkinId });
                    table.ForeignKey(
                        name: "FK_user_skins_skins_SkinId",
                        column: x => x.SkinId,
                        principalTable: "skins",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Restrict);
                    table.ForeignKey(
                        name: "FK_user_skins_users_UserId",
                        column: x => x.UserId,
                        principalTable: "users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_friend_requests_ReceiverId",
                table: "friend_requests",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_friend_requests_SenderId",
                table: "friend_requests",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_friends_FriendId",
                table: "friends",
                column: "FriendId");

            migrationBuilder.CreateIndex(
                name: "IX_game_invitations_ReceiverId",
                table: "game_invitations",
                column: "ReceiverId");

            migrationBuilder.CreateIndex(
                name: "IX_game_invitations_SenderId",
                table: "game_invitations",
                column: "SenderId");

            migrationBuilder.CreateIndex(
                name: "IX_games_BlackPlayerId",
                table: "games",
                column: "BlackPlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_games_WhitePlayerId",
                table: "games",
                column: "WhitePlayerId");

            migrationBuilder.CreateIndex(
                name: "IX_skins_SetId",
                table: "skins",
                column: "SetId");

            migrationBuilder.CreateIndex(
                name: "IX_user_figure_skins_SkinId",
                table: "user_figure_skins",
                column: "SkinId");

            migrationBuilder.CreateIndex(
                name: "IX_user_skins_SkinId",
                table: "user_skins",
                column: "SkinId");

            migrationBuilder.CreateIndex(
                name: "IX_users_Email",
                table: "users",
                column: "Email",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_users_Login",
                table: "users",
                column: "Login",
                unique: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "friend_requests");

            migrationBuilder.DropTable(
                name: "friends");

            migrationBuilder.DropTable(
                name: "game_invitations");

            migrationBuilder.DropTable(
                name: "games");

            migrationBuilder.DropTable(
                name: "user_figure_skins");

            migrationBuilder.DropTable(
                name: "user_skins");

            migrationBuilder.DropTable(
                name: "skins");

            migrationBuilder.DropTable(
                name: "users");

            migrationBuilder.DropTable(
                name: "skin_sets");
        }
    }
}
