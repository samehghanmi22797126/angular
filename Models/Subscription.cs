namespace sale_sport.Models;

public class Subscription
{
	public int Id { get; set; }
	public string Name { get; set; }
	public string Type { get; set; } = ""; // ex: "Mensuel", "Annuel"
	public decimal Price { get; set; }

	public ICollection<Member> Members { get; set; } = new List<Member>();
}