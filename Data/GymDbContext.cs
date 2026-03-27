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

	protected override void OnModelCreating(ModelBuilder modelBuilder)
	{
		base.OnModelCreating(modelBuilder);

		// Member -> Subscription : One-to-One
		modelBuilder.Entity<Member>()
			.HasOne(m => m.Subscription)
			.WithOne(s => s.Member)
			.HasForeignKey<Subscription>(s => s.MemberId);

		// Member -> Courses : Many-to-Many
		modelBuilder.Entity<Member>()
			.HasMany(m => m.Courses)
			.WithMany(c => c.Members);
	}
}
