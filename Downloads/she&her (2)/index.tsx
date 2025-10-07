
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import ErrorBoundary from './components/ErrorBoundary';
import { ConvexProvider, ConvexReactClient } from "convex/react";
import './index.css'; // Main CSS file for Tailwind

// Fix: Use VITE_CONVEX_DEPLOYMENT and cast import.meta to any to resolve TypeScript error.
const convex = new ConvexReactClient((import.meta as any).env.VITE_CONVEX_DEPLOYMENT);

if (!convex) {
  // Fix: Update error message to reflect the correct environment variable name.
  throw new Error("Missing VITE_CONVEX_DEPLOYMENT URL");
}


const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <ConvexProvider client={convex}>
        <App />
      </ConvexProvider>
    </ErrorBoundary>
  </React.StrictMode>
);
