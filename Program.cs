using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Pomelo.EntityFrameworkCore.MySql;
using sale_sport.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers()
	.AddJsonOptions(options =>
	{
		options.JsonSerializerOptions.ReferenceHandler = System.Text.Json.Serialization.ReferenceHandler.IgnoreCycles;
		options.JsonSerializerOptions.MaxDepth = 64;
		options.JsonSerializerOptions.PropertyNameCaseInsensitive = true;
	});

builder.WebHost.UseUrls("http://localhost:5280");

// ✅ Connexion MySQL (sans créer la base manuellement)
var connectionString = "server=localhost;database=sale_sport_db;uid=root;pwd=;SslMode=none;";

builder.Services.AddDbContext<GymDbContext>(options =>
	options.UseMySql(connectionString, new MySqlServerVersion(new Version(8, 0, 30))));


// builder.Services.AddControllers(); // Duplicate removed to avoid overwriting JSON settings

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Services
builder.Services.AddHttpContextAccessor();
builder.Services.AddScoped<IAccountService, AccountService>();
builder.Services.AddScoped<IEmailService, EmailService>();

builder.Services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
	.AddCookie(options =>
	{
		options.Cookie.HttpOnly = true;
		options.ExpireTimeSpan = TimeSpan.FromDays(7);
		options.SlidingExpiration = true;
		options.LoginPath = "/api/auth/login";
		options.LogoutPath = "/api/auth/logout";
	});

builder.Services.AddAuthorization(options =>
{
	options.AddPolicy("ManageAccounts", policy => policy.RequireRole("Admin", "Manager"));
});

// CORS
builder.Services.AddCors(options =>
{
	options.AddDefaultPolicy(policy =>
		policy.WithOrigins("http://localhost:4200")
			  .AllowAnyHeader()
			  .AllowAnyMethod()
			  .AllowCredentials());
});

var app = builder.Build();

// Middleware
if (app.Environment.IsDevelopment())
{
	app.UseSwagger();
	app.UseSwaggerUI();
}

// app.UseHttpsRedirection(); // Désactivé pour le développement local afin d'éviter les erreurs de redirection/CORS

app.UseStaticFiles();
app.UseCors();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

// ✅ Connexion MySQL - non bloquante si MySQL n'est pas disponible
using (var scope = app.Services.CreateScope())
{
	var db = scope.ServiceProvider.GetRequiredService<GymDbContext>();

	try
	{
		db.Database.EnsureCreated();
			
            // --- Sync schema manually for Offres (EnsureCreated doesn't update existing DBs) ---
            db.Database.ExecuteSqlRaw(@"
                CREATE TABLE IF NOT EXISTS offres (
                    Id INT AUTO_INCREMENT PRIMARY KEY,
                    Name VARCHAR(255) NOT NULL,
                    Price DECIMAL(18,2) NOT NULL,
                    Duration VARCHAR(100),
                    Description TEXT,
                    FeaturesJson TEXT
                );
            ");

            // --- Ensure MaxParticipants exists for Courses ---
            try {
                db.Database.ExecuteSqlRaw("ALTER TABLE Courses ADD COLUMN IF NOT EXISTS MaxParticipants INT DEFAULT 10;");
            } catch { /* Ignorer si la colonne existe déjà */ }
            
            // --- Ensure IsApproved exists and auto-approve existing accounts ---
            try {
                db.Database.ExecuteSqlRaw("ALTER TABLE Members ADD COLUMN IF NOT EXISTS PaymentStatus VARCHAR(50) DEFAULT 'Pending';");
                db.Database.ExecuteSqlRaw("ALTER TABLE Members ADD COLUMN IF NOT EXISTS SubscriptionEndDate DATETIME NULL;");
                db.Database.ExecuteSqlRaw("ALTER TABLE Members ADD COLUMN IF NOT EXISTS IsApproved TINYINT(1) DEFAULT 0;");
                db.Database.ExecuteSqlRaw("ALTER TABLE Members ADD COLUMN IF NOT EXISTS PhotoUrl VARCHAR(500) NULL;");
            } catch { }

            try {
                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS JobOffers (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        Title VARCHAR(200) NOT NULL,
                        Description TEXT NOT NULL,
                        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        IsActive TINYINT(1) DEFAULT 1
                    );
                ");

                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS JobApplications (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        JobOfferId INT,
                        CandidateName VARCHAR(200),
                        CvPath VARCHAR(500) NOT NULL,
                        AppliedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (JobOfferId) REFERENCES JobOffers(Id)
                    );
                ");

                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS Reviews (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        MemberName VARCHAR(200) NOT NULL,
                        Content TEXT NOT NULL,
                        Rating INT DEFAULT 5,
                        CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP,
                        MemberId INT NULL
                    );
                ");

                db.Database.ExecuteSqlRaw("ALTER TABLE JobApplications ADD COLUMN IF NOT EXISTS Status VARCHAR(50) DEFAULT 'En attente';");
                
                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS PasswordResetTokens (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        Email VARCHAR(255) NOT NULL,
                        Token VARCHAR(500) NOT NULL,
                        ExpiryDate DATETIME NOT NULL,
                        IsUsed TINYINT(1) DEFAULT 0
                    );
                ");

                db.Database.ExecuteSqlRaw(@"
                    CREATE TABLE IF NOT EXISTS Videos (
                        Id INT AUTO_INCREMENT PRIMARY KEY,
                        Title VARCHAR(255) NOT NULL,
                        FilePath VARCHAR(500) NOT NULL,
                        UploadedBy VARCHAR(100),
                        UploadedAt DATETIME DEFAULT CURRENT_TIMESTAMP
                    );
                ");

                // Seed initial review if none exists
                db.Database.ExecuteSqlRaw(@"
                    INSERT INTO Reviews (MemberName, Content, Rating)
                    SELECT 'Sophie T.', 'Une salle incroyable, le matériel est toujours propre et les coachs sont à l''écoute.', 5
                    WHERE NOT EXISTS (SELECT 1 FROM Reviews);
                ");

                // Seed initial job offer if none exists

                db.Database.ExecuteSqlRaw(@"
                    INSERT INTO JobOffers (Title, Description)
                    SELECT 'Coach Musculation Expert', 'Nous recherchons un coach passionné pour nos séances du soir (18h-22h). Expertise en haltérophilie souhaitée.'
                    WHERE NOT EXISTS (SELECT 1 FROM JobOffers);
                ");
            } catch { }

            try {
                db.Database.ExecuteSqlRaw("ALTER TABLE Coaches ADD COLUMN IF NOT EXISTS IsApproved TINYINT(1) DEFAULT 0;");
                db.Database.ExecuteSqlRaw("ALTER TABLE Coaches ADD COLUMN IF NOT EXISTS PhotoUrl VARCHAR(500) NULL;");
            } catch { /* Colonne déjà existante */ }

            try {
                db.Database.ExecuteSqlRaw("ALTER TABLE Admins ADD COLUMN IF NOT EXISTS PhotoUrl VARCHAR(500) NULL;");
            } catch { }

            try {
                db.Database.ExecuteSqlRaw("ALTER TABLE Subscriptions ADD COLUMN IF NOT EXISTS Description TEXT NULL;");
                db.Database.ExecuteSqlRaw("ALTER TABLE Subscriptions ADD COLUMN IF NOT EXISTS FeaturesJson TEXT NULL;");
            } catch { }

			Console.WriteLine("✅ Base de données OK !");

			// Seed subscriptions
			if (!db.Subscriptions.Any())
			{
				db.Subscriptions.AddRange(
					new Subscription { Name = "Basic", Price = 29, DurationInMonths = 1, Type = "Standard" },
					new Subscription { Name = "Premium", Price = 49, DurationInMonths = 1, Type = "Premium" },
					new Subscription { Name = "Annuel", Price = 399, DurationInMonths = 12, Type = "Annuel" }
				);
				db.SaveChanges();
				Console.WriteLine("✅ Abonnements initiaux ajoutés");
			}

			// Seed offres
			if (!db.Offres.Any())
			{
				db.Offres.AddRange(
					new Offre { Name = "Découverte", Price = 19, Duration = "1 Mois", Description = "Accès basique à la salle.", FeaturesJson = "[\"Accès cardio\", \"Accès musculation\"]" },
					new Offre { Name = "Elite", Price = 49, Duration = "1 Mois", Description = "Accès total avec suivi.", FeaturesJson = "[\"Accès cardio\", \"Accès musculation\", \"Cours collectifs\", \"Suivi coach\"]" },
					new Offre { Name = "Pro Annuel", Price = 399, Duration = "1 An", Description = "Abonnement VIP annuel.", FeaturesJson = "[\"Accès illimité\", \"Bilan mensuel\", \"Accès piscine\"]" }
				);
				db.SaveChanges();
				Console.WriteLine("✅ Offres initiales ajoutées");
			}

			// Seed admin
			if (!db.Admins.Any())
			{
				db.Admins.Add(new Admin
				{
					Name = "SuperAdmin",
					Email = "admin@gym.com",
					Password = "admin123"
				});
				db.SaveChanges();
			}

			// Seed coaches
			if (!db.Coaches.Any())
			{
				db.Coaches.AddRange(
					new Coach { Name = "Coach Sam", Specialty = "Fitness & Musculation", Email = "sam@gym.com", Password = "coach123", IsApproved = true },
					new Coach { Name = "Coach Leila", Specialty = "Yoga & Pilates", Email = "leila@gym.com", Password = "coach123", IsApproved = true },
					new Coach { Name = "Coach Karim", Specialty = "CrossFit", Email = "karim@gym.com", Password = "coach123", IsApproved = true },
					new Coach { Name = "Coach Sarah", Specialty = "Boxe", Email = "sarah@gym.com", Password = "coach123", IsApproved = true }
				);
				db.SaveChanges();
			}

			// Seed members
			if (!db.Members.Any())
			{
				var sub = db.Subscriptions.FirstOrDefault();
				if (sub != null)
				{
					db.Members.AddRange(
						new Member { Name = "John Doe", Age = 28, Email = "john@exemple.com", Password = "member123", SubscriptionId = sub.Id, IsApproved = true, PaymentStatus = "Paid" },
						new Member { Name = "Jane Smith", Age = 24, Email = "jane@exemple.com", Password = "member123", SubscriptionId = sub.Id, IsApproved = true, PaymentStatus = "Paid" },
						new Member { Name = "Alice Martin", Age = 32, Email = "alice@exemple.com", Password = "member123", SubscriptionId = sub.Id, IsApproved = true, PaymentStatus = "Pending" },
						new Member { Name = "Bob Leblanc", Age = 40, Email = "bob@exemple.com", Password = "member123", SubscriptionId = sub.Id, IsApproved = true, PaymentStatus = "Paid" }
					);
					db.SaveChanges();
				}
			}

			// Seed courses
			if (!db.Courses.Any())
			{
				var coach = db.Coaches.FirstOrDefault();
				db.Courses.AddRange(
					new Course { Title = "Musculation Débutant", Description = "Cours pour débutants", DurationMinutes = 60, CoachId = coach?.Id, StartAt = DateTime.Now.AddDays(1) },
					new Course { Title = "Yoga Matinal", Description = "Yoga relaxant le matin", DurationMinutes = 45, CoachId = coach?.Id, StartAt = DateTime.Now.AddDays(2) },
					new Course { Title = "CrossFit Intensif", Description = "Entraînement haute intensité", DurationMinutes = 50, CoachId = coach?.Id, StartAt = DateTime.Now.AddDays(3) }
				);
				db.SaveChanges();
			}

			Console.WriteLine("📋 Données seed OK - L'API est prête !");
	}
	catch (Exception ex)
	{
		Console.WriteLine($"⚠️  Erreur DB (non bloquante): {ex.Message.Split('\n')[0]}");
		Console.WriteLine("   Vérifiez que XAMPP/MySQL est démarré sur le port 3306.");
	}
}

app.Run();