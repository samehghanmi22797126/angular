using System.Collections.Generic;

namespace sale_sport.Models
{
	public class Coach
	{
		public int Id { get; set; }
		public string Name { get; set; } = null!;
		public string Specialty { get; set; } = null!;
		public string Email { get; set; } = null!;
		public string Password { get; set; } = null!;

		// Relations
		public ICollection<Member>? Members { get; set; }
		public ICollection<Course>? Courses { get; set; }  // <-- Assurez-vous que Course est défini
	}
}