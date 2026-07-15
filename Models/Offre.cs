using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json;

namespace sale_sport.Models;

public class Offre
{
	public int Id { get; set; }

	[Required]
	public string Name { get; set; } = string.Empty;

	[Required]
	public decimal Price { get; set; }

	[Required]
	public string Duration { get; set; } = string.Empty;

	public string? Description { get; set; }

	// Liste des caractéristiques (ex: "Accès 24h/24", "Spa inclus")
	public string FeaturesJson { get; set; } = "[]";

	[NotMapped]
	public List<string> Features
	{
		get => JsonSerializer.Deserialize<List<string>>(FeaturesJson) ?? new List<string>();
		set => FeaturesJson = JsonSerializer.Serialize(value);
	}
}
