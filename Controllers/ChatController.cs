using Microsoft.AspNetCore.Mvc;
using System.Text;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Collections.Concurrent;

namespace sale_sport.Controllers
{
	[Route("api/[controller]")]
	[ApiController]
	public class ChatbotController : ControllerBase
	{
		private readonly IConfiguration _configuration;

		private static readonly ConcurrentQueue<ChatMessage> _store = new();
		private const int MaxStored = 1000;

		public ChatbotController(IConfiguration configuration)
		{
			_configuration = configuration;
		}

		// ===== SEND MESSAGE (HYBRIDE : Algorithme d'abord, puis IA) =====
		[HttpPost("send")]
		public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
		{
			Console.WriteLine($"\n--- MESSAGE REÇU DU FRONTEND ---");
			Console.WriteLine($"User: {request?.UserName} (ID: {request?.UserId})");
			Console.WriteLine($"Texte: {request?.Message}");

			if (string.IsNullOrWhiteSpace(request?.Message)) {
				Console.WriteLine("⚠️ Message vide reçu.");
				return BadRequest(new { response = "Veuillez entrer un message." });
			}

			var userMsg = new ChatMessage
			{
				UserId = request.UserId,
				UserName = request.UserName,
				Text = request.Message,
				FromBot = false,
				Timestamp = DateTime.UtcNow
			};

			Enqueue(userMsg);

			ChatMessage botReply;
			var geminiKey = _configuration["Gemini:ApiKey"];

			// 1️⃣ Priorité à Gemini (Gratuit et fonctionnel)
			if (!string.IsNullOrWhiteSpace(geminiKey))
			{
				var reply = await TryGeminiFallback(request.Message, request.UserName);
				if (reply != null)
				{
					botReply = reply;
				}
				else
				{
					// 2️⃣ Secours sur OpenAI si Gemini échoue
					var openAiKey = _configuration["OpenAI:ApiKey"];
					if (!string.IsNullOrWhiteSpace(openAiKey))
					{
						botReply = await GenerateReplyFromOpenAI(request.Message, openAiKey, request.UserName);
					}
					else
					{
						botReply = null;
					}
				}
			}
			else
			{
				// 3️⃣ Secours sur OpenAI si pas de clé Gemini
				var openAiKey = _configuration["OpenAI:ApiKey"];
				botReply = await GenerateReplyFromOpenAI(request.Message, openAiKey, request.UserName);
			}

			// 4️⃣ Fallback final local si aucune IA n'a répondu
			if (botReply == null)
			{
				var local = GetSimpleResponse(request.Message);
				botReply = new ChatMessage
				{
					UserId = "bot",
					UserName = "CoachBot",
					Text = local ?? GetDefaultFallbackMessage(),
					FromBot = true,
					Timestamp = DateTime.UtcNow
				};
			}

			Enqueue(botReply);

			return Ok(new { response = botReply.Text });
		}

		// ===== OPENAI DIRECT =====
		[HttpPost("openai")]
		public async Task<IActionResult> SendToOpenAI([FromBody] ChatRequest request)
		{
			if (string.IsNullOrWhiteSpace(request?.Message))
				return BadRequest(new { response = "Veuillez entrer un message." });

			var apiKey = _configuration["OpenAI:ApiKey"];

			if (string.IsNullOrWhiteSpace(apiKey))
				return Ok(new { response = GetSimpleResponse(request.Message) ?? GetDefaultFallbackMessage() });

			var reply = await GenerateReplyFromOpenAI(request.Message, apiKey, request.UserName);

			Enqueue(reply);

			return Ok(new { response = reply.Text });
		}

		// ===== HISTORY =====
		[HttpGet("history")]
		public IActionResult History([FromQuery] int limit = 50)
		{
			if (limit <= 0) limit = 50;

			var items = _store.Reverse().Take(limit).Reverse().ToArray();

			return Ok(items);
		}

		// ===== HEALTH =====
		[HttpGet("health")]
		public IActionResult Health() => Ok(new { status = "ok" });

		// ===== INTERNAL =====

		private void Enqueue(ChatMessage msg)
		{
			_store.Enqueue(msg);

			while (_store.Count > MaxStored && _store.TryDequeue(out _)) { }
		}

		// 🔥 OPENAI
		private async Task<ChatMessage> GenerateReplyFromOpenAI(string message, string apiKey, string userName = "Client")
		{
			Console.WriteLine($"\n🤖 Chatbot : Demande OpenAI pour '{userName}'...");
			try
			{
				using var client = new HttpClient();
				client.Timeout = TimeSpan.FromSeconds(15); // Timeout pour éviter de bloquer
				client.DefaultRequestHeaders.Add("Authorization", $"Bearer {apiKey}");

				var systemPrompt = $@"
Tu es l'assistant virtuel (CoachBot) de la salle de sport APEX PERFORMANCE CENTER.

📍 LOCALISATION :
Nous sommes situés au 11-13 Rue de l'Artisanat, El Ghazala, Ariana (à côté de l'Université TEK-UP).

⏰ HORAIRES :
- Lundi au Vendredi : 06h00 - 22h00
- Samedi et Dimanche : 08h00 - 20h00

💰 TARIFS & ABONNEMENTS :
- Basic (29€/mois) : Musculation + Cardio.
- Standard (49€/mois) : Basic + Cours collectifs illimités.
- Premium (79€/mois) : Standard + 1h Personal Training/semaine + Sauna.

🏋️ SERVICES & COURS :
Musculation (plus de 100 machines), Cardio (tapis, vélos, rameurs), CrossFit, Yoga, Pilates, Stretching.

👥 NOS COACHS :
Ahmed Mansour (Performance), Sara Ben Saleh (Fitness), Sam, Leila et Karim.

👤 Client : {userName}

🎯 TON RÔLE :
- Répondre avec précision en utilisant les données ci-dessus.
- Être motivant et professionnel 💪🔥.
- Donner des réponses courtes et percutantes.
- Français uniquement.
- Encourage l'inscription ou la visite à la salle.
";

				var body = new
				{
					model = "gpt-4o-mini",
					messages = new[]
					{
						new { role = "system", content = systemPrompt },
						new { role = "user", content = message }
					},
					max_tokens = 300,
					temperature = 0.7
				};

				var jsonRequest = JsonSerializer.Serialize(body);
				var content = new StringContent(jsonRequest, Encoding.UTF8, "application/json");

				var resp = await client.PostAsync("https://api.openai.com/v1/chat/completions", content);

				if (!resp.IsSuccessStatusCode)
				{
					var errorBody = await resp.Content.ReadAsStringAsync();
					Console.WriteLine($"❌ OpenAI ERROR {resp.StatusCode}: {errorBody}");

					// 🔄 ESSAYER GEMINI SI OPENAI ÉCHOUE (QUOTA/CLÉ)
					Console.WriteLine("🔄 Tentative de fallback sur Gemini...");
					var geminiReply = await TryGeminiFallback(message, userName);
					if (geminiReply != null) return geminiReply;

					throw new Exception($"OpenAI a retourné {resp.StatusCode}");
				}

				var json = await resp.Content.ReadAsStringAsync();
				var result = JsonSerializer.Deserialize<OpenAIResponse>(json, new JsonSerializerOptions { PropertyNameCaseInsensitive = true });
				var replyText = result?.choices?.FirstOrDefault()?.message?.content?.Trim();

				if (string.IsNullOrEmpty(replyText)) throw new Exception("Réponse vide d'OpenAI");

				Console.WriteLine("✅ Réponse OpenAI reçue !");
				return new ChatMessage
				{
					UserId = "bot",
					UserName = "CoachBot",
					Text = replyText,
					FromBot = true,
					Timestamp = DateTime.UtcNow
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"❌ OpenAI EXCEPTION: {ex.Message}");

				// 🔄 DERNIER ESSAI GEMINI
				var geminiReply = await TryGeminiFallback(message, userName);
				if (geminiReply != null) return geminiReply;

				// 🛑 FALLBACK LOCAL SI TOUT ÉCHOUE
				var local = GetSimpleResponse(message);
				return new ChatMessage
				{
					UserId = "bot",
					UserName = "CoachBot",
					Text = local ?? GetDefaultFallbackMessage(),
					FromBot = true,
					Timestamp = DateTime.UtcNow
				};
			}
		}

