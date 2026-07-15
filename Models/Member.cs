using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace sale_sport.Models
{
	public class Member
	{
		public int Id { get; set; }

		[Required]
		public string Name { get; set; } = null!;

		public int Age { get; set; }

		[Required]
		public string Email { get; set; } = null!;

		[Required]
		public string Password { get; set; } = null!;

		public bool IsApproved { get; set; } = false;

		public string? PhotoUrl { get; set; }

		// Supprimez [Required] ici
		public int? SubscriptionId { get; set; }


// [JsonIgnore]
		public Subscription? Subscription { get; set; }

		public string PaymentStatus { get; set; } = "Pending";
		public DateTime? SubscriptionEndDate { get; set; }

		public int? CoachId { get; set; }
		public Coach? Coach { get; set; }

		public ICollection<Course> Courses { get; set; } = new List<Course>();
	}
}