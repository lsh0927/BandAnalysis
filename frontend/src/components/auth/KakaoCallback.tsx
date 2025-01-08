import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const KakaoCallback = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const processKakaoLogin = async () => {
      const params = new URLSearchParams(window.location.search);
      const code = params.get('code');

      if (code) {
        try {
          const response = await fetch('http://localhost:8080/api/auth/kakao', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ code }),
          });

          if (response.ok) {
            const data = await response.json();
            localStorage.setItem('token', data.token);
            navigate('/dashboard');
          } else {
            console.error('Login failed');
            navigate('/login');
          }
        } catch (error) {
          console.error('Login error:', error);
          navigate('/login');
        }
      }
    };

    processKakaoLogin();
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="p-8 text-center">
        <div className="w-16 h-16 border-4 border-t-blue-500 border-gray-200 rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600">카카오 로그인 처리 중...</p>
      </div>
    </div>
  );
};

export default KakaoCallback;