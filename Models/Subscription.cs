using System.ComponentModel.DataAnnotations;
namespace sale_sport.Models;

public class Subscription
{
	public int Id { get; set; }

	[Required] // maintenant reconnu
	public string Name { get; set; } = string.Empty;

	[Required] // maintenant reconnu
	public int DurationInMonths { get; set; }

	[Required]
	public decimal Price { get; set; }
	
	public string? Type { get; set; }
    
    public string? Description { get; set; }
    
    public string FeaturesJson { get; set; } = "[]";

	public ICollection<Member> Members { get; set; } = new List<Member>();
}