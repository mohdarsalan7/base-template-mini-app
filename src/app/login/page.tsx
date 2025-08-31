'use client';

import React, { use, useState } from 'react';
import { UserCircle, Lock, LogIn, Rocket } from 'lucide-react';
import axios, { AxiosResponse } from 'axios';
import { useRouter } from 'next/navigation';

const AuthPage = () => {
  const [isLoginView, setIsLoginView] = useState(true);

  // Form state
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const route = useRouter();

  const handleToggleView = () => {
    setIsLoginView(!isLoginView);
    // Reset form fields and errors when switching views
    setUsername('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear previous errors

    if (isLoginView) {
      // --- LOGIN LOGIC ---
      // This is where you would call your backend API to log in
      console.log('Logging in with:', { username, password });
      if (!username || !password) {
        setError('Please enter both username and password.');
        return;
      }

      const response: AxiosResponse = await axios.post(
        'http://localhost:5000/api/users/login',
        {
          username,
          password,
        },
      );
      if (response.status === 200) {
        route.push('/');
      }

      localStorage.setItem('userToken', response.data.token);
      // On successful login, you would redirect to the game
    } else {
      // --- REGISTRATION LOGIC ---
      // This is where you would call your backend API to register
      console.log('Registering with:', { username, password });
      if (!username || !password || !confirmPassword) {
        setError('Please fill in all fields.');
        return;
      }
      if (password !== confirmPassword) {
        setError('Passwords do not match.');
        return;
      }

      const response: AxiosResponse = await axios.post(
        'http://localhost:5000/api/users/register',
        {
          username,
          password,
        },
      );
      if (response.status === 201) {
        route.push('/');
      }

      localStorage.setItem('userToken', response.data.token);
    }
  };

  return (
    <div className="relative w-full h-screen bg-gradient-to-br from-[#301852] to-[#800c2e] overflow-hidden font-sans flex items-center justify-center p-4">
      {/* Animated background stars & nebula (copied from the game) */}
      <div className="absolute inset-0 z-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-star-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`,
            }}
          />
        ))}
        <div className="absolute inset-0 bg-radial-gradient opacity-30 animate-slow-fade"></div>
      </div>

      {/* Auth Form Card */}
      <div className="relative z-10 w-full max-w-md bg-[#301852]/50 backdrop-blur-sm rounded-2xl p-8 text-white shadow-2xl border border-gray-600/50">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold flex items-center justify-center gap-3">
            <Rocket className="w-8 h-8 text-amber-300" />
            Cosmic Tap
          </h1>
          <p className="text-gray-300 mt-2">
            {isLoginView ? 'Welcome back, Pilot!' : 'Join the Cosmic Fleet!'}
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6">
            {/* Username Input */}
            <div className="relative">
              <UserCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
              />
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
              />
            </div>

            {/* Confirm Password Input (Register only) */}
            {!isLoginView && (
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  placeholder="Confirm Password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-600 rounded-lg py-3 pl-10 pr-4 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-400 transition-all duration-300"
                />
              </div>
            )}
          </div>

          {/* Error Message */}
          {error && (
            <p className="text-red-400 text-sm mt-4 text-center">{error}</p>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full mt-8 bg-amber-600/80 hover:bg-amber-600 border border-amber-500/50 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 active:scale-95"
          >
            <LogIn className="w-5 h-5" />
            <span>{isLoginView ? 'Login' : 'Create Account'}</span>
          </button>
        </form>

        {/* Toggle between Login/Register */}
        <p className="mt-8 text-center text-sm text-gray-400">
          {isLoginView ? "Don't have an account?" : 'Already have an account?'}
          <button
            onClick={handleToggleView}
            className="font-semibold text-amber-300 hover:text-amber-200 ml-2 focus:outline-none"
          >
            {isLoginView ? 'Sign Up' : 'Login'}
          </button>
        </p>
      </div>
    </div>
  );
};

export default AuthPage;
