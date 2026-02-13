import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Tooltip } from 'antd';

const Auth: React.FC = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4">
      {/* Theme toggle */}
      <div className="absolute top-4 right-4">
        <Tooltip title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
          <button
            onClick={toggleTheme}
            className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all border border-border"
          >
            {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
          </button>
        </Tooltip>
      </div>

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
