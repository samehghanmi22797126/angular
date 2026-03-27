namespace sale_sport.Models
{
	public class RegisterDto
	{
		public required string Email { get; set; }
		public required string Password { get; set; }
		public required string Role { get; set; } // "Admin", "Coach", "Member"

		// Propriétés optionnelles selon le rôle
		public string? Name { get; set; }        // Admin, Coach ou Member
		public string? Specialty { get; set; }   // Coach
		public int? Age { get; set; }
		public int? SubscriptionId { get; set; }// Member
	}
}