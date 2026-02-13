import React, { useState } from 'react';
import SignIn from '@/components/SignIn';
import SignUp from '@/components/SignUp';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon, ArrowLeft } from 'lucide-react';
import { Tooltip } from 'antd';

interface AuthProps {
  onBack?: () => void;
}

const Auth: React.FC<AuthProps> = ({ onBack }) => {
  const [isSignIn, setIsSignIn] = useState(true);
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen flex items-center justify-center bg-background relative px-4">
      {/* Top bar */}
      <div className="absolute top-4 left-4 right-4 flex justify-between">
        {onBack && (
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        )}
        <div className="ml-auto">
          <Tooltip title={theme === 'light' ? 'Dark mode' : 'Light mode'}>
            <button
              onClick={toggleTheme}
              className="w-10 h-10 rounded-lg flex items-center justify-center text-muted-foreground hover:bg-accent hover:text-foreground transition-all border border-border"
            >
              {theme === 'light' ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>
          </Tooltip>
        </div>
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
