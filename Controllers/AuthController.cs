using Microsoft.AspNetCore.Mvc;
using sale_sport.Data;
using sale_sport.Models;
using System.Linq;
using sale_sport.Services;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Hosting;
using System.IO;
using System;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly GymDbContext _context;
		private readonly IEmailService _emailService;
		private readonly IWebHostEnvironment _env;

		public AuthController(GymDbContext context, IEmailService emailService, IWebHostEnvironment env)
		{
			_context = context;
			_emailService = emailService;
			_env = env;
		}

		[HttpPost("login")]
		public IActionResult Login([FromBody] Login login)
		{
			var admin = _context.Admins.FirstOrDefault(a => a.Email == login.Email && a.Password == login.Password);
			if (admin != null)
				return Ok(new { admin.Id, admin.Name, admin.Email, admin.PhotoUrl, Role = "Admin" });

			var member = _context.Members.FirstOrDefault(m => m.Email == login.Email && m.Password == login.Password);
			if (member != null)
			{
				if (!member.IsApproved) return StatusCode(403, new { message = "Votre compte est en attente d'approbation par un administrateur." });
				return Ok(new { member.Id, member.Name, member.Email, member.PhotoUrl, Role = "Member" });
			}

			var coach = _context.Coaches.FirstOrDefault(c => c.Email == login.Email && c.Password == login.Password);
			if (coach != null)
			{
				if (!coach.IsApproved) return StatusCode(403, new { message = "Votre compte coach est en attente d'approbation par l'administration." });
				return Ok(new { coach.Id, coach.Name, coach.Email, coach.PhotoUrl, Role = "Coach" });
			}

			return Unauthorized("Email ou mot de passe incorrect");
		}

		[HttpPost("register")]
		public async Task<IActionResult> Register([FromForm] RegisterDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
				return BadRequest("Email et mot de passe requis");

			var emailRegex = new System.Text.RegularExpressions.Regex(@"^[^@\s]+@[^@\s]+\.[^@\s]+$");
			if (!emailRegex.IsMatch(dto.Email))
				return BadRequest("Le format de l'email est invalide");

			if (_context.Admins.Any(a => a.Email == dto.Email) ||
				_context.Members.Any(m => m.Email == dto.Email) ||
				_context.Coaches.Any(c => c.Email == dto.Email))
				return Conflict("Un utilisateur avec cet email existe déjà");

			var role = (dto.Role ?? "Member").ToLower();
			string? photoFilename = null;

			if (dto.Photo != null && dto.Photo.Length > 0)
			{
				// Extension check could be added here
				string uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "profiles");
				if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

				photoFilename = Guid.NewGuid().ToString() + "_" + dto.Photo.FileName;
				string filePath = Path.Combine(uploadsFolder, photoFilename);

				using (var stream = new FileStream(filePath, FileMode.Create))
				{
					await dto.Photo.CopyToAsync(stream);
				}
			}

			if (role == "admin")
			{
				var admin = new Admin { Name = dto.Name ?? "", Email = dto.Email, Password = dto.Password, PhotoUrl = photoFilename };
				_context.Admins.Add(admin);
				await _context.SaveChangesAsync();
				return Ok(new { admin.Id, admin.Name, admin.Email, admin.PhotoUrl, Role = "Admin" });
			}

			if (role == "coach")
			{
				var coach = new Coach { Name = dto.Name ?? "", Specialty = dto.Specialty ?? "", Email = dto.Email, Password = dto.Password, PhotoUrl = photoFilename, IsApproved = false };
				_context.Coaches.Add(coach);
				await _context.SaveChangesAsync();
				return Ok(new { 
					message = "Inscription coach réussie ! Votre accès doit être validé par un administrateur.",
					requiresApproval = true 
				});
			}

			// Member
			var member = new Member
			{
				Name = dto.Name ?? "",
				Age = dto.Age ?? 0,
				Email = dto.Email,
				Password = dto.Password,
				SubscriptionId = dto.SubscriptionId,
				PhotoUrl = photoFilename,
				IsApproved = false
			};
			_context.Members.Add(member);
			await _context.SaveChangesAsync();

			// --- Envoi de l'email de bienvenue ---
			try {
				string subject = "Bienvenue chez GYM Sport !";
				string body = $@"
					<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
						<h2 style='color: #e61919;'>Inscription réussie !</h2>
						<p>Bonjour <strong>{member.Name}</strong>,</p>
						<p>Votre compte a été créé. Pour des raisons de sécurité, <strong>un administrateur doit valider votre profil</strong> avant que vous ne puissiez vous connecter.</p>
						<p>Vous recevrez un nouvel email dès que votre accès sera activé.</p>
						<p>D'ici là, vous pouvez déjà consulter nos offres sur notre site.</p>
						<br>
						<p>L'équipe <strong>GYM Sport</strong></p>
					</div>";
				
				await _emailService.SendEmailAsync(member.Email, subject, body);
			} catch { /* Ignorer l'erreur d'email pour ne pas bloquer l'inscription */ }

			return Ok(new { 
				message = "Inscription réussie ! Votre compte est en attente d'approbation par un administrateur.",
				requiresApproval = true 
			});
		}
		[HttpPost("forgot-password")]
		public async Task<IActionResult> ForgotPassword([FromBody] ForgotPasswordDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Email))
				return BadRequest("Email requis");

			// Vérifier l'existence de l'utilisateur dans les 3 tables
			bool userExists = _context.Admins.Any(a => a.Email == dto.Email) ||
							  _context.Members.Any(m => m.Email == dto.Email) ||
							  _context.Coaches.Any(c => c.Email == dto.Email);

			if (!userExists)
			{
				// Pour des raisons de sécurité, on ne dit pas si l'email existe ou pas
				return Ok(new { message = "Si un compte est associé à ce mail, vous recevrez un lien de réinitialisation." });
			}

			// Générer un token
			var token = System.Guid.NewGuid().ToString();
			var resetToken = new PasswordResetToken
			{
				Email = dto.Email,
				Token = token,
				ExpiryDate = System.DateTime.UtcNow.AddHours(1),
				IsUsed = false
			};

			_context.PasswordResetTokens.Add(resetToken);
			await _context.SaveChangesAsync();

			// Envoyer l'email
			try
			{
				string resetLink = $"http://localhost:4200/reset-password?token={token}&email={dto.Email}";
				string subject = "Réinitialisation de votre mot de passe - GYM Sport";
				string body = $@"
					<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
						<h2 style='color: #e61919;'>Réinitialisation de mot de passe</h2>
						<p>Vous avez demandé la réinitialisation de votre mot de passe pour votre compte <strong>GYM Sport</strong>.</p>
						<p>Cliquez sur le lien ci-dessous pour définir un nouveau mot de passe (ce lien est valide pendant 1 heure) :</p>
						<p style='text-align: center;'>
							<a href='{resetLink}' style='display: inline-block; padding: 12px 25px; background-color: #e61919; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;'>Réinitialiser mon mot de passe</a>
						</p>
						<p>Si vous n'êtes pas à l'origine de cette demande, vous pouvez ignorer cet email.</p>
						<br>
						<p>L'équipe <strong>GYM Sport</strong></p>
					</div>";

				await _emailService.SendEmailAsync(dto.Email, subject, body);
			}
			catch { /* Log error in production */ }

			return Ok(new { message = "Si un compte est associé à ce mail, vous recevrez un lien de réinitialisation." });
		}

		[HttpPost("reset-password")]
		public async Task<IActionResult> ResetPassword([FromBody] ResetPasswordDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.NewPassword))
				return BadRequest("Nouveau mot de passe requis");

			var resetToken = _context.PasswordResetTokens
				.FirstOrDefault(t => t.Token == dto.Token && t.Email == dto.Email && !t.IsUsed && t.ExpiryDate > System.DateTime.UtcNow);

			if (resetToken == null)
				return BadRequest("Lien invalide ou expiré");

			// Rechercher l'utilisateur dans les 3 tables et mettre à jour le mot de passe
			bool updated = false;

			var admin = _context.Admins.FirstOrDefault(a => a.Email == dto.Email);
			if (admin != null)
			{
				admin.Password = dto.NewPassword;
				updated = true;
			}
			else
			{
				var member = _context.Members.FirstOrDefault(m => m.Email == dto.Email);
				if (member != null)
				{
					member.Password = dto.NewPassword;
					updated = true;
				}
				else
				{
					var coach = _context.Coaches.FirstOrDefault(c => c.Email == dto.Email);
					if (coach != null)
					{
						coach.Password = dto.NewPassword;
						updated = true;
					}
				}
			}

			if (!updated)
				return NotFound("Utilisateur introuvable");

			resetToken.IsUsed = true;
			await _context.SaveChangesAsync();

			return Ok(new { message = "Votre mot de passe a été réinitialisé avec succès." });
		}
	}
}