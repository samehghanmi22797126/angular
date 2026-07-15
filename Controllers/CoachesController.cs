using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class CoachesController : ControllerBase
	{
		private readonly GymDbContext _context;
		public CoachesController(GymDbContext context)
		{
			_context = context;
		}

		[HttpGet]
		public async Task<ActionResult<IEnumerable<Coach>>> GetCoaches()
		{
			return await _context.Coaches.ToListAsync();
		}

		[HttpPost]
		public async Task<ActionResult<Coach>> CreateCoach(Coach coach)
		{
			_context.Coaches.Add(coach);
			await _context.SaveChangesAsync();  // ← C’est essentiel
			return CreatedAtAction(nameof(GetCoaches), new { id = coach.Id }, coach);
		}

		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateCoach(int id, Coach coach)
		{
			if (id != coach.Id) return BadRequest();
			_context.Entry(coach).State = EntityState.Modified;
			await _context.SaveChangesAsync();
			return NoContent();
		}

		[HttpDelete("{id}")]
		public async Task<IActionResult> DeleteCoach(int id)
		{
			var coach = await _context.Coaches.FindAsync(id);
			if (coach == null) return NotFound();
			_context.Coaches.Remove(coach);
			await _context.SaveChangesAsync();
			return NoContent();
		}

		// Nouvelles routes pour gérer les appels de CoachService (qui utilise /api/Coach au lieu de /api/Coaches)
		[HttpGet("/api/Coach/{id}")]
		public async Task<ActionResult<Coach>> GetCoachById(int id)
		{
			var coach = await _context.Coaches.FindAsync(id);
			if (coach == null) return NotFound();
			return Ok(coach);
		}

		[HttpGet("/api/Coach/{id}/courses")]
		public async Task<ActionResult<IEnumerable<Course>>> GetCoachCourses(int id)
		{
			var courses = await _context.Courses
				.Where(c => c.CoachId == id)
				.ToListAsync();
			return Ok(courses);
		}

		[HttpGet("/api/Coach/{id}/members")]
		public async Task<ActionResult<IEnumerable<Member>>> GetCoachMembers(int id)
		{
			var members = await _context.Members
				.Where(m => m.CoachId == id)
				.ToListAsync();
			return Ok(members);
		}

		[HttpPost("/api/Coach/{coachId}/add-member/{memberId}")]
		public async Task<IActionResult> AssignMemberToCoach(int coachId, int memberId)
		{
			var member = await _context.Members.FindAsync(memberId);
			if (member == null) return NotFound("Membre introuvable.");

			member.CoachId = coachId;
			await _context.SaveChangesAsync();
			return Ok(member);
		}

		[HttpPost("/api/Coach/{coachId}/remove-member/{memberId}")]
		public async Task<IActionResult> RemoveMemberFromCoach(int coachId, int memberId)
		{
			var member = await _context.Members.FindAsync(memberId);
			if (member == null) return NotFound("Membre introuvable.");

			if (member.CoachId == coachId)
			{
				member.CoachId = null;
				await _context.SaveChangesAsync();
			}
			return Ok(member);
		}
	}
}