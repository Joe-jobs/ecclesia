import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';

console.log("Ecclesia: index.tsx loaded, beginning mount...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("Ecclesia: Root element missing from DOM");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("Ecclesia: React render initiated.");
} catch (err) {
  console.error("Ecclesia: Mounting error:", err);
}