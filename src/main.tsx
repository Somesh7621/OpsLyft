import { createRoot } from 'react-dom/client';
import { ClerkProvider } from '@clerk/clerk-react';
import { Provider } from 'react-redux';
import App from './App.tsx';
import './index.css';
import { store } from './store';

// Public key from Clerk
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) {
  throw new Error("Missing Clerk Publishable Key");
}

// Optional URL configurations
const signInUrl = import.meta.env.VITE_CLERK_SIGN_IN_URL || '/sign-in';
const signUpUrl = import.meta.env.VITE_CLERK_SIGN_UP_URL || '/sign-up';


createRoot(document.getElementById("root")!).render(
  <ClerkProvider 
    publishableKey={PUBLISHABLE_KEY}
    signInUrl={signInUrl}
    signUpUrl={signUpUrl}
  >
    <Provider store={store}>
      <App />
    </Provider>
  </ClerkProvider>
);
