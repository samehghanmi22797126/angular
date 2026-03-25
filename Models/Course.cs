namespace sale_sport.Models;

public class Course
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Description { get; set; }
    // When the course is scheduled (date/time)
    public DateTime? StartAt { get; set; }
    // Duration in minutes
    public int DurationMinutes { get; set; }

    // Optional coach leading the course
    public int? CoachId { get; set; }
    public Coach? Coach { get; set; }

    // Members registered to this course (many-to-many)
    public ICollection<Member> Members { get; set; } = new List<Member>();
}
