using MailKit.Net.Smtp;
using MailKit.Security;
using MimeKit;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace sale_sport.Services
{
    public class EmailService : IEmailService
    {
        private readonly IConfiguration _config;
        private readonly ILogger<EmailService> _logger;

        public EmailService(IConfiguration config, ILogger<EmailService> logger)
        {
            _config = config;
            _logger = logger;
        }

        public async Task SendEmailAsync(string to, string subject, string body)
        {
            var smtpHost = _config["SmtpSettings:Host"] ?? "smtp.gmail.com";
            var smtpPort = int.Parse(_config["SmtpSettings:Port"] ?? "587");
            var smtpUser = _config["SmtpSettings:Username"];
            var smtpPass = _config["SmtpSettings:Password"];
            var fromEmail = _config["SmtpSettings:FromEmail"] ?? smtpUser;

            Console.WriteLine($"\n--- Tentative d'envoi d'email RÉEL via MailKit à : {to} ---");

            var senderEmail = fromEmail ?? smtpUser ?? "info@gymsport.com";
            
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("GYM Sport", senderEmail));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };
            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            try
            {
                // Connexion au serveur SMTP
                await client.ConnectAsync(smtpHost, smtpPort, SecureSocketOptions.StartTls);

                // Authentification
                if (!string.IsNullOrWhiteSpace(smtpUser) && !string.IsNullOrWhiteSpace(smtpPass) && !smtpPass.Contains("MOT_DE_PASSE"))
                {
                    await client.AuthenticateAsync(smtpUser, smtpPass);
                    await client.SendAsync(message);
                    await client.DisconnectAsync(true);
                    Console.WriteLine($"✅ SUCCÈS : L'email a bien été envoyé à {to}");
                    _logger.LogInformation($"Email envoyé à {to}");
                }
                else
                {
                    Console.WriteLine("⚠️ ATTENTION : L'email n'a pas été envoyé car le mot de passe dans appsettings.json est invalide ou absent.");
                    await client.DisconnectAsync(true);
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ ERREUR FATALE LORS DE L'ENVOI : {ex.Message}");
                _logger.LogError(ex, "Erreur MailKit");
            }
        }
    }
}
