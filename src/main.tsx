import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import ErrorBoundary from './components/ErrorBoundary'

console.log('🚀 Cabinet BOM App starting...');
console.log('Environment:', import.meta.env.MODE);
console.log('Base URL:', import.meta.env.BASE_URL);

const rootElement = document.getElementById('root');

if (!rootElement) {
  console.error('❌ Root element not found!');
  document.body.innerHTML = `
    <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui;">
      <div style="text-align: center; padding: 2rem;">
        <h1 style="color: #dc2626; margin-bottom: 1rem;">App Error</h1>
        <p>Could not find root element. Please refresh the page.</p>
      </div>
    </div>
  `;
} else {
  console.log('✅ Root element found, rendering app...');

  try {
    createRoot(rootElement).render(
      <StrictMode>
        <ErrorBoundary>
          <App />
        </ErrorBoundary>
      </StrictMode>,
    );
    console.log('✅ App rendered successfully!');
  } catch (error) {
    console.error('❌ Failed to render app:', error);
    document.body.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; min-height: 100vh; font-family: system-ui; background: linear-gradient(to bottom right, #eff6ff, #dbeafe);">
        <div style="background: white; padding: 2rem; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); max-width: 600px;">
          <h1 style="color: #dc2626; margin-bottom: 1rem; font-size: 1.5rem;">App Failed to Start</h1>
          <p style="margin-bottom: 1rem; color: #374151;">There was an error starting the application. Please check the browser console for details.</p>
          <details style="background: #f3f4f6; padding: 1rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem;">
            <summary style="cursor: pointer; font-weight: 600; margin-bottom: 0.5rem;">Error Details</summary>
            <pre style="margin: 0; white-space: pre-wrap; word-wrap: break-word;">${error instanceof Error ? error.message : String(error)}</pre>
          </details>
        </div>
      </div>
    `;
  }
}
