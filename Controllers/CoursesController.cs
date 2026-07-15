using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

namespace sale_sport.Controllers;

[ApiController]
[Route("api/[controller]")]
public class CoursesController : ControllerBase
{
    private readonly GymDbContext _context;
    public CoursesController(GymDbContext context) => _context = context;

    [HttpGet]
    public async Task<IActionResult> GetAll() => Ok(await _context.Courses.Include(c => c.Coach).Include(c => c.Members).ToListAsync());

    [HttpGet("{id}")]
    public async Task<IActionResult> Get(int id)
    {
        var course = await _context.Courses.Include(c => c.Coach).Include(c => c.Members).FirstOrDefaultAsync(c => c.Id == id);
        if (course == null) return NotFound();
        return Ok(course);
    }

    [HttpPost]
    public async Task<IActionResult> Create(Course course)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return CreatedAtAction(nameof(Get), new { id = course.Id }, course);
    }

    [HttpPost("{id}/register/{memberId}")]
    public async Task<IActionResult> Register(int id, int memberId)
    {
        var course = await _context.Courses.Include(c => c.Members).FirstOrDefaultAsync(c => c.Id == id);
        if (course == null) return NotFound("Course not found");
        var member = await _context.Members.FindAsync(memberId);
        if (member == null) return NotFound("Member not found");

        if (!member.IsApproved) return BadRequest("Votre compte n'est pas encore activé. Veuillez attendre la validation d'un administrateur.");

        if (course.StartAt.HasValue && course.StartAt.Value < DateTime.Now)
            return BadRequest("Ce cours est déjà passé. Vous ne pouvez plus vous y inscrire.");

        if (course.Members.Any(m => m.Id == memberId)) return BadRequest("Member already registered");
        
        // Validation de la capacité
        if (course.Members.Count >= course.MaxParticipants) 
            return BadRequest("Le cours est complet. Limite de places atteinte.");

        course.Members.Add(member);

        // Mise à jour automatique du coach du membre vers celui du cours
        if (course.CoachId.HasValue) {
            member.CoachId = course.CoachId.Value;
        }

        await _context.SaveChangesAsync();
        return NoContent();
    }

    [HttpPut("{id}")]
    public async Task<IActionResult> Update(int id, Course course)
    {
        if (id != course.Id) return BadRequest();
        _context.Entry(course).State = EntityState.Modified;
        try { await _context.SaveChangesAsync(); }
        catch (DbUpdateConcurrencyException) { if (!_context.Courses.Any(e => e.Id == id)) return NotFound(); else throw; }
        return NoContent();
    }

    [HttpDelete("{id}")]
    public async Task<IActionResult> Delete(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
