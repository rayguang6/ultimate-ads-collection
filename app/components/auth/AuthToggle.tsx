'use client';

import { useState } from 'react';
import SignIn from '../../admin/SignIn';
import SignUp from './SignUp';

export default function AuthToggle() {
  const [isSignIn, setIsSignIn] = useState(true);

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
      <div className="flex border-b border-gray-200">
        <button
          className={`flex-1 py-3 text-center ${isSignIn ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setIsSignIn(true)}
        >
          Sign In
        </button>
        <button
          className={`flex-1 py-3 text-center ${!isSignIn ? 'text-blue-600 border-b-2 border-blue-600 font-medium' : 'text-gray-500 hover:text-gray-700'}`}
          onClick={() => setIsSignIn(false)}
        >
          Sign Up
        </button>
      </div>
      
      <div className="p-6">
        {isSignIn ? <SignIn /> : <SignUp />}
      </div>
    </div>
  );
} 