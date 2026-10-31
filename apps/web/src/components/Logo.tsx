import React from 'react';

interface LogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
}

export const Logo: React.FC<LogoProps> = ({ className = 'w-7 h-7', size = 28, showText = false }) => {
  if (showText) {
    return (
      <img
        src="/tradeflow-logo.png"
        alt="TradeFlow"
        className={`object-contain ${className}`}
        style={size ? { height: size } : undefined}
      />
    );
  }

  return (
    <img
      src="/tradeflow-mark.png"
      alt="TradeFlow Mark"
      className={`object-contain inline-block ${className}`}
      style={size ? { width: size, height: size } : undefined}
    />
  );
};
