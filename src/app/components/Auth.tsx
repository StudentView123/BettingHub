import { useState } from 'react';
import { Login } from './Login';
import { Signup } from './Signup';

interface AuthProps {
  initialMode?: 'login' | 'signup';
  onSuccess?: () => void;
}

export function Auth({ initialMode = 'login', onSuccess }: AuthProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  const toggleMode = () => {
    setMode(mode === 'login' ? 'signup' : 'login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="w-full max-w-md">
        {mode === 'login' ? (
          <Login onToggleMode={toggleMode} onSuccess={onSuccess} />
        ) : (
          <Signup onToggleMode={toggleMode} onSuccess={onSuccess} />
        )}
      </div>
    </div>
  );
}
