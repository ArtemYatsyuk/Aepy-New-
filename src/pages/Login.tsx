import React, { useState } from 'react';
import { useAuthStore } from '../store/useAuthStore';
import { GoogleLogin } from '@react-oauth/google';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const { login } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const endpoint = isRegister ? '/api/auth/register' : '/api/auth/login';
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: credentialResponse.credential }),
      });
      const data = await res.json();
      if (res.ok) {
        login(data.token, data.user);
      } else {
        alert(data.error);
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex items-center justify-center h-screen bg-black text-white">
      <div className="w-full max-w-md p-8 bg-[#121212] rounded-xl flex flex-col items-center">
        <h1 className="text-3xl font-bold mb-6 text-center text-[#1DB954]">Spotify Clone</h1>
        
        <div className="w-full mb-6 flex justify-center">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={() => {
              console.log('Login Failed');
            }}
            theme="filled_black"
            shape="pill"
            width="100%"
          />
        </div>

        <div className="w-full flex items-center gap-4 mb-6">
          <div className="flex-1 h-px bg-[#282828]"></div>
          <span className="text-[#B3B3B3] text-sm">or</span>
          <div className="flex-1 h-px bg-[#282828]"></div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 w-full">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 rounded bg-[#282828] text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 rounded bg-[#282828] text-white focus:outline-none focus:ring-2 focus:ring-[#1DB954]"
            required
          />
          <button type="submit" className="p-3 mt-4 rounded-full bg-[#1DB954] text-black font-bold hover:scale-105 transition-transform">
            {isRegister ? 'Sign Up' : 'Log In'}
          </button>
        </form>
        <p className="mt-4 text-center text-[#B3B3B3]">
          {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
          <button onClick={() => setIsRegister(!isRegister)} className="text-white hover:underline">
            {isRegister ? 'Log in' : 'Sign up'}
          </button>
        </p>
      </div>
    </div>
  );
}
