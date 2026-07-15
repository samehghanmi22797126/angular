using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;
using sale_sport.Services;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class MembersController : ControllerBase
	{
		private readonly GymDbContext _context;
		private readonly IEmailService _emailService;

		public MembersController(GymDbContext context, IEmailService emailService)
		{
			_context = context;
			_emailService = emailService;
		}

		// GET: api/Members
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
		{
			var members = await _context.Members
										.Include(m => m.Subscription)
										.Include(m => m.Coach)
										.ToListAsync();
			return Ok(members);
		}

		// GET: api/Members/5
		[HttpGet("{id}")]
		public async Task<ActionResult<Member>> GetMember(int id)
		{
			var member = await _context.Members
									   .Include(m => m.Subscription)
									   .Include(m => m.Coach)
									   .FirstOrDefaultAsync(m => m.Id == id);

			if (member == null)
				return NotFound();

			return Ok(member);
		}

		// POST: api/Members/login
		[HttpPost("login")]
		public async Task<IActionResult> Login([FromBody] Login loginRequest)
		{
			if (string.IsNullOrEmpty(loginRequest.Email) || string.IsNullOrEmpty(loginRequest.Password))
			{
				return BadRequest(new { message = "Email et mot de passe requis" });
			}

			var member = await _context.Members
				.FirstOrDefaultAsync(m => m.Email == loginRequest.Email && m.Password == loginRequest.Password);

			if (member == null)
			{
				return Unauthorized(new { message = "Email ou mot de passe incorrect" });
			}

			if (!member.IsApproved)
			{
				return StatusCode(403, new { message = "Votre compte est en attente d'approbation par un administrateur." });
			}

			return Ok(new
			{
				id = member.Id,
				name = member.Name,
				email = member.Email,
				age = member.Age,
				subscriptionId = member.SubscriptionId,
				coachId = member.CoachId,
				message = "Connexion réussie"
			});
		}

		// POST: api/Members
		[HttpPost]
		public async Task<ActionResult<Member>> CreateMember(Member member)
		{
			if (member.SubscriptionId.HasValue && member.SubscriptionId != 0)
			{
				var subscription = await _context.Subscriptions.FindAsync(member.SubscriptionId.Value);
				if (subscription == null)
					return BadRequest("SubscriptionId invalide.");
			}

			if (member.CoachId.HasValue && member.CoachId != 0)
			{
				var coach = await _context.Coaches.FindAsync(member.CoachId.Value);
				if (coach == null)
					return BadRequest("CoachId invalide.");
			}

			_context.Members.Add(member);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetMember), new { id = member.Id }, member);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateMember(int id, Member member)
		{
			if (id != member.Id)
				return BadRequest("Id mismatch");

			if (member.SubscriptionId.HasValue && member.SubscriptionId != 0)
			{
				var subscription = await _context.Subscriptions.FindAsync(member.SubscriptionId.Value);
				if (subscription == null)
					return BadRequest("SubscriptionId invalide.");
			}

			if (member.CoachId.HasValue && member.CoachId != 0)
			{
				var coach = await _context.Coaches.FindAsync(member.CoachId.Value);
				if (coach == null)
					return BadRequest("CoachId invalide.");
			}

			_context.Entry(member).State = EntityState.Modified;

			try
			{
				await _context.SaveChangesAsync();
			}
			catch (DbUpdateConcurrencyException)
			{
				if (!_context.Members.Any(e => e.Id == id))
					return NotFound();
				else
					throw;
			}

			return NoContent();
		}

		// GET: api/Members/subscribe?memberId=3&subscriptionId=1
		[HttpGet("subscribe")]
		[Microsoft.AspNetCore.Authorization.AllowAnonymous]
		public async Task<IActionResult> SubscribeMember(int memberId, int subscriptionId)
		{
			var member = await _context.Members.FindAsync(memberId);
			if (member == null) return NotFound($"ERREUR: Membre ID {memberId} non trouvé.");

			if (!member.IsApproved) return BadRequest("Votre compte doit être validé par un administrateur avant de pouvoir souscrire à un abonnement.");

			var subscription = await _context.Subscriptions.FindAsync(subscriptionId);
			if (subscription == null) return NotFound($"ERREUR: Abonnement ID {subscriptionId} non trouvé.");

			member.SubscriptionId = subscriptionId;
			
			try 
			{
				await _context.SaveChangesAsync();
				
				// --- Envoi de l'email de félicitation ---
				try {
					string subject = "Félicitations pour votre inscription !";
					string body = $@"
						<div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
							<h2 style='color: #e61919;'>Bienvenue chez GYM Sport !</h2>
							<p>Bonjour <strong>{member.Name}</strong>,</p>
							<p>Nous sommes ravis de vous confirmer votre abonnement au plan <strong>{subscription.Name}</strong>.</p>
							<p>Votre abonnement est désormais actif. Vous pouvez dès à présent profiter de nos installations et vous inscrire aux cours disponibles depuis votre tableau de bord.</p>
							<br>
							<p>À très vite à la salle !</p>
							<p>L'équipe <strong>GYM Sport</strong></p>
						</div>";
					
					await _emailService.SendEmailAsync(member.Email, subject, body);
				} catch { /* L'échec de l'email ne doit pas annuler la transaction réussie */ }

				return Ok(new { message = "Abonnement souscrit avec succès.", subscriptionId });
			}
			catch (Exception ex)
			{
				return StatusCode(500, $"Erreur base de données: {ex.Message}");
			}
		}

		[HttpGet("{id}/subscription")]
		public async Task<ActionResult<Subscription>> GetSubscription(int id)
		{
			var member = await _context.Members
											 .Include(m => m.Subscription)
											 .FirstOrDefaultAsync(m => m.Id == id);
			if (member == null || member.Subscription == null)
				return NotFound();

			return Ok(member.Subscription);
		}

		[HttpGet("{id}/courses")]
		public async Task<ActionResult<IEnumerable<Course>>> GetMemberCourses(int id)
		{
			var courses = await _context.Courses
										.Include(c => c.Coach) // Ajouté pour inclure le coach
										.Where(c => c.Members.Any(m => m.Id == id))
										.ToListAsync();

			if (courses == null)
				return Ok(new List<Course>()); // Retourner liste vide au lieu de 404

			return Ok(courses);
		}

		// DELETE: api/Members/5
		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteMember(int id)
		{
			var member = await _context.Members.FindAsync(id);
			if (member == null)
				return NotFound();

			_context.Members.Remove(member);
			await _context.SaveChangesAsync();

			return NoContent();
		}
	}
}