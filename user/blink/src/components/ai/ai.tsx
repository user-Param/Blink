// user/blink/src/components/editor/ai.tsx
import { useState } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

const AIPrompt = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
      const result = await model.generateContent(
        'You are a trading strategy assistant. Respond ONLY with Python code, no markdown or explanations.\n\n' + prompt
      );
      const text = result.response.text();
      setResponse(text);
    } catch (err: any) {
      setError(err.message || 'Something went wrong');
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-[#1e1e1e] border border-white/10 rounded-xl text-white">
      <h3 className="text-sm font-bold text-[#FF6D1F]">AI Code Generator</h3>
      <textarea
        className="w-full h-20 bg-white/5 border border-white/10 rounded-lg p-3 text-sm placeholder:text-white/20 focus:outline-none focus:border-[#FF6D1F] resize-none"
        placeholder="Describe the strategy you want... (e.g., create a 50-day SMA crossover strategy)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="self-end bg-[#FF6D1F] hover:bg-[#e55d1a] text-white px-5 py-2 rounded-lg text-sm font-bold disabled:opacity-50 transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>

      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
          {error}
        </div>
      )}

      {response && (
        <div className="mt-2 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs text-white/40">AI Response:</span>
            <button
              onClick={() => navigator.clipboard.writeText(response)}
              className="text-xs text-[#FF6D1F] hover:underline"
            >
              Copy
            </button>
          </div>
          <pre className="bg-black/30 border border-white/5 p-4 rounded-lg text-xs text-green-400 whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
            {response}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AIPrompt;