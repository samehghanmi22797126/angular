using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class MembersController : ControllerBase
	{
		private readonly GymDbContext _context;

		public MembersController(GymDbContext context)
		{
			_context = context;
		}

		// GET: api/Members
		[HttpGet]
		public async Task<ActionResult<IEnumerable<Member>>> GetMembers()
		{
			// Inclut la subscription et le coach pour chaque membre
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

		// POST: api/Members
		[HttpPost]
		public async Task<ActionResult<Member>> CreateMember(Member member)
		{
			// Vérifie que la SubscriptionId est valide
			var subscription = await _context.Subscriptions.FindAsync(member.SubscriptionId);
			if (subscription == null)
				return BadRequest("SubscriptionId invalide.");

			// Vérifie que le coach si fourni existe
			if (member.CoachId != 0)
			{
				var coach = await _context.Coaches.FindAsync(member.CoachId);
				if (coach == null)
					return BadRequest("CoachId invalide.");
			}

			_context.Members.Add(member);
			await _context.SaveChangesAsync();

			return CreatedAtAction(nameof(GetMember), new { id = member.Id }, member);
		}

		// PUT: api/Members/5
		[HttpPut("{id}")]
		public async Task<IActionResult> UpdateMember(int id, Member member)
		{
			if (id != member.Id)
				return BadRequest("Id mismatch");

			// Vérifie subscription
			var subscription = await _context.Subscriptions.FindAsync(member.SubscriptionId);
			if (subscription == null)
				return BadRequest("SubscriptionId invalide.");

			if (member.CoachId != 0)
			{
				var coach = await _context.Coaches.FindAsync(member.CoachId);
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

		[HttpGet("{id}/subscription")]
		public async Task<ActionResult<Subscription>> GetSubscription(int id)
		{
			var subscription = await _context.Subscriptions
											 .FirstOrDefaultAsync(s => s.MemberId == id);
			if (subscription == null)
				return NotFound();

			return Ok(subscription);
		}
		[HttpGet("{id}/courses")]
		public async Task<ActionResult<IEnumerable<Course>>> GetMemberCourses(int id)
		{
			var courses = await _context.Courses
										.Where(c => c.Members.Any(m => m.Id == id))
										.ToListAsync();

			if (courses == null || courses.Count == 0)
				return NotFound();

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