using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

namespace sale_sport.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MembersController : ControllerBase
{
	private readonly GymDbContext _context;
	public MembersController(GymDbContext context) => _context = context;

	[HttpGet]
	public async Task<IActionResult> GetAll() =>
		Ok(await _context.Members.Include(m => m.Subscription).ToListAsync());

	[HttpGet("{id}")]
	public async Task<IActionResult> GetById(int id)
	{
		var member = await _context.Members.Include(m => m.Subscription).FirstOrDefaultAsync(m => m.Id == id);
		if (member == null) return NotFound();
		return Ok(member);
	}

	[HttpPost]
	public async Task<IActionResult> Add(Member member)
	{
		var sub = await _context.Subscriptions.FindAsync(member.SubscriptionId);
		if (sub == null) return BadRequest("Abonnement introuvable");

		_context.Members.Add(member);
		await _context.SaveChangesAsync();
		return CreatedAtAction(nameof(GetById), new { id = member.Id }, member);
	}
}
