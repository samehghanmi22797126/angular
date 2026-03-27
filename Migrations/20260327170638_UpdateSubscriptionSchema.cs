using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace sale_sport.Migrations
{
    /// <inheritdoc />
    public partial class UpdateSubscriptionSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "DurationInMonths",
                table: "Subscriptions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "MemberId",
                table: "Subscriptions",
                type: "INTEGER",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Name",
                table: "Subscriptions",
                type: "TEXT",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<int>(
                name: "CoachId",
                table: "Members",
                type: "INTEGER",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Subscriptions_MemberId",
                table: "Subscriptions",
                column: "MemberId",
                unique: true);

            migrationBuilder.CreateIndex(
                name: "IX_Members_CoachId",
                table: "Members",
                column: "CoachId");

            migrationBuilder.AddForeignKey(
                name: "FK_Members_Coaches_CoachId",
                table: "Members",
                column: "CoachId",
                principalTable: "Coaches",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Subscriptions_Members_MemberId",
                table: "Subscriptions",
                column: "MemberId",
                principalTable: "Members",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Members_Coaches_CoachId",
                table: "Members");

            migrationBuilder.DropForeignKey(
                name: "FK_Subscriptions_Members_MemberId",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Subscriptions_MemberId",
                table: "Subscriptions");

            migrationBuilder.DropIndex(
                name: "IX_Members_CoachId",
                table: "Members");

            migrationBuilder.DropColumn(
                name: "DurationInMonths",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "MemberId",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "Name",
                table: "Subscriptions");

            migrationBuilder.DropColumn(
                name: "CoachId",
                table: "Members");
        }
    }
}
