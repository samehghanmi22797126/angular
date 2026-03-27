using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.Preserve;
		options.JsonSerializerOptions.MaxDepth = 64; // si nécessaire
	});
// ✅ IMPORTANT : forcer HTTP pour Angular
builder.WebHost.UseUrls("http://localhost:5280");

// ✅ Chemin FIXE de la base
var connectionString = @"Data Source=C:\Users\sameh\OneDrive\Bureau\projett\sale_sport.db";

builder.Services.AddDbContext<GymDbContext>(options =>
	options.UseSqlite(connectionString));

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// ✅ CORS Angular
builder.Services.AddCors(options =>
{
	options.AddDefaultPolicy(policy =>
		policy.WithOrigins("http://localhost:4200")
			  .AllowAnyHeader()
			  .AllowAnyMethod());
});

var app = builder.Build();

// ✅ Middleware
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection(); // (optionnel mais recommandé)
app.UseCors();

app.MapControllers();

// ✅ SEED DATA (NE PAS SUPPRIMER)
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();

	// Création DB si n'existe pas
	db.Database.EnsureCreated();

	try
	{
		// 🔥 SUBSCRIPTIONS
		if (!db.Subscriptions.Any())
		{
			db.Subscriptions.Add(new Subscription { Name = "Basic", Price = 30 });
			db.Subscriptions.Add(new Subscription { Name = "Premium", Price = 50 });
			db.SaveChanges();
		}

		// 🔥 ADMIN
		if (!db.Admins.Any())
		{
			db.Admins.Add(new Admin
			{
				Name = "SuperAdmin",
				Email = "admin@example.com",
				Password = "admin123"
			});
			db.SaveChanges();
		}

		// 🔥 COACH
		if (!db.Coaches.Any())
		{
			db.Coaches.Add(new Coach
			{
				Name = "Coach Sam",
				Specialty = "Fitness",
				Email = "coach@example.com",
				Password = "coach123"
			});
			db.SaveChanges();
		}

		// 🔥 MEMBER
		if (!db.Members.Any())
		{
			var sub = db.Subscriptions.First();

			db.Members.Add(new Member
			{
				Name = "John Doe",
				Age = 25,
				Email = "member@example.com",
				Password = "member123",
				SubscriptionId = sub.Id
			});
			db.SaveChanges();
		}

		// ✅ Vérification console
		Console.WriteLine("Admins: " + db.Admins.Count());
		Console.WriteLine("Coaches: " + db.Coaches.Count());
		Console.WriteLine("Members: " + db.Members.Count());
		Console.WriteLine("Subscriptions: " + db.Subscriptions.Count());
	}
	catch (Exception ex)
	{
		Console.WriteLine("Erreur Seed: " + ex.Message);
	}
}

app.Run();