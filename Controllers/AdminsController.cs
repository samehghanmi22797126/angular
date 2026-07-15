using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;
using sale_sport.Services;

namespace sale_sport.Controllers;

[Route("api/admin")]
[ApiController]
public class AdminController : ControllerBase
{
    private readonly GymDbContext _context;
    private readonly IEmailService _emailService;

    public AdminController(GymDbContext context, IEmailService emailService)
    {
        _context = context;
        _emailService = emailService;
    }

    // --- Membres ---
    [HttpGet("members")]
    public async Task<IActionResult> GetMembers() => Ok(await _context.Members.Include(m => m.Subscription).ToListAsync());

    [HttpPost("members")]
    public async Task<IActionResult> CreateMember(Member member)
    {
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

    [HttpPut("members/{id}/approve")]
    public async Task<IActionResult> ApproveMember(int id)
    {
        var member = await _context.Members.FindAsync(id);
        if (member == null) return NotFound();
        member.IsApproved = true;
        await _context.SaveChangesAsync();

        // --- Notification par Email ---
        try {
            string subject = "Votre compte GYM Sport est activé !";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #28a745;'>Bonne nouvelle !</h2>
                    <p>Bonjour <strong>{member.Name}</strong>,</p>
                    <p>Votre compte a été validé par notre équipe administrative. Vous pouvez désormais vous connecter à votre espace membre.</p>
                    <p>À très vite sur le terrain !</p>
                    <br>
                    <p>L'équipe <strong>GYM Sport</strong></p>
                </div>";
            await _emailService.SendEmailAsync(member.Email, subject, body);
        } catch { /* Ignorer l'échec de l'email */ }

        return Ok(member);
    }

    // --- Coaches ---
    [HttpGet("coaches")]
    public async Task<IActionResult> GetCoaches() => Ok(await _context.Coaches.ToListAsync());

    [HttpPost("coaches")]
    public async Task<IActionResult> CreateCoach(Coach coach)
    {
        _context.Coaches.Add(coach);
        await _context.SaveChangesAsync();
        return Ok(coach);
    }

    [HttpPut("coaches/{id}")]
    public async Task<IActionResult> UpdateCoach(int id, Coach coach)
    {
        var existing = await _context.Coaches.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = coach.Name;
        existing.Email = coach.Email;
        existing.Specialty = coach.Specialty;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("coaches/{id}")]
    public async Task<IActionResult> DeleteCoach(int id)
    {
        var coach = await _context.Coaches.FindAsync(id);
        if (coach == null) return NotFound();
        _context.Coaches.Remove(coach);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPut("coaches/{id}/approve")]
    public async Task<IActionResult> ApproveCoach(int id)
    {
        var coach = await _context.Coaches.FindAsync(id);
        if (coach == null) return NotFound();
        coach.IsApproved = true;
        await _context.SaveChangesAsync();

        // --- Notification par Email ---
        try {
            string subject = "Votre accès Coach GYM Sport est activé !";
            string body = $@"
                <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                    <h2 style='color: #28a745;'>Accès Coach Activé</h2>
                    <p>Bonjour <strong>{coach.Name}</strong>,</p>
                    <p>Votre profil de coach a été approuvé. Vous pouvez maintenant accéder à votre tableau de bord pour gérer vos cours et vos élèves.</p>
                    <br>
                    <p>L'équipe <strong>GYM Sport</strong></p>
                </div>";
            await _emailService.SendEmailAsync(coach.Email, subject, body);
        } catch { /* Ignorer l'échec de l'email */ }

        return Ok(coach);
    }

    // --- Subscriptions ---
    [HttpGet("subscriptions")]
    public async Task<IActionResult> GetSubscriptions() => Ok(await _context.Subscriptions.ToListAsync());

    [HttpPost("subscriptions")]
    public async Task<IActionResult> CreateSubscription(Subscription subscription)
    {
        _context.Subscriptions.Add(subscription);
        await _context.SaveChangesAsync();
        return Ok(subscription);
    }

    [HttpPut("subscriptions/{id}")]
    public async Task<IActionResult> UpdateSubscription(int id, Subscription subscription)
    {
        var existing = await _context.Subscriptions.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = subscription.Name;
        existing.Price = subscription.Price;
        existing.DurationInMonths = subscription.DurationInMonths;
        existing.Type = subscription.Type;
        existing.Description = subscription.Description;
        existing.FeaturesJson = subscription.FeaturesJson;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("subscriptions/{id}")]
    public async Task<IActionResult> DeleteSubscription(int id)
    {
        var sub = await _context.Subscriptions.FindAsync(id);
        if (sub == null) return NotFound();
        _context.Subscriptions.Remove(sub);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- Offres ---
    [HttpGet("offres")]
    public async Task<IActionResult> GetOffres() => Ok(await _context.Offres.ToListAsync());

    [HttpPost("offres")]
    public async Task<IActionResult> CreateOffre(Offre offre)
    {
        _context.Offres.Add(offre);
        await _context.SaveChangesAsync();
        return Ok(offre);
    }

    [HttpPut("offres/{id}")]
    public async Task<IActionResult> UpdateOffre(int id, Offre offre)
    {
        var existing = await _context.Offres.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = offre.Name;
        existing.Price = offre.Price;
        existing.Duration = offre.Duration;
        existing.Description = offre.Description;
        existing.FeaturesJson = offre.FeaturesJson;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("offres/{id}")]
    public async Task<IActionResult> DeleteOffre(int id)
    {
        var offre = await _context.Offres.FindAsync(id);
        if (offre == null) return NotFound();
        _context.Offres.Remove(offre);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- Courses ---
    [HttpGet("courses")]
    public async Task<IActionResult> GetCourses() => Ok(await _context.Courses.Include(c => c.Coach).ToListAsync());

    [HttpPost("courses")]
    public async Task<IActionResult> CreateCourse(Course course)
    {
        _context.Courses.Add(course);
        await _context.SaveChangesAsync();
        return Ok(course);
    }

    [HttpPut("courses/{id}")]
    public async Task<IActionResult> UpdateCourse(int id, Course course)
    {
        var existing = await _context.Courses.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Title = course.Title;
        existing.Description = course.Description;
        existing.DurationMinutes = course.DurationMinutes;
        existing.MaxParticipants = course.MaxParticipants;
        existing.CoachId = course.CoachId;
        existing.StartAt = course.StartAt;
        await _context.SaveChangesAsync();
        return Ok(existing);
    }

    [HttpDelete("courses/{id}")]
    public async Task<IActionResult> DeleteCourse(int id)
    {
        var course = await _context.Courses.FindAsync(id);
        if (course == null) return NotFound();
        _context.Courses.Remove(course);
        await _context.SaveChangesAsync();
        return Ok();
    }

    // --- Admin Profile ---
    [HttpGet("profile/{id}")]
    public async Task<IActionResult> GetProfile(int id)
    {
        var admin = await _context.Admins.FindAsync(id);
        if (admin == null) return NotFound();
        return Ok(new { admin.Id, admin.Name, admin.Email });
    }

    [HttpPut("profile/{id}")]
    public async Task<IActionResult> UpdateProfile(int id, Admin admin)
    {
        var existing = await _context.Admins.FindAsync(id);
        if (existing == null) return NotFound();
        existing.Name = admin.Name;
        existing.Email = admin.Email;
        if (!string.IsNullOrWhiteSpace(admin.Password)) existing.Password = admin.Password;
        await _context.SaveChangesAsync();
        return Ok(new { existing.Id, existing.Name, existing.Email });
    }
}