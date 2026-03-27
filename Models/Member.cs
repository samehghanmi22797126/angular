using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models
{
	public class Member
	{
		public int Id { get; set; }

		[Required]
		public string Name { get; set; } = null!;  // Défini comme non-nullable avec une valeur par défaut

		public int Age { get; set; }

		[Required]
		public string Email { get; set; } = null!;

		[Required]
		public string Password { get; set; } = null!;

		[Required]
		public int SubscriptionId { get; set; }  // Liaison via Id seulement
		public Subscription? Subscription { get; set; }  // Navigation optionnelle

		public int? CoachId { get; set; }  // Peut être null si pas de coach
		public Coach? Coach { get; set; }  // Navigation optionnelle

		// Liste de cours (many-to-many)
		public ICollection<Course> Courses { get; set; } = new List<Course>();
	}
}