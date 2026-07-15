using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

namespace sale_sport.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReviewsController : ControllerBase
{
    private readonly GymDbContext _context;

    public ReviewsController(GymDbContext context)
    {
        _context = context;
    }

    // --- Public: Voir les avis ---
    [HttpGet]
    public async Task<IActionResult> GetReviews()
    {
        var reviews = await _context.Reviews
                                   .OrderByDescending(r => r.CreatedAt)
                                   .Take(10) // On prend les 10 plus récents
                                   .ToListAsync();
        return Ok(reviews);
    }

    // --- Membres: Laisser un avis ---
    [HttpPost]
    public async Task<IActionResult> CreateReview([FromBody] Review review)
    {
        if (review.Rating < 1 || review.Rating > 5) 
            return BadRequest("La note doit être entre 1 et 5.");

        _context.Reviews.Add(review);
        await _context.SaveChangesAsync();
        return Ok(review);
    }
}
