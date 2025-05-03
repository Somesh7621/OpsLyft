
import { useState } from 'react';
import { SignUp as ClerkSignUp } from '@clerk/clerk-react';
import { Navigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';

const SignUp = () => {
  const { isSignedIn } = useUser();
  const [signUpComplete, setSignUpComplete] = useState(false);

  if (isSignedIn || signUpComplete) {
    return <Navigate to="/" replace />;
  }

  const afterSignUpUrl = import.meta.env.VITE_CLERK_AFTER_SIGN_UP_URL || '/';

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Join TaskOrbit</h1>
          <p className="text-muted-foreground mt-2">Create an account to get started</p>
        </div>
        <div className="bg-card shadow-lg rounded-lg overflow-hidden">
          <ClerkSignUp 
            signInUrl="/sign-in"
            afterSignUpUrl={afterSignUpUrl}
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none",
              }
            }}
            redirectUrl={afterSignUpUrl}
          />
        </div>
      </div>
    </div>
  );
};

export default SignUp;
