namespace sale_sport.Models;

public class Admin
{
	public int Id { get; set; }
	public string Name { get; set; } = "";
	public string Email { get; set; } = "";
	public string Password { get; set; } = ""; // ⚡️ pour simplifier, mot de passe en clair (à améliorer plus tard)
}