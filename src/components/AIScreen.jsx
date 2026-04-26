import Groq from 'groq-sdk';
import './AIScreen.css';
import { createTripDraftFromAiPayload, writeTripDraft } from '../utils/tripDraftStorage';

function extractJsonBlock(content) {
    if (typeof content !== 'string') {
        return null;
    }

    const firstBraceIndex = content.indexOf('{');
    if (firstBraceIndex === -1) {
        return null;
    }

    let depth = 0;
    let inString = false;
    let isEscaped = false;

    for (let index = firstBraceIndex; index < content.length; index += 1) {
        const character = content[index];

        if (inString) {
            if (isEscaped) {
                isEscaped = false;
            } else if (character === '\\') {
                isEscaped = true;
            } else if (character === '"') {
                inString = false;
            }
            continue;
        }

        if (character === '"') {
            inString = true;
            continue;
        }

        if (character === '{') {
            depth += 1;
        } else if (character === '}') {
            depth -= 1;
            if (depth === 0) {
                return content.slice(firstBraceIndex, index + 1);
            }
        }
    }

    return null;
}

const AIScreen = ({
    setCurrentScreen,
    input,
    setInput,
    messages,
    setMessages,
    loading,
    setLoading,
    fillError,
    setFillError,
}) => {
    const systemPrompt = `You are a New York City travel assistant. Your goal is to find out the user's wishes for a trip to the city so you can fill out a plan form for them.

You must collect enough information to produce this JSON shape. These are example values only. Replace every value with user-provided information and include other stops as needed.
{
  "tripName": "Weekend Food Tour",
  "date": "2026-03-06",
  "entryTime": "09:00",
  "exitTime": "19:00",
  "startLocation": "Times Square",
  "startAddress": "Broadway and 7th Ave, New York, NY 10036",
  "endLocation": "Central Park",
  "endAddress": "New York, NY 10024",
  "stops": [
    {
      "location": "Katz's Delicatessen",
      "address": "205 E Houston St, New York, NY 10002",
      "optional": false,
      "timePreference": "12:00"
    },
    {
      "location": "Brooklyn Bridge",
      "address": "Brooklyn Bridge, New York, NY 10038",
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
- Make sure you identify all relevant fields: trip name, date, entry time, exit time, start location, start address, end location, end address, all stops the user wants, each stop address, whether each stop is optional, each stop's time preference if any, and transit types.
- Transit types must be booleans inside "transitTypes" for walking, subway, and car.
- Every stop in "stops" must include both "location" and "address".
- "startLocation" and "endLocation" should be the place names only. "startAddress" and "endAddress" should be the full addresses.
- Only when you have enough information, say that you have all the info you need and then append a valid JSON block at the end of the message.
- The JSON block must be valid JSON, with double-quoted keys, no comments, and no trailing explanation after the block.
- If the user keeps talking after that, continue the conversation and send an updated valid JSON block each time the information changes.`;

    const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const latestAssistantMessage = [...messages].reverse().find((message) => message.role === 'assistant');
    const latestJsonBlock = extractJsonBlock(latestAssistantMessage?.content ?? '');
    let parsedTripPayload = null;

    if (latestJsonBlock) {
        try {
            parsedTripPayload = JSON.parse(latestJsonBlock);
        } catch {
            parsedTripPayload = null;
        }
    }

    const isReadyToFill = Boolean(parsedTripPayload);

    const handleSend = async () => {
        if (!input.trim() || loading) {
            return;
        }

        const userMessage = { role: "user", content: input.trim() };
        const nextMessages = [...messages, userMessage];
        setFillError('');
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

    const handleFillForm = () => {
        if (!parsedTripPayload) {
            setFillError('The latest AI response does not contain a valid trip JSON block yet.');
            return;
        }

        writeTripDraft(createTripDraftFromAiPayload(parsedTripPayload));
        setFillError('');
        setCurrentScreen?.('MapState');
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
            <div className="chat-actions">
                <button
                    type="button"
                    className="chat-fill-button"
                    onClick={handleFillForm}
                    disabled={!isReadyToFill || loading}
                >
                    Fill Form and Open Trip
                </button>
                {fillError ? <div className="chat-error">{fillError}</div> : null}
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
