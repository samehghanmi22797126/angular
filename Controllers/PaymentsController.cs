using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using sale_sport.Data;
using sale_sport.Models;
using Stripe;

namespace sale_sport.Controllers;

[ApiController]
[Route("api/[controller]")]
public class PaymentsController : ControllerBase
{
    private readonly GymDbContext _context;
    private readonly IConfiguration _configuration;

    public PaymentsController(GymDbContext context, IConfiguration configuration)
    {
        _context = context;
        _configuration = configuration;
        StripeConfiguration.ApiKey = _configuration["Stripe:SecretKey"] ?? "sk_test_VOTRE_CLE_SECRETE_TEST";
    }

    [HttpPost("process")]
    public async Task<IActionResult> ProcessPayment([FromBody] PaymentRequest request)
    {
        var member = await _context.Members.Include(m => m.Subscription)
                                         .FirstOrDefaultAsync(m => m.Id == request.MemberId);

        if (member == null) return NotFound("Membre non trouvé.");
        if (!member.IsApproved) return BadRequest("Votre compte doit être approuvé par un administrateur avant de pouvoir effectuer un paiement.");

        var subscription = await _context.Subscriptions.FindAsync(request.PlanId);
        if (subscription == null) return NotFound("Offre non trouvée.");

        try
        {
            var expParts = request.ExpiryDate.Split('/');
            var expMonth = long.Parse(expParts[0].Trim());
            var expYear = long.Parse(expParts[1].Trim());
            if (expYear < 100) expYear += 2000;

            // 1. Création du Token de carte avec l'API Stripe
            var tokenOptions = new TokenCreateOptions
            {
                Card = new TokenCardOptions
                {
                    Number = request.CardNumber,
                    ExpMonth = expMonth.ToString(),
                    ExpYear = expYear.ToString(),
                    Cvc = request.Cvv,
                },
            };
            var tokenService = new TokenService();
            var stripeToken = await tokenService.CreateAsync(tokenOptions);

            // 2. Création de la transaction (Charge)
            var chargeOptions = new ChargeCreateOptions
            {
                Amount = (long)(subscription.Price * 100), // Montant en centimes
                Currency = "dinars", // Vous pouvez changer en "usd" ou "mad" selon votre besoin
                Description = $"Abonnement: {subscription.Name} | Membre: {member.Name}",
                Source = stripeToken.Id,
            };
            var chargeService = new ChargeService();
            var charge = await chargeService.CreateAsync(chargeOptions);

            if (charge.Status != "succeeded")
            {
                return BadRequest(new { message = $"Le paiement a échoué: {charge.FailureMessage}" });
            }

            // 3. Mise à jour du membre après paiement validé
            member.SubscriptionId = subscription.Id;
            member.PaymentStatus = "Paid";
            member.SubscriptionEndDate = DateTime.Now.AddMonths(subscription.DurationInMonths);

            await _context.SaveChangesAsync();

            return Ok(new { 
                message = "Paiement réel réussi avec Stripe !", 
                expiryDate = member.SubscriptionEndDate,
                chargeId = charge.Id
            });
        }
        catch (StripeException e)
        {
            return BadRequest(new { message = $"Erreur Stripe: {e.StripeError.Message}" });
        }
        catch (Exception ex)
        {
            return StatusCode(500, new { message = $"Erreur interne: {ex.Message}" });
        }
    }
}

public class PaymentRequest
{
    public int MemberId { get; set; }
    public int PlanId { get; set; }
    public string CardNumber { get; set; } = null!;
    public string ExpiryDate { get; set; } = null!;
    public string Cvv { get; set; } = null!;
}
