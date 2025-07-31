'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { API_ENDPOINTS } from '@/lib/api-config';

interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

const LoginPage: React.FC = () => {
  const router = useRouter();
  const [activePanel, setActivePanel] = useState<'admin' | 'staff'>('admin');
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: '',
    rememberMe: false,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          password: formData.password
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        // Store user data in localStorage
        localStorage.setItem('user', JSON.stringify(result.user));
        localStorage.setItem('userRole', result.user.role);
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('sessionId', result.sessionId.toString());

        // Redirect to main page
        router.push('/dashboard');
      } else {
        setError(result.error || 'Invalid username or password');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Login failed. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background blur effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-pink-600/20 backdrop-blur-3xl"></div>
      
      {/* Main container */}
      <div className="relative w-full max-w-6xl mx-auto">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white/10 backdrop-blur-sm rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Secure Portal</h1>
          <p className="text-white/70" style={{ fontFamily: 'var(--font-poppins)' }}>Access your dashboard</p>
        </div>

        {/* Login container */}
        <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
          {/* Panel toggle */}
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 z-10">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-1">
              <div className="flex">
                <button
                  onClick={() => setActivePanel('admin')}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activePanel === 'admin'
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Admin
                </button>
                <button
                  onClick={() => setActivePanel('staff')}
                  className={`px-6 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                    activePanel === 'staff'
                      ? 'bg-white text-slate-900 shadow-lg'
                      : 'text-white/70 hover:text-white'
                  }`}
                  style={{ fontFamily: 'var(--font-poppins)' }}
                >
                  Staff
                </button>
              </div>
            </div>
          </div>

          {/* Panels container */}
          <div className="relative h-[600px] overflow-hidden pt-20">
            {/* Admin Panel */}
            <div
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                activePanel === 'admin' ? 'translate-x-0' : '-translate-x-full'
              }`}
            >
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-500/20 rounded-2xl mb-4">
                      <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Admin Access</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                          placeholder="Enter your username"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                          disabled={loading}
                        />
                        <span className="ml-2 text-sm text-white/70" style={{ fontFamily: 'var(--font-poppins)' }}>Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-blue-400 hover:text-blue-300 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {loading ? 'Signing in...' : 'Sign in as Admin'}
                    </button>
                  </form>
                </div>
              </div>
            </div>

            {/* Staff Panel */}
            <div
              className={`absolute inset-0 transition-transform duration-700 ease-in-out ${
                activePanel === 'staff' ? 'translate-x-0' : 'translate-x-full'
              }`}
            >
              <div className="h-full flex items-center justify-center p-8">
                <div className="w-full max-w-md">
                  <div className="text-center mb-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-500/20 rounded-2xl mb-4">
                      <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>Staff Access</h2>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                      <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-3 text-red-200 text-sm">
                        {error}
                      </div>
                    )}
                    
                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Username
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="username"
                          value={formData.username}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                          placeholder="Enter your username"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-white/90 mb-2" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Password
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-5 w-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type="password"
                          name="password"
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full pl-10 pr-4 py-3 bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all duration-200"
                          style={{ fontFamily: 'var(--font-poppins)' }}
                          placeholder="Enter your password"
                          required
                          disabled={loading}
                        />
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          name="rememberMe"
                          checked={formData.rememberMe}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                          disabled={loading}
                        />
                        <span className="ml-2 text-sm text-white/70" style={{ fontFamily: 'var(--font-poppins)' }}>Remember me</span>
                      </label>
                      <a href="#" className="text-sm text-green-400 hover:text-green-300 transition-colors" style={{ fontFamily: 'var(--font-poppins)' }}>
                        Forgot password?
                      </a>
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                      style={{ fontFamily: 'var(--font-poppins)' }}
                    >
                      {loading ? 'Signing in...' : 'Sign in as Staff'}
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-white/50 text-sm" style={{ fontFamily: 'var(--font-poppins)' }}>
            © 2024 Secure Portal. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage; 