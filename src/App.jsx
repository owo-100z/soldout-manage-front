import { useEffect } from "react";
import { BrowserRouter as Router } from 'react-router-dom';
import AppRouter from "@/components/routers/Router";

export default function App() {
  return (
    <Router>
      <div id="loading-overlay" className="fixed bg-black/50 z-9999 flex items-center justify-center inset-0 hidden">
        <span className="loading loading-spinner loading-lg text-white"></span>
      </div>
      <AppRouter/>
    </Router>
  );
}