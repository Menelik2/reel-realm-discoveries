import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ThemeProvider } from "next-themes"
import { initAdInjectionGuard } from './utils/adInjectionGuard'
import { registerServiceWorker } from './utils/registerSW'

// Host-page ad/popup hooks (fully active while Watch Now is open)
initAdInjectionGuard();

registerServiceWorker();

createRoot(document.getElementById("root")!).render(
  <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
    <App />
  </ThemeProvider>
);
