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
        if (course.Members.Any(m => m.Id == memberId)) return BadRequest("Member already registered");
        course.Members.Add(member);
        await _context.SaveChangesAsync();
        return NoContent();
    }
}
