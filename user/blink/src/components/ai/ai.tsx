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
      // Switched to gemini-2.5-flash-lite which is verified to have quota on this API key.
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });
      
      const result = await model.generateContent(
        'You are a trading strategy assistant. Respond ONLY with Python code, no markdown or explanations.\n\n' + prompt
      );
      
      const text = result.response.text();
      setResponse(text);
    } catch (err: any) {
      console.error("AI Generation Error:", err);
      
      const msg = err.message || '';
      if (msg.includes('404')) {
        setError('Model not found. Please verify that your API key has access to the requested model in the Google AI Studio.');
      } else if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API Quota exceeded. Please wait a few seconds before trying again.');
      } else {
        setError(msg || 'Something went wrong during generation.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="flex flex-col justify-center items-center bg-[#1e1e1e] border border-white/10 text-white h-full">
        
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
          <pre className=" border border-white/5 p-4 rounded-xl text-xs whitespace-pre-wrap overflow-x-auto max-h-96 overflow-y-auto">
            {response}
          </pre>
        </div>
      )}



      <div className='flex min-w-[50%] border border-white/2 rounded-full overflow-hidden'>
      <textarea
        className=" min-h-[60%] w-[80%] bg-white/5 border border-white/10 text-xl p-2 pt-8 placeholder:text-white/20 outline-none focus:border-[#FF6D1F] border-l-xl"
        placeholder="Describe the strategy you want... (e.g., create a 50-day SMA crossover strategy)"
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />
      <button
        onClick={handleGenerate}
        disabled={loading || !prompt.trim()}
        className="flex-1 bg-[#FF6D1F] hover:bg-[#e55d1a] text-white text-sm font-bold disabled:opacity-50 transition-colors"
      >
        {loading ? 'Generating...' : 'Generate Code'}
      </button>
        </div>
      
    </div>
  );
};

export default AIPrompt;
