using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models;

public class Review
{
    public int Id { get; set; }
    
    [Required]
    public string MemberName { get; set; } = string.Empty;
    
    [Required]
    public string Content { get; set; } = string.Empty;
    
    [Range(1, 5)]
    public int Rating { get; set; } = 5;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public int? MemberId { get; set; } // Optionnel pour l'instant
}
