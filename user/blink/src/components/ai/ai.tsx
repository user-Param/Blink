import { useState, useEffect, useRef } from 'react';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ArrowUp, Loader2 } from 'lucide-react';
import { SYSTEM_PROMPT } from '../ai/systemPrompt';
import { motion, AnimatePresence } from 'framer-motion';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY as string);

// Every mode’s specific instructions that will be combined with the main system prompt
export const MODE_CONTEXTS: Record<string, string> = {
  plan: `
### Plan mode
Help User to Design a high‑level technical architecture for the strategy described.
Do **not** write full implementation code. Instead, produce:
- A numbered list of components (data ingestion, feature engineering, order management, etc.)
- A data flow diagram in text form
- Recommended Blink API endpoints and their usage
- Pseudocode for the most critical parts
- Expected edge cases and how to handle them
`,

  'data-analysis': `
### Data Analysis mode
Help User to Create a complete data analysis pipeline that uses Blink's \`get_history()\` to fetch the data.
- Load data with \`blink.get_history()\`
- Use pandas for data cleaning, missing value imputation, and feature engineering
- Compute technical indicators (SMA, RSI, MACD) using Blink's built‑in functions
- Create at least three matplotlib/seaborn visualizations showing price, volume, and indicators
- Output a clear textual summary of findings (mean return, volatility, correlations)
- Export the prepared dataset (print the head of the DataFrame)
`,

  'financial-models': `
### Financial Models mode
Help User to Implement a quantitative finance model that uses Blink data.
- Choose from: Black‑Scholes, Monte Carlo option pricing, Value‑at‑Risk (VaR), or risk parity allocation
- Use numpy for calculations and explain mathematical steps in comments
- Fetch underlying data with \`blink.get_history()\`
- Output the model’s result (price, risk metric, allocation) via \`print()\`
- Do **not** use external financial libraries unless absolutely necessary; implement formulas yourself
`,

  'research-thesis': `
### Research Thesis mode
Help User to Write a formal research abstract / methodology chapter, not code.
- Provide a clear thesis statement / hypothesis
- Outline the methodology (data collection, backtesting framework, performance metrics)
- Discuss expected outcomes and limitations
- Suggest future work
- Format the text as a plain‑text academic paper with sections: Abstract, Introduction, Methodology, Expected Results, Conclusion
`,

  'machine-learning': `
### Machine Learning Mode
Help User to Create a machine learning model for trading using scikit‑learn (or PyTorch if you prefer).
- Fetch data with \`blink.get_history()\` and engineer features (returns, indicators)
- Split data into train/test sets, respecting time order
- Train a classification model (predict next‑day direction) or regression model (predict return)
- Evaluate with accuracy, precision, recall, confusion matrix (or MSE, R²)
- Include a brief comment explaining why you chose the model and hyperparameters
- Show example predictions
`,

  'python-strategy': `
### Python Strategy mode
Help User to Write a complete, runnable Python trading strategy for the Blink platform.
- Define entry and exit conditions using Blink API data
- Implement risk management (stop‑loss, take‑profit, position sizing)
- Comment each step and explain the reasoning behind signals
- Use \`blink.place_order()\`, \`blink.close_position()\` appropriately
- Print status messages for every action
- Ensure the code is ready to be deployed on Blink without modifications
`,

  'cpp-strategy': `
### C++ Strategy mode
Help User to Write a C++ trading algorithm that mirrors the Blink API structure but is highly optimized.
- Use similar function signatures: \`place_order(symbol, quantity, order_type, side)\`, \`get_history()\`, etc.
- Focus on memory management, speed, and minimizing latency
- Use standard C++17, no external libraries beyond STL
- Add comments explaining each block
- Ensure the code compiles and runs in a mock Blink environment (provide necessary header and class definitions)
`
};

const AIPrompt = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [displayedResponse, setDisplayedResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedMode, setSelectedMode] = useState('python-strategy'); // default mode
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Auto‑expand textarea
  const adjustHeight = () => {
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
      inputRef.current.style.height = inputRef.current.scrollHeight + 'px';
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [prompt]);

  // Typewriter effect when a new response arrives
  useEffect(() => {
    if (!response) return;
    let i = 0;
    setDisplayedResponse('');
    const interval = setInterval(() => {
      setDisplayedResponse((prev) => prev + response.charAt(i));
      i++;
      if (i >= response.length) clearInterval(interval);
    }, 8);
    return () => clearInterval(interval);
  }, [response]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError('');
    setResponse('');
    setDisplayedResponse('');

  const modeInstructions = MODE_CONTEXTS[selectedMode] || '';
  const fullPrompt = SYSTEM_PROMPT.replace('{{MODE_CONTEXT}}', modeInstructions) + prompt;

    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(fullPrompt);
      const text = result.response.text();
      setResponse(text);
    } catch (err: any) {
      console.error('AI Generation Error:', err);
      const msg = err.message || '';
      if (msg.includes('404')) {
        setError('Model not found. Check your API key access in Google AI Studio.');
      } else if (msg.includes('429') || msg.toLowerCase().includes('quota')) {
        setError('API Quota exceeded. Please wait a few seconds.');
      } else {
        setError(msg || 'Something went wrong.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="h-screen bg-[#1e1e1e] text-white flex flex-col">
      {/* Main scrollable area */}
      <div className="flex-1 overflow-y-auto px-4">
        {/* Welcome message / Response area */}
        {!response && !loading && !error && (
          <div className="h-full flex items-center justify-center">
            <h1 className="text-4xl font-semibold text-white/90">
              Design Strategy With AI
            </h1>
          </div>
        )}

        {/* Display response with typewriter effect */}
        {displayedResponse && (
          <div className="max-w-4xl mx-auto w-full space-y-6 py-8">
            <div className="flex items-center justify-between">
              <span className="text-sm text-white/40">Blink AI</span>
              <button
                onClick={() => navigator.clipboard.writeText(response)}
                className="text-sm text-[#FF6D1F] hover:underline"
              >
                Copy
              </button>
            </div>
            <div className="text-sm leading-7 text-white/90 whitespace-pre-wrap">
              {displayedResponse}
            </div>
          </div>
        )}
      </div>

      {/* Fixed bottom section */}
      <div className="sticky bottom-0 bg-[#1e1e1e] pt-2">
        {/* Mode chips */}
        <div className="max-w-4xl mx-auto px-2 flex flex-wrap gap-2 mb-2">
          {Object.entries(MODE_CONTEXTS).map(([key, _]) => (
            <button
              key={key}
              onClick={() => {
                setSelectedMode(key);
                // Optionally clear previous response when mode changes
                // setResponse('');
                // setDisplayedResponse('');
              }}
              className={`px-3 py-1 rounded-full text-xs border border-white/10 transition-colors ${
                selectedMode === key
                  ? 'bg-[#FF6D1F] text-white border-transparent'
                  : 'bg-white/5 text-white/60 hover:bg-white/10'
              }`}
            >
              {key
                .split('-')
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </button>
          ))}
        </div>

        {/* Error display */}
        {error && (
          <div className="max-w-4xl mx-auto px-2 mb-2">
            <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs">
              {error}
            </div>
          </div>
        )}

        {/* Input area */}
        <div className=" mb-6 max-w-4xl mx-auto flex items-end gap-2 bg-white/5 border border-white/10 rounded-3xl px-3 py-2 mb-4">
          <textarea
            ref={inputRef}
            className="flex-1 bg-transparent text-sm outline-none resize-none max-h-40 overflow-y-auto"
            placeholder="Describe the strategy you want..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            rows={1}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleGenerate();
              }
            }}
          />
          <button
            onClick={handleGenerate}
            disabled={loading || !prompt.trim()}
            className="bg-white text-black w-6 h-6 rounded-full flex items-center justify-center hover:scale-105 transition disabled:opacity-50"
          >
            {loading ? <Loader2 size={18} className="animate-spin" /> : <ArrowUp size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AIPrompt;