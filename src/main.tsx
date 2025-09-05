import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Fix for mobile viewport height issues in Chrome
const setVH = () => {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set the CSS custom property on load
setVH();

// Update on resize
window.addEventListener('resize', setVH);
window.addEventListener('orientationchange', setVH);

createRoot(document.getElementById("root")!).render(<App />);
