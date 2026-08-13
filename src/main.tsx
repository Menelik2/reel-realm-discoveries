
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "next-themes"
import { initSiteProtection } from './utils/siteProtection'
import { initAdInjectionGuard } from './utils/adInjectionGuard'
import { registerServiceWorker } from './utils/registerSW'

// Initialize site protection (only in production)
if (import.meta.env.PROD) {
  initSiteProtection();
}

// Always install ad-injection hooks (activated fully when player opens)
initAdInjectionGuard();

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <App />
  </ThemeProvider>
);