		// 🔥 GEMINI FALLBACK (API gratuite de Google)
		private async Task<ChatMessage?> TryGeminiFallback(string message, string userName)
		{
			try
			{
				var geminiKey = _configuration["Gemini:ApiKey"];
				if (string.IsNullOrWhiteSpace(geminiKey)) return null;

				using var client = new HttpClient();

				var prompt = $@"
Tu es CoachBot, l'assistant de la salle APEX PERFORMANCE CENTER.

📍 INFOS UTILES (A n'utiliser que si demandé) :
- Adresse: 11-13 Rue de l'Artisanat, El Ghazala, Ariana.
- Horaires: Lun-Ven 06h-22h, Sam-Dim 08h-20h.
- Tarifs: Basic 29€, Standard 49€, Premium 79€.
- Coachs: Ahmed Mansour, Sara Ben Saleh, Sam, Leila, Karim.

🎯 REGLE D'OR : 
- Réponds UNIQUEMENT à la question posée. 
- Ne donne JAMAIS toutes les infos d'un coup.
- Sois très bref et direct. 
- Pas de longs paragraphes.
- Utilise des emojis pour rester motivant.

Client: {userName}
Question du client: {message}";

				var body = new
				{
					contents = new[]
					{
						new { parts = new[] { new { text = prompt } } }
					}
				};

				var content = new StringContent(JsonSerializer.Serialize(body), Encoding.UTF8, "application/json");

				var resp = await client.PostAsync(
					$"https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key={geminiKey}",
					content);

				if (!resp.IsSuccessStatusCode)
				{
					var errBody = await resp.Content.ReadAsStringAsync();
					Console.WriteLine($"❌ Gemini ERROR {resp.StatusCode}: {errBody}");
					return null;
				}

				var json = await resp.Content.ReadAsStringAsync();
				using var doc = JsonDocument.Parse(json);
				var replyText = doc.RootElement
					.GetProperty("candidates")[0]
					.GetProperty("content")
					.GetProperty("parts")[0]
					.GetProperty("text")
					.GetString()?.Trim();

				if (string.IsNullOrEmpty(replyText)) return null;

				Console.WriteLine("✅ Gemini réponse OK !");

				return new ChatMessage
				{
					UserId = "bot",
					UserName = "CoachBot",
					Text = replyText,
					FromBot = true,
					Timestamp = DateTime.UtcNow
				};
			}
			catch (Exception ex)
			{
				Console.WriteLine($"❌ Gemini EXCEPTION: {ex.Message}");
				return null;
			}
		}

		// 🔥 MESSAGE PAR DÉFAUT (quand ni l'algorithme ni l'IA ne peuvent répondre)
		private string GetDefaultFallbackMessage()
		{
			return "🤔 Je n'ai pas encore de réponse précise pour ça. Mais tu peux me poser des questions sur :\n" +
				   "• Nos tarifs et offres 💰\n" +
				   "• Nos horaires ⏰\n" +
				   "• Nos cours (Yoga, CrossFit...) 🏋️\n" +
				   "• Nos coachs 👨‍🏫\n" +
				   "• Notre adresse à El Ghazala 📍";
		}

		// 🔥 RÉPONSES LOCALES (retourne null si aucune correspondance)
		private string? GetSimpleResponse(string message)
		{
			if (string.IsNullOrWhiteSpace(message)) return null;
			
			message = message.ToLower();

			// --- SALUTATIONS ---
			if (Match(message, "bonjour", "salut", "coucou", "hello", "hi"))
				return "👋 Bonjour ! Je suis CoachBot d'Apex Performance. Comment puis-je t'aider aujourd'hui ? 💪";

			if (Match(message, "ca va", "comment vas", "sa va"))
				return "Je vais super bien ! Prêt pour une séance explosive ? 🔥💪";

			// --- EXERCICES SPECIFIQUES (Nouveau !) ---
			if (Match(message, "abdo", "ventre", "gainage"))
				return "🔥 Pour les abdos, je te conseille : \n1. La planche (gainage)\n2. Les crunchs\n3. Le leg raise.\n\nNos coachs peuvent te montrer la technique parfaite sur le plateau !";

			if (Match(message, "fessier", "squat", "jambe", "cuisse"))
				return "🍑 Pour sculpter les jambes et fessiers : Squats, Fentes et Hip Thrust sont tes meilleurs amis ! Passe voir Sara Ben Saleh, c'est son expertise.";

			if (Match(message, "bras", "biceps", "triceps", "poids"))
				return "💪 Pour les bras, on a plus de 30 machines dédiées et une zone de poids libres complète. Curl barre ou extension triceps ? On a tout !";

			// --- NUTRITION & REGIME ---
			if (Match(message, "manger", "nutrition", "regime", "diet", "poids", "maigrir", "grossir"))
				return "🥗 La nutrition représente 70% du résultat ! On conseille un bon apport en protéines et beaucoup d'eau. \n\n💡 On propose des bilans nutritionnels personnalisés avec nos coachs Premium.";

			// --- INSCRIPTION & COMPTE ---
			if (Match(message, "inscr", "creer", "compte", "devenir membre"))
				return "📝 C'est super simple ! Clique sur 'S'inscrire' en haut de la page, remplis le formulaire et choisis ton forfait. On valide ton accès en moins de 24h !";

			if (Match(message, "paiement", "payer", "carte", "argent"))
				return "💳 On accepte les paiements en ligne par carte ou directement à l'accueil de la salle (El Ghazala).";

			// --- TARIFS & ABONNEMENTS ---
			if (Match(message, ("prix", "combien"), "abonnement", "tarif", "paye", "coût", "offre", "plans"))
			{
				return "💰 Nos forfaits :\n" +
					   "1️⃣ Basic (29€/mois) : Musculation + Cardio\n" +
					   "2️⃣ Standard (49€/mois) : Basic + Tous les cours collectifs\n" +
					   "3️⃣ Premium (79€/mois) : Standard + Personal Training + Sauna\n\nLequel te tente ? 🔥";
			}

			// --- HORAIRES ---
			if (Match(message, "horaire", "ouvert", "ferme", "quand", "heure"))
			{
				return "⏰ Horaires :\n" +
					   "- Lun-Ven : 06h00 - 22h00\n" +
					   "- Sam-Dim : 08h00 - 20h00\n\nOn est ouvert 7j/7 ! 💪";
			}

			// --- COURS ---
			if (Match(message, "cours", "activit", "sport", "yoga", "crossfit", "musculation", "cardio", "pilates"))
			{
				return "🏋️ Activités disponibles :\n" +
					   "- CrossFit & HIIT\n" +
					   "- Yoga & Pilates\n" +
					   "- Plateau Musculation (100+ machines)\n" +
					   "- Zumba & Cardio Boxing\n\nTu veux tester un cours ? 😊";
			}

			// --- LOCALISATION ---
			if (Match(message, "localisation", "localis", "adresse", "emplacement", "situé", "tek-up", "ghazala", "où est", "ou se trouve", "ou etes"))
			{
				return "📍 Adresse : 11-13 Rue de l'Artisanat, El Ghazala, Ariana (à côté de l'Université TEK-UP).";
			}

			if (Match(message, "merci", "cool", "super", "parfait", "top"))
				return "😊 Avec plaisir ! N'hésite pas si tu as d'autres questions. À plus chez Apex ! 🚀";

			// ❌ Si vraiment rien ne match, on passe à l'IA
			return null;
		}

		// Utilitaire pour matcher des mots avec vérification de limites pour les mots courts
		private bool Match(string msg, params string[] keywords) 
		{
			return keywords.Any(k => 
			{
				if (k.Length <= 3) // Pour les mots courts comme "hi", "ou", "prix"
				{
					// On vérifie que c'est un mot entier (entouré d'espaces ou ponctuation)
					return System.Text.RegularExpressions.Regex.IsMatch(msg, $@"\b{System.Text.RegularExpressions.Regex.Escape(k)}\b");
				}
				return msg.Contains(k);
			});
		}

		private bool Match(string msg, (string, string) allOf, params string[] keywords) 
		{
			bool bothMatch = msg.Contains(allOf.Item1) && msg.Contains(allOf.Item2);
			return bothMatch || Match(msg, keywords);
		}

	}

	// ===== MODELS =====
	public class ChatRequest
	{
		[JsonPropertyName("userId")]
		public string UserId { get; set; } = string.Empty;

		[JsonPropertyName("userName")]
		public string UserName { get; set; } = string.Empty;

		[JsonPropertyName("message")]
		public string Message { get; set; } = string.Empty;
	}

	public class ChatMessage
	{
		public string Id { get; set; } = Guid.NewGuid().ToString();
		public string UserId { get; set; } = string.Empty;
		public string UserName { get; set; } = string.Empty;
		public string Text { get; set; } = string.Empty;
		public DateTime Timestamp { get; set; } = DateTime.UtcNow;
		public bool FromBot { get; set; }
	}

	// ===== OPENAI RESPONSE =====
	public class OpenAIResponse
	{
		public Choice[] choices { get; set; } = Array.Empty<Choice>();
	}

	public class Choice
	{
		public Message message { get; set; } = new();
	}

	public class Message
	{
		public string content { get; set; } = string.Empty;
	}
}