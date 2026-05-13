import { BrowserRouter } from "react-router-dom";
import { Analytics } from '@vercel/analytics/react';
import Blink from '../src/pages/blink'
import './App.css'

function App() {
  return (
    <BrowserRouter>
      <Blink />
      <Analytics />
    </BrowserRouter>
    )
};

export default App
