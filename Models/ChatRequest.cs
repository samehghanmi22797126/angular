public class ChatRequest
{
	public string Message { get; set; } = string.Empty;
	public List<ChatMessageItem> History { get; set; } = new();
}

public class ChatMessageItem
{
	public string Role { get; set; } = string.Empty;
	public string Content { get; set; } = string.Empty;
}