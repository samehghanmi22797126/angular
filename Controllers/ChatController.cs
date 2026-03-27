using Microsoft.AspNetCore.Mvc;
using OpenAI.Chat;

[Route("api/[controller]")]
[ApiController]
public class ChatController : ControllerBase
{
	private readonly ChatClient _chatClient;
	private readonly string _systemPrompt;

	public ChatController(IConfiguration config)
	{
		var apiKey = config["OpenAI:ApiKey"]!;
		var model = config["OpenAI:Model"] ?? "gpt-4o";
		_systemPrompt = config["OpenAI:SystemPrompt"] ?? "Tu es un assistant utile.";
		_chatClient = new ChatClient(model, apiKey);
	}

	[HttpPost]
	public async Task<IActionResult> SendMessage([FromBody] ChatRequest request)
	{
		var messages = new List<OpenAI.Chat.ChatMessage>
		{
			OpenAI.Chat.ChatMessage.CreateSystemMessage(_systemPrompt)
		};

		foreach (var msg in request.History)
		{
			messages.Add(msg.Role == "user"
				? OpenAI.Chat.ChatMessage.CreateUserMessage(msg.Content)
				: OpenAI.Chat.ChatMessage.CreateAssistantMessage(msg.Content));
		}

		messages.Add(OpenAI.Chat.ChatMessage.CreateUserMessage(request.Message));

		var completion = await _chatClient.CompleteChatAsync(messages);
		var reply = completion.Value.Content[0].Text;

		return Ok(new { message = reply });
	}
}