import { auth, googleProvider } from '../firebase';
import { signInWithPopup, signInWithEmailAndPassword } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import Swal from 'sweetalert2';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const idToken = await result.user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, mode: 'login' }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.error && errorData.error.includes('belum terdaftar')) {
          alert('Akun Google Anda belum terdaftar. Silakan register terlebih dahulu.');
          navigate('/register');
          return;
        } else {
          throw new Error(errorData.error || 'Login gagal');
        }
      }

      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        const user = result.user;
        
        // Get photo URL from multiple possible sources
        let photoURL = null;
        if (user.photoURL) {
          photoURL = user.photoURL;
        } else if (user.providerData && user.providerData.length > 0) {
          // Try to get photo URL from provider data
          const provider = user.providerData[0];
          if (provider.photoURL) {
            photoURL = provider.photoURL;
          }
        }

        // Log untuk debugging
        console.log('User data from Firebase:', {
          displayName: user.displayName,
          email: user.email,
          photoURL: photoURL,
          providerData: user.providerData,
          rawUser: user
        });

        const userData = {
          name: user.displayName,
          email: user.email,
          photoURL: photoURL
        };

        console.log('Saving user data to localStorage:', userData);
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Dispatch auth state change event
        window.dispatchEvent(new Event('authStateChange'));
        navigate('/user');
        window.location.reload();
      } else {
        alert('Login gagal di backend');
      }
    } catch (err) {
      Swal.fire({
        icon: 'error',
        title: 'Login Gagal',
        text: err.message,
        confirmButtonColor: '#2563eb'
      });
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      const result = await signInWithEmailAndPassword(auth, email, password);
      const idToken = await result.user.getIdToken();
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/firebase`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ idToken, mode: 'login' }),
      });
      const data = await response.json();
      if (data.token) {
        localStorage.setItem('token', data.token);
        const user = result.user;
        localStorage.setItem('userData', JSON.stringify({
          name: user.displayName,
          email: user.email,
          photoURL: user.photoURL
        }));
        // Dispatch auth state change event
        window.dispatchEvent(new Event('authStateChange'));
        navigate('/user');
        window.location.reload();
      } else {
        alert('Login gagal di backend');
      }
    } catch (err) {
      if (err.code === 'auth/invalid-credential') {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: 'Email atau password salah!',
          confirmButtonColor: '#2563eb'
        });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Login Gagal',
          text: err.message,
          confirmButtonColor: '#2563eb'
        });
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-100 to-purple-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-bold text-blue-900 mb-6">Login to OSDATUM</h1>
        <form onSubmit={handleEmailLogin} className="mb-2">
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-2 px-3 py-2 border rounded"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            className="w-full mb-4 px-3 py-2 border rounded"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          <button
            type="submit"
            className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            Login
          </button>
        </form>
        <div className="text-center mt-2 mb-2">or</div>
        <button
          onClick={handleGoogleLogin}
          className="w-full bg-white text-gray-700 px-4 py-2 rounded border border-gray-300 hover:bg-gray-50 flex items-center justify-center gap-2"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          Login with Google
        </button>
        <div className="text-center mt-4">
          <a href="/register" className="text-blue-600 hover:underline">Don't have an account? Sign up here!</a>
        </div>
      </div>
    </div>
  );
}
 