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
	}
}