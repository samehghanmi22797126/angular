namespace sale_sport.Models;

public class Subscription
{

	public int Id { get; set; }

	[Required]
	public string Name { get; set; } = null!;

	[Required]
	public int DurationInMonths { get; set; }

	[Required]
	public decimal Price { get; set; }

	public Member Member { get; set; } = null!;

	public ICollection<Member> Members { get; set; } = new List<Member>();
}