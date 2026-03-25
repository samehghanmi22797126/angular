using sale_sport.Models;
public class Member
{
	public int Id { get; set; }
	public string Name { get; set; } = null!;
	public int Age { get; set; }
	public string Email { get; set; } = null!;
	public string Password { get; set; } = null!;

	// Relation vers coach
	public int? CoachId { get; set; }
	public Coach? Coach { get; set; }

	public int? SubscriptionId { get; set; }
	public Subscription? Subscription { get; set; }
}