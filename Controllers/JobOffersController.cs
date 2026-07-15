using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;
using sale_sport.Services;
using System.IO;

namespace sale_sport.Controllers;

[ApiController]
[Route("api/[controller]")]
public class JobOffersController : ControllerBase
{
    private readonly GymDbContext _context;
    private readonly IWebHostEnvironment _env;
    private readonly IEmailService _emailService;

    public JobOffersController(GymDbContext context, IWebHostEnvironment env, IEmailService emailService)
    {
        _context = context;
        _env = env;
        _emailService = emailService;
    }

    // --- Public: Voir les offres ---
    [HttpGet]
    public async Task<IActionResult> GetOffers()
    {
        var offers = await _context.JobOffers
                                 .Where(o => o.IsActive)
                                 .OrderByDescending(o => o.CreatedAt)
                                 .ToListAsync();
        return Ok(offers);
    }

    // --- Admin: Créer une offre ---
    [HttpPost]
    public async Task<IActionResult> CreateOffer([FromBody] JobOffer offer)
    {
        _context.JobOffers.Add(offer);
        await _context.SaveChangesAsync();
        return Ok(offer);
    }

    // --- Public: Déposer un CV (PDF uniquement) ---
    [HttpPost("apply/{id}")]
    public async Task<IActionResult> Apply(int id, IFormFile cvFile, [FromForm] string? candidateName, [FromForm] string? candidateEmail)
    {
        if (cvFile == null || cvFile.Length == 0) return BadRequest("Fichier vide.");
        if (Path.GetExtension(cvFile.FileName).ToLower() != ".pdf") return BadRequest("Seul le format PDF est accepté.");

        var offer = await _context.JobOffers.FindAsync(id);
        if (offer == null) return NotFound("Offre non trouvée.");

        // Création du dossier si inexistant
        string uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "cvs");
        if (!Directory.Exists(uploadsFolder)) Directory.CreateDirectory(uploadsFolder);

        // Nom de fichier unique
        string fileName = $"CV_{id}_{DateTime.Now.Ticks}.pdf";
        string filePath = Path.Combine(uploadsFolder, fileName);

        using (var stream = new FileStream(filePath, FileMode.Create))
        {
            await cvFile.CopyToAsync(stream);
        }

        var application = new JobApplication
        {
            JobOfferId = id,
            CvPath = fileName,
            CandidateName = candidateName ?? "Candidat Anonyme",
            CandidateEmail = candidateEmail
        };

        _context.JobApplications.Add(application);
        await _context.SaveChangesAsync();

        return Ok(new { message = "Votre CV a été transmis avec succès !" });
    }

    // --- Admin: Voir les candidatures ---
    [HttpGet("applications")]
    public async Task<IActionResult> GetApplications()
    {
        var apps = await _context.JobApplications
                                .Include(a => a.JobOffer)
                                .OrderByDescending(a => a.AppliedAt)
                                .ToListAsync();
        return Ok(apps);
    }

    // --- Admin: Accepter/Refuser une candidature ---
    [HttpPatch("applications/{id}/status")]
    public async Task<IActionResult> UpdateStatus(int id, [FromQuery] string status)
    {
        var application = await _context.JobApplications
            .Include(a => a.JobOffer)
            .FirstOrDefaultAsync(a => a.Id == id);
        if (application == null) return NotFound("Candidature non trouvée.");

        application.Status = status;
        await _context.SaveChangesAsync();

        // --- Envoi d'email si le CV est accepté ---
        if (status == "Accepté" && !string.IsNullOrWhiteSpace(application.CandidateEmail))
        {
            try
            {
                string subject = "🎉 Votre candidature a été acceptée - GYM Sport";
                string body = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #28a745;'>Félicitations !</h2>
                        <p>Bonjour <strong>{application.CandidateName}</strong>,</p>
                        <p>Nous avons le plaisir de vous informer que votre candidature pour le poste de <strong>{application.JobOffer?.Title ?? "Coach"}</strong> a été <span style='color: #28a745; font-weight: bold;'>acceptée</span> !</p>
                        <p>Notre équipe vous contactera très prochainement pour les prochaines étapes.</p>
                        <br>
                        <p>Bienvenue dans l'équipe <strong>GYM Sport</strong> ! 💪</p>
                    </div>";
                await _emailService.SendEmailAsync(application.CandidateEmail, subject, body);
            }
            catch { /* Ignorer l'échec de l'email */ }
        }

        // --- Envoi d'email si le CV est refusé ---
        if (status == "Refusé" && !string.IsNullOrWhiteSpace(application.CandidateEmail))
        {
            try
            {
                string subject = "Réponse à votre candidature - GYM Sport";
                string body = $@"
                    <div style='font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;'>
                        <h2 style='color: #dc3545;'>Merci pour votre intérêt</h2>
                        <p>Bonjour <strong>{application.CandidateName}</strong>,</p>
                        <p>Nous avons bien étudié votre candidature pour le poste de <strong>{application.JobOffer?.Title ?? "Coach"}</strong>. Malheureusement, nous ne pouvons pas donner suite à votre candidature pour le moment.</p>
                        <p>Nous vous souhaitons bonne chance dans vos recherches.</p>
                        <br>
                        <p>L'équipe <strong>GYM Sport</strong></p>
                    </div>";
                await _emailService.SendEmailAsync(application.CandidateEmail, subject, body);
            }
            catch { /* Ignorer l'échec de l'email */ }
        }

        return Ok(new { message = $"Statut mis à jour : {status}" });
    }
}

