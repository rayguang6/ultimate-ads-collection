"use client";

import { useState, useEffect } from 'react';
import { TAG_COLORS } from '@/app/constants/colors';

export function useRandomColor() {
  const [color, setColor] = useState('');
  
  useEffect(() => {
    // Only run on client
    const colors = Object.values(TAG_COLORS);
    const randomColor = colors[Math.floor(Math.random() * colors.length)].bg;
    setColor(randomColor);
  }, []);
  
  const generateNewColor = () => {
    const colors = Object.values(TAG_COLORS);
    const randomColor = colors[Math.floor(Math.random() * colors.length)].bg;
    setColor(randomColor);
    return randomColor;
  };
  
  return { color, generateNewColor };
} 