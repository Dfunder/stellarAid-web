'use client';

import React from 'react';

interface PasswordStrengthIndicatorProps {
  password?: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({
  password,
}) => {
  const getStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length > 8) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    return score;
  };

  const strength = getStrength();
  const strengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'][strength];
  const color = ['#ff0000', '#ff7f00', '#ffff00', '#00ff00', '#00ffff', '#0000ff'][strength];

  return (
    <div>
      <span>Password Strength: {strengthText}</span>
      <div style={{ width: '100%', backgroundColor: '#e0e0e0', borderRadius: '5px' }}>
        <div
          style={{
            width: `${(strength / 5) * 100}%`,
            backgroundColor: color,
            height: '10px',
            borderRadius: '5px',
          }}
        ></div>
      </div>
    </div>
  );
};

export default PasswordStrengthIndicator;