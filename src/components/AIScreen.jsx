import { useState } from 'react';
import Groq from 'groq-sdk';
import './AIScreen.css';

const AIScreen = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [loading, setLoading] = useState(false);

    const groq = new Groq({
        apiKey: import.meta.env.VITE_GROQ_API_KEY,
        dangerouslyAllowBrowser: true,
    });

    const handleSend = async () => {
        if (!input.trim() || loading) {
            return;
        }

        setLoading(true);
        setResponse("");
        try {
            const completion = await groq.chat.completions.create({
                model: "llama-3.3-70b-versatile",
                messages: [{ role: "user", content: input }],
            });
            setResponse(completion?.choices?.[0]?.message?.content || "");
        } catch (error) {
            console.error("Error fetching Groq response:", error);
            setResponse(error?.message || "Request failed. Check your API key and quota.");
        }
        setLoading(false);
    };

    return (
        <div className="ai-container">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask the AI something..."
            />
            <button onClick={handleSend} disabled={loading}>
                {loading ? "Thinking..." : "Send"}
            </button>
            <div className="response-area">{response}</div>
        </div>
    );
};

export default AIScreen;
