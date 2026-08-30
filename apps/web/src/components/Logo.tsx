import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-7 h-7', size = 28 }) => {
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Top horizontal arrow bar of T */}
      <path
        d="M4 9H22M22 9L16 4M22 9L16 14"
        stroke="#38BDF8"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {/* Lower forward arrow / stem */}
      <path
        d="M9 23H24M24 23L18 18M24 23L18 28"
        stroke="#38BDF8"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};
