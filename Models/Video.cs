using System;
using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models
{
    public class Video
    {
        public int Id { get; set; }
        
        [Required]
        public string Title { get; set; } = string.Empty;
        
        [Required]
        public string FilePath { get; set; } = string.Empty;
        
        public string? UploadedBy { get; set; }
        
        public DateTime UploadedAt { get; set; } = DateTime.Now;
    }
}
