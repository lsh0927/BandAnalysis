import { useState, useEffect, createContext } from 'react';

// Auth Context Type
type AuthContextType = {
  isAuthenticated: boolean;
  token: string | null;
  login: (token: string) => void;
  logout: () => void;
}

// Create Auth Context
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  token: null,
  login: (_: string) => {},
  logout: () => {}
});

// Login Component
const Login = ({ onLoginSuccess }: { onLoginSuccess: (token: string) => void }) => {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://developers.kakao.com/sdk/js/kakao.js';
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  const handleLogin = () => {
    if (window.Kakao) {
      const KAKAO_CLIENT_ID = 'YOUR_KAKAO_CLIENT_ID';
      const REDIRECT_URI = `${window.location.origin}/oauth/callback/kakao`;

      window.Kakao.init(KAKAO_CLIENT_ID);
      window.Kakao.Auth.authorize({
        redirectUri: REDIRECT_URI,
        scope: 'profile_nickname, profile_image, account_email'
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="p-8 bg-white rounded-lg shadow-md">
        <h1 className="mb-6 text-2xl font-bold text-center text-gray-800">Band Analysis Login</h1>
        <button
          onClick={handleLogin}
          className="flex items-center justify-center w-full px-4 py-2 text-white bg-yellow-400 rounded-md hover:bg-yellow-500 focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-offset-2"
        >
          <img
            src="/api/placeholder/24/24"
            alt="Kakao Logo"
            className="w-6 h-6 mr-2"
          />
          카카오 로그인
        </button>
      </div>
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
      <p>Welcome to Band Analysis!</p>
    </div>
  );
};

// Main App Component
const App = () => {
  const [currentPage, setCurrentPage] = useState<'login' | 'dashboard'>('login');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('token');
    if (savedToken) {
      setToken(savedToken);
      setIsAuthenticated(true);
      setCurrentPage('dashboard');
    }

    // Handle OAuth callback
    const params = new URLSearchParams(window.location.search);
    const code = params.get('code');
    
    if (code) {
      fetch('http://localhost:8080/api/auth/kakao', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code })
      })
      .then(response => response.json())
      .then(data => {
        if (data.token) {
          handleLoginSuccess(data.token);
        }
      })
      .catch(error => {
        console.error('Login error:', error);
        setCurrentPage('login');
      });
    }
  }, []);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem('token', newToken);
    setToken(newToken);
    setIsAuthenticated(true);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setToken(null);
    setIsAuthenticated(false);
    setCurrentPage('login');
  };

  return (
    <AuthContext.Provider 
      value={{
        isAuthenticated,
        token,
        login: handleLoginSuccess,
        logout: handleLogout
      }}
    >
      <div className="min-h-screen bg-gray-50">
        {currentPage === 'login' && !isAuthenticated && (
          <Login onLoginSuccess={handleLoginSuccess} />
        )}
        {currentPage === 'dashboard' && isAuthenticated && (
          <Dashboard />
        )}
      </div>
    </AuthContext.Provider>
  );
};

export default App;