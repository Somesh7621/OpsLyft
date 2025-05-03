
import { useState } from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const SignIn = () => {
  const { isSignedIn } = useUser();
  const [signInComplete] = useState(false);

  if (isSignedIn || signInComplete) {
    return <Navigate to="/" replace />;
  }

  const afterSignInUrl = import.meta.env.VITE_CLERK_AFTER_SIGN_IN_URL || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Welcome to Jira</h1>
          <p className="text-muted-foreground mt-2">Sign in to continue to your projects</p>
        </div>
        <div className="bg-card shadow-lg rounded-lg overflow-hidden">
          <ClerkSignIn 
            signUpUrl="/sign-up"
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default SignIn;
