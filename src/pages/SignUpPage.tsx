import React from 'react';
import { useNavigate } from 'react-router-dom';
import SignUp from '@/components/SignUp';
import { useTheme } from '@/hooks/useTheme';
import { Sun, Moon } from 'lucide-react';
import { Tooltip } from 'antd';

const SignUpPage: React.FC = () => {
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="flex-1 flex items-center justify-center bg-background relative px-4 min-h-[calc(100vh-4rem)]">
      {/* Top bar */}
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
        <SignUp onSwitchToSignIn={() => navigate('/sign-in')} />
      </div>
    </div>
  );
};

export default SignUpPage;