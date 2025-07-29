'use client';

import { useEffect, useState } from 'react';

export function AnimatedBackground() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="fixed inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50/30 to-purple-50/30"></div>
      
      {/* Animated gradient orbs */}
      <div 
        className="absolute w-96 h-96 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"
        style={{
          transform: `translate(${mousePosition.x * 0.05}px, ${mousePosition.y * 0.05}px)`,
          transition: 'transform 0.3s ease-out'
        }}
      ></div>
      
      <div 
        className="absolute top-1/3 right-1/4 w-64 h-64 bg-gradient-to-r from-orange-400/15 to-pink-400/15 rounded-full blur-2xl animate-bounce"
        style={{ animationDuration: '4s' }}
      ></div>
      
      <div 
        className="absolute bottom-1/4 left-1/3 w-80 h-80 bg-gradient-to-r from-green-400/10 to-blue-400/10 rounded-full blur-3xl animate-pulse"
        style={{ animationDuration: '6s' }}
      ></div>
    </div>
  );
}