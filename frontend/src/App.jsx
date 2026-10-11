import React, { useState, useRef, useEffect } from 'react';

function App() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Greetings! I'm **DevSentry AI**, your dedicated serverless companion for code security audits and cloud architecture refined with friendly technical humor. \n\nPaste an **IAM Policy**, a **CloudFormation/Terraform** snippet, or ask about best practices. Let's build a secure, well-architected cloud, together."
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [analysisTimer, setAnalysisTimer] = useState(0); 
  const [currentSession, setCurrentSession] = useState("Initializing...");
  const messagesEndRef = useRef(null);

  const ALLOWED_ORIGIN = "http://localhost:5173"; 
  const API_ENDPOINT = "https://wexrfj2y0f.execute-api.ap-southeast-2.amazonaws.com/prod/agent";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  useEffect(() => {
    let timerInterval;
    if (loading) {
      setAnalysisTimer(0);
      timerInterval = setInterval(() => {
        setAnalysisTimer((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(timerInterval);
    }
    return () => clearInterval(timerInterval);
  }, [loading]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages((prev) => [...prev, { role: 'user', content: userMessage }]);
    setLoading(true);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Origin': ALLOWED_ORIGIN 
        },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      const assistantReply = data.response || "⚠️ Response parsed, but structure remains safe.";
      
      if (data.sessionId) setCurrentSession(data.sessionId);

      setMessages((prev) => [...prev, { role: 'assistant', content: assistantReply }]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: `🚨 Network connectivity error. Ensure CORS headers are returning on the API Gateway resource.` }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickPrompt = (text) => {
    setInput(text);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-white">
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-10 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white flex items-center gap-2">
              DevSentry AI 
              <span className="text-xs px-2 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">AWS Bedrock Powered</span>
            </h1>
            <p className="text-xs text-slate-400">Intelligent Serverless Code Review & Architecture Agent</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center gap-4">
          <div className="text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800 flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Agent Operational
          </div>
          <div className="text-xs text-white bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-700 flex items-center gap-2">
            Created by: Shubhadip Chakrabarti
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-between">
        <div className="bg-slate-900/40 border border-slate-800/70 p-3 mb-6 rounded-xl text-xs flex items-center justify-between text-slate-500">
            <div>
                <strong>Active DynamoDB SessionID:</strong> <span className="font-mono text-cyan-400">{currentSession}</span>
            </div>
            {loading && (
                 <div className="text-cyan-400 font-medium">
                   Processing Time: {analysisTimer}s (Invoking Amazon Bedrock)
                 </div>
            )}
        </div>

        <div className="space-y-6 mb-6 overflow-y-auto pr-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`flex items-start gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 font-bold text-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                    : 'bg-slate-800 text-cyan-400 border border-slate-700'
                }`}
              >
                {msg.role === 'user' ? 'U' : 'AI'}
              </div>
              <div
                className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                  msg.role === 'user'
                    ? 'bg-cyan-600 text-white rounded-tr-none'
                    : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                }`}
              >
                <div className={`${msg.content.includes("```") || msg.content.includes("{") ? 'font-mono bg-black/30 p-2 rounded-lg' : 'whitespace-pre-wrap'}`}>
                    {msg.content}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-start gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-800 text-cyan-400 border border-slate-700 flex items-center justify-center shrink-0">
                AI
              </div>
              <div className="bg-slate-900 border border-slate-800 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2 text-slate-400 text-sm">
                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce"></span>
                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                <span className="h-2 w-2 bg-cyan-500 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                <span className="ml-2">Invoking Amazon Bedrock Model (Analysis: {analysisTimer}s)...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="mb-4 flex flex-wrap gap-2">
          <button
            onClick={() => handleQuickPrompt("Review this IAM policy: {\"Effect\": \"Allow\", \"Action\": \"*\", \"Resource\": \"*\"}")}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition"
          >
            Audit Insecure IAM Policy
          </button>
          <button
            onClick={() => handleQuickPrompt("How do I optimize AWS Lambda?")}
            className="text-xs bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 px-3 py-1.5 rounded-lg transition"
          >
            Optimize Lambda (Python)
          </button>
        </div>

        <form onSubmit={handleSubmit} className="relative bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-xl">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit(e);
              }
            }}
            placeholder="Ask about cloud architecture, paste code snippets, or check security policies..."
            rows="2"
            className="w-full bg-transparent px-3 py-2 text-sm text-slate-100 placeholder-slate-500 focus:outline-none resize-none"
          />
          <div className="flex items-center justify-between px-3 pb-1 pt-2 border-t border-slate-800/60">
            <span className="text-[11px] text-slate-500">Press Enter to send, Shift + Enter for new line</span>
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs font-semibold transition shadow-md shadow-cyan-600/20 flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed"
            >
              <span>{loading ? `Analyzing... (${analysisTimer}s)` : 'Send Query'}</span>
              {loading ? <span className="h-3 w-3 rounded-full border-2 border-white border-t-transparent animate-spin"></span> : '🚀'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}

export default App;