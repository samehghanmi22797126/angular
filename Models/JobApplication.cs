using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models;

public class JobApplication
{
    public int Id { get; set; }
    
    public string? CandidateName { get; set; }
    
    public string? CandidateEmail { get; set; }
    
    [Required]
    public string CvPath { get; set; } = string.Empty; // Chemin vers le fichier PDF
    
    public DateTime AppliedAt { get; set; } = DateTime.Now;
    
    public string Status { get; set; } = "En attente";
    
    public int JobOfferId { get; set; }

    public JobOffer? JobOffer { get; set; }
}
