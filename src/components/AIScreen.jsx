import { useState } from 'react';
import Groq from 'groq-sdk';
import './AIScreen.css';

const AIScreen = () => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(false);

    const systemPrompt = `You are a New York City travel assistant. Your goal is to find out the user's wishes for a trip to the city so you can fill out a plan form for them.

You must collect enough information to produce this JSON shape. These are example values only. Replace every value with user-provided information and include other stops as needed.
{
  "tripName": "Weekend Food Tour",
  "date": "2026-03-06",
  "entryTime": "09:00",
  "exitTime": "19:00",
  "startLocation": "Times Square, New York",
  "endLocation": "Central Park, New York",
  "stops": [
    {
      "location": "Katz's Delicatessen",
      "optional": false,
      "timePreference": "12:00"
    },
    {
      "location": "Brooklyn Bridge",
      "optional": true,
      "timePreference": null
    }
  ],
  "transitTypes": {
    "walking": true,
    "subway": true,
    "car": false
  }
}

Rules:
- Never print a trip plan or itinerary in normal chat.
- Keep the conversation natural and friendly while gathering the required fields.
- If the user is vague, missing details, or asks for a broad idea, ask follow-up questions instead of guessing.
- Do not reuse the example values unless the user explicitly chooses them.
- Make sure you identify all relevant fields: trip name, date, entry time, exit time, start location, end location, all stops the user wants, whether each stop is optional, each stop's time preference if any, and transit types.
- Transit types must be booleans inside "transitTypes" for walking, subway, and car.
- Only when you have enough information, say that you have all the info you need and then append a valid JSON block at the end of the message.
- The JSON block must be valid JSON, with double-quoted keys, no comments, and no trailing explanation after the block.
- If the user keeps talking after that, continue the conversation and send an updated valid JSON block each time the information changes.`;

    const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const handleSend = async () => {
        if (!input.trim() || loading) {
            return;
        }

        const userMessage = { role: "user", content: input.trim() };
        const nextMessages = [...messages, userMessage];
        setMessages(nextMessages);
        setInput("");
        setLoading(true);
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "system", content: systemPrompt }, ...nextMessages],
            });
            const assistantContent = completion?.choices?.[0]?.message?.content || "";
            setMessages((prev) => [...prev, { role: "assistant", content: assistantContent }]);
        } catch (error) {
            console.error("Error fetching Groq response:", error);
            const errorMessage = error?.message || "Request failed. Check your API key and quota.";
            setMessages((prev) => [...prev, { role: "assistant", content: errorMessage }]);
        }
        setLoading(false);
    };

    return (
        <div className="ai-container">
            <div className="chat-history" aria-live="polite">
                {messages.length === 0 ? (
                    <div className="chat-placeholder">Ask the AI something...</div>
                ) : (
                    messages.map((message, index) => (
                        <div
                            key={`${message.role}-${index}`}
                            className={`chat-message chat-message--${message.role}`}
                        >
                            {message.content}
                        </div>
                    ))
                )}
            </div>
            <div className="chat-input">
                <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                />
                <button onClick={handleSend} disabled={loading}>
                    {loading ? "Thinking..." : "Send"}
                </button>
            </div>
        </div>
    );
};

export default AIScreen;
