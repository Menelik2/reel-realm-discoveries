
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "next-themes"
import { initSiteProtection } from './utils/siteProtection'
import { registerServiceWorker } from './utils/registerSW'

// Initialize site protection (only in production)
if (import.meta.env.PROD) {
  initSiteProtection();
}

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <App />
  </ThemeProvider>
);
