using Microsoft.EntityFrameworkCore;
using sale_sport.Models;

namespace sale_sport.Data;

public class GymDbContext : DbContext
{
	public GymDbContext(DbContextOptions<GymDbContext> options) : base(options) { }

	public DbSet<Member> Members => Set<Member>();
	public DbSet<Coach> Coaches => Set<Coach>();
	public DbSet<Subscription> Subscriptions => Set<Subscription>();
    public DbSet<Course> Courses => Set<Course>();
	public DbSet<Admin> Admins => Set<Admin>();
	public DbSet<Offre> Offres => Set<Offre>();
	public DbSet<JobOffer> JobOffers { get; set; }
	public DbSet<JobApplication> JobApplications { get; set; }
	public DbSet<Review> Reviews { get; set; }
	public DbSet<PasswordResetToken> PasswordResetTokens { get; set; }
	public DbSet<Video> Videos { get; set; }


	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Subscription -> Members : One-to-Many (Un forfait pour plusieurs membres)
		modelBuilder.Entity<Member>()
			.HasOne(m => m.Subscription)
			.WithMany(s => s.Members)
			.HasForeignKey(m => m.SubscriptionId);

		// Member -> Courses : Many-to-Many
		modelBuilder.Entity<Member>()
			.HasMany(m => m.Courses)
			.WithMany(c => c.Members);
	}
}
