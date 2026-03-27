using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

[Route("api/[controller]")]
[ApiController]
public class AdminController : ControllerBase
{
	private readonly GymDbContext _context;
	public AdminController(GymDbContext context)
	{
		_context = context;
	}

	// --- Membres ---
	[HttpGet("members")]
	public async Task<IActionResult> GetMembers() => Ok(await _context.Members.Include(m => m.Subscription).ToListAsync());

	[HttpPost("members")]
	public async Task<IActionResult> CreateMember(Member member)
	{
		if (!ModelState.IsValid) return BadRequest(ModelState);
		_context.Members.Add(member);
		await _context.SaveChangesAsync();
		return Ok(member);
	}

	[HttpPut("members/{id}")]
	public async Task<IActionResult> UpdateMember(int id, Member member)
	{
		var existing = await _context.Members.FindAsync(id);
		if (existing == null) return NotFound();
		existing.Name = member.Name;
		existing.Email = member.Email;
		existing.Age = member.Age;
		existing.SubscriptionId = member.SubscriptionId;
		await _context.SaveChangesAsync();
		return Ok(existing);
	}

	[HttpDelete("members/{id}")]
	public async Task<IActionResult> DeleteMember(int id)
	{
		var member = await _context.Members.FindAsync(id);
		if (member == null) return NotFound();
		_context.Members.Remove(member);
		await _context.SaveChangesAsync();
		return Ok();
	}

	// --- Coaches, Subscriptions, etc. ---
	// Idem que Members : GET / POST / PUT / DELETE
}