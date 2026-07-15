using System;
using System.ComponentModel.DataAnnotations;

namespace sale_sport.Models
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        
        [Required]
        public string Email { get; set; } = string.Empty;
        
        [Required]
        public string Token { get; set; } = string.Empty;
        
        public DateTime ExpiryDate { get; set; }
        
        public bool IsUsed { get; set; } = false;
    }
}
