using Microsoft.AspNetCore.Mvc;
using sale_sport.Data;
using sale_sport.Models;
using System.Linq;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class AuthController : ControllerBase
	{
		private readonly GymDbContext _context;

		public AuthController(GymDbContext context)
		{
			_context = context;
		}

		[HttpPost("login")]
		public IActionResult Login([FromBody] Login login)
		{
			var admin = _context.Admins.FirstOrDefault(a => a.Email == login.Email && a.Password == login.Password);
			if (admin != null)
				return Ok(new { admin.Id, admin.Name, admin.Email, Role = "Admin" });

			var member = _context.Members.FirstOrDefault(m => m.Email == login.Email && m.Password == login.Password);
			if (member != null)
				return Ok(new { member.Id, member.Name, member.Email, Role = "Member" });

			var coach = _context.Coaches.FirstOrDefault(c => c.Email == login.Email && c.Password == login.Password);
			if (coach != null)
				return Ok(new { coach.Id, coach.Name, coach.Email, Role = "Coach" });

			return Unauthorized("Email ou mot de passe incorrect");
		}

		[HttpPost("register")]
		public IActionResult Register([FromBody] RegisterDto dto)
		{
			if (string.IsNullOrWhiteSpace(dto.Email) || string.IsNullOrWhiteSpace(dto.Password))
				return BadRequest("Email et mot de passe requis");

			if (_context.Admins.Any(a => a.Email == dto.Email) ||
				_context.Members.Any(m => m.Email == dto.Email) ||
				_context.Coaches.Any(c => c.Email == dto.Email))
				return Conflict("Un utilisateur avec cet email existe déjà");

			var role = (dto.Role ?? "Member").ToLower();

			if (role == "admin")
			{
				var admin = new Admin { Name = dto.Name ?? "", Email = dto.Email, Password = dto.Password };
				_context.Admins.Add(admin);
				_context.SaveChanges();
				return Ok(new { admin.Id, admin.Name, admin.Email, Role = "Admin" });
			}

			if (role == "coach")
			{
				var coach = new Coach { Name = dto.Name ?? "", Specialty = dto.Specialty ?? "", Email = dto.Email, Password = dto.Password };
				_context.Coaches.Add(coach);
				_context.SaveChanges();
				return Ok(new { coach.Id, coach.Name, coach.Email, Role = "Coach" });
			}

			// Member
			if (dto.SubscriptionId == null)
				return BadRequest("SubscriptionId requis pour le membre");

			var member = new Member
			{
				Name = dto.Name ?? "",
				Age = dto.Age ?? 0,
				Email = dto.Email,
				Password = dto.Password,
				SubscriptionId = dto.SubscriptionId.Value
			};
			_context.Members.Add(member);
			_context.SaveChanges();
			return Ok(new { member.Id, member.Name, member.Email, Role = "Member" });
		}
	}
}