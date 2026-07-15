using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using sale_sport.Data;
using sale_sport.Models;
using System;
using System.IO;
using System.Linq;
using System.Threading.Tasks;

namespace sale_sport.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class VideosController : ControllerBase
    {
        private readonly GymDbContext _context;
        private readonly IWebHostEnvironment _env;

        public VideosController(GymDbContext context, IWebHostEnvironment env)
        {
            _context = context;
            _env = env;
        }

        [HttpGet]
        public IActionResult GetVideos()
        {
            var videos = _context.Videos.OrderByDescending(v => v.UploadedAt).ToList();
            return Ok(videos);
        }

        [HttpPost("upload")]
        public async Task<IActionResult> UploadVideo([FromForm] IFormFile file, [FromForm] string title, [FromForm] string uploadedBy)
        {
            if (file == null || file.Length == 0)
                return BadRequest("No file uploaded.");

            var uploadsFolder = Path.Combine(_env.ContentRootPath, "wwwroot", "uploads", "videos");
            if (!Directory.Exists(uploadsFolder))
                Directory.CreateDirectory(uploadsFolder);

            var fileName = Guid.NewGuid().ToString() + Path.GetExtension(file.FileName);
            var filePath = Path.Combine(uploadsFolder, fileName);

            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var video = new Video
            {
                Title = title,
                FilePath = "/uploads/videos/" + fileName,
                UploadedBy = uploadedBy,
                UploadedAt = DateTime.Now
            };

            _context.Videos.Add(video);
            await _context.SaveChangesAsync();

            return Ok(video);
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteVideo(int id)
        {
            var video = await _context.Videos.FindAsync(id);
            if (video == null)
                return NotFound();

            // Delete physical file
            try
            {
                var filePath = Path.Combine(_env.ContentRootPath, "wwwroot", video.FilePath.TrimStart('/'));
                if (System.IO.File.Exists(filePath))
                {
                    System.IO.File.Delete(filePath);
                }
            }
            catch (Exception ex)
            {
                // Log the error but continue with database removal
                Console.WriteLine($"Could not delete file: {ex.Message}");
            }

            _context.Videos.Remove(video);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Vidéo supprimée avec succès" });
        }
    }
}
