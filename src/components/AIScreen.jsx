import { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import './AIScreen.css';

const AIScreen = () => {
    const [input, setInput] = useState("");
    const [response, setResponse] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [loading, setLoading] = useState(false);

    const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
    const modelName = import.meta.env.VITE_GEMINI_MODEL || "gemini-2.0-flash";

    const handleSend = async () => {
        if (!input.trim() || loading) {
            return;
        }

        if (!apiKey) {
            setErrorMessage("Missing VITE_GEMINI_API_KEY. Add it to .env and restart the dev server.");
            return;
        }

        setLoading(true);
        setErrorMessage("");
        try {
            const genAI = new GoogleGenerativeAI(apiKey);
            const model = genAI.getGenerativeModel({ model: modelName });
            const result = await model.generateContent(input);
            setResponse(result.response.text());
        } catch (error) {
            console.error("Error fetching Gemini response:", error);
            setResponse("");
            setErrorMessage(error?.message || "Request failed. Check your API key and quota.");
        }
        setLoading(false);
    };

    return (
        <div className="ai-container">
            <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Gemini something..."
            />
            <button onClick={handleSend} disabled={loading}>
                {loading ? "Thinking..." : "Send"}
            </button>
            <div className="response-area">{response}</div>
            {errorMessage ? (
                <div className="response-area">{errorMessage}</div>
            ) : null}
        </div>
    );
};

export default AIScreen;
