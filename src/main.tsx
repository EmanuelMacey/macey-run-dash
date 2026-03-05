import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./App.css";
import "./index.css";
import "./lib/i18n";

// SPA redirect handler: converts /?/path back to /path for 404.html fallback
(function () {
  const l = window.location;
  if (l.search[1] === '/') {
    const decoded = l.search.slice(1).split('&').map(s => s.replace(/~and~/g, '&')).join('?');
    window.history.replaceState(null, '', l.pathname.slice(0, -1) + decoded + l.hash);
  }
})();

createRoot(document.getElementById("root")!).render(<App />);
