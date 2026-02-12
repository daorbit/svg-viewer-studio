import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';

const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="w-full max-w-md">
        {isSignIn ? (
          <SignIn onSwitchToSignUp={() => setIsSignIn(false)} />
        ) : (
          <SignUp onSwitchToSignIn={() => setIsSignIn(true)} />
        )}
      </div>
    </div>
  );
};

export default Auth;