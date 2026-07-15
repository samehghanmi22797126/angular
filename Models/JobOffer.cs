using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models;

public class JobOffer
{
    public int Id { get; set; }
    
    [Required]
    public string Title { get; set; } = string.Empty;
    
    [Required]
    public string Description { get; set; } = string.Empty;
    
    public DateTime CreatedAt { get; set; } = DateTime.Now;
    
    public bool IsActive { get; set; } = true;
    
    public ICollection<JobApplication> Applications { get; set; } = new List<JobApplication>();
}
