import { useEffect, useState, useRef } from "react";
import apiHelper from "../../utils/ApiHelper";
import { marked } from "marked";

const presetQuestions = [
    "Which items cost me the most overall?",
    "Where am I spending the most in shipping or admin fees?",
    "Is my profit margin improving or declining over time?",
    "What months have the highest net gain?",
];

function AskAiDialog() {
    const [open, setOpen] = useState(false);
    const [question, setQuestion] = useState("");
    const [customInput, setCustomInput] = useState("");
    const [fullAnswer, setFullAnswer] = useState("");
    const [displayAnswer, setDisplayAnswer] = useState("");
    const [loading, setLoading] = useState(false);
    const inputRef = useRef(null);

    const resetState = () => {
        setOpen(false);
        setQuestion("");
        setCustomInput("");
        setFullAnswer("");
        setDisplayAnswer("");
    };

    const handleAsk = async () => {
        const prompt = question || customInput;
        if (!prompt) return;

        setLoading(true);
        setFullAnswer("");
        setDisplayAnswer("");

        try {
            const res = await apiHelper.postAuthorization("/dashboard/ask-ai", { prompt });
            const answerText = res.answer || "No answer returned.";
            setFullAnswer(answerText);
        } catch (err) {
            console.error(err);
            setFullAnswer("⚠️ Failed to connect to AI service.");
        } finally {
            setLoading(false);
        }
    };

    // Typing animation effect
    useEffect(() => {
        if (!fullAnswer) return;
        let i = 0;
        const interval = setInterval(() => {
            setDisplayAnswer((prev) => prev + fullAnswer.charAt(i));
            i++;
            if (i >= fullAnswer.length) clearInterval(interval);
        }, 10);
        return () => clearInterval(interval);
    }, [fullAnswer]);

    // Focus input on open
    useEffect(() => {
        if (open && inputRef.current) {
            inputRef.current.focus();
        }
    }, [open]);

    // ESC to close
    useEffect(() => {
        const handleKey = (e) => {
            if (e.key === "Escape") resetState();
        };
        if (open) document.addEventListener("keydown", handleKey);
        return () => document.removeEventListener("keydown", handleKey);
    }, [open]);

    return (
        <>
            <button
                onClick={() => setOpen(true)}
                className="fixed bottom-6 right-6 bg-indigo-600 text-white px-4 py-2 rounded-full shadow-lg hover:bg-indigo-700 transition"
            >
                Ask AI <small>(experimental)</small>
            </button>

            {open && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    {/* Backdrop */}
                    <div className="fixed inset-0 bg-black/50 z-40" onClick={resetState} />

                    {/* Dialog */}
                    <div
                        className="relative z-60 bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg shadow-xl animate-fade-in"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-white">
                            Ask AI Anything
                        </h2>

                        <div className="space-y-2 mb-4">
                            {presetQuestions.map((q) => (
                                <button
                                    key={q}
                                    onClick={() => {
                                        setQuestion(q);
                                        setCustomInput("");
                                    }}
                                    className={`block w-full text-left px-3 py-2 border rounded ${
                                        question === q
                                            ? "bg-blue-100 dark:bg-blue-900 border-blue-500"
                                            : "border-gray-300 dark:border-gray-600"
                                    }`}
                                >
                                    {q}
                                </button>
                            ))}
                            <input
                                ref={inputRef}
                                type="text"
                                placeholder="Or type your own question..."
                                value={customInput}
                                onChange={(e) => {
                                    setCustomInput(e.target.value);
                                    setQuestion("");
                                }}
                                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                        </div>

                        <div className="flex justify-between">
                            <button
                                onClick={handleAsk}
                                disabled={loading || (!question && !customInput)}
                                className="bg-indigo-600 text-white px-4 py-2 rounded hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Ask
                            </button>
                            <button
                                onClick={resetState}
                                className="text-gray-600 dark:text-gray-300 hover:underline"
                            >
                                Cancel
                            </button>
                        </div>

                        {loading && (
                            <div className="mt-4 text-blue-500 animate-pulse flex items-center gap-2">
                                <span className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                                Thinking...
                            </div>
                        )}

                        {displayAnswer && (
                            <div
                                className="mt-4 p-3 border rounded bg-gray-50 dark:bg-gray-700 text-sm dark:text-white animate-fade-in prose dark:prose-invert max-w-none overflow-auto max-h-[40vh]"
                                dangerouslySetInnerHTML={{ __html: marked.parse(displayAnswer) }}
                            />
                        )}
                    </div>
                </div>
            )}
        </>
    );
}

export default AskAiDialog;
