import React, { useEffect, useState } from 'react';
import { Logo } from '../Logo/Logo';
import styles from './LogoIntro.module.scss';

interface LogoIntroProps {
  onComplete: () => void;
}

export const LogoIntro: React.FC<LogoIntroProps> = ({ onComplete }) => {
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Tempo total da intro (2.5 segundos)
    const timer = setTimeout(() => {
      setIsAnimating(false);
      // Aguarda a animação de fade out antes de chamar onComplete
      setTimeout(onComplete, 500);
    }, 2500);

    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className={`${styles.introContainer} ${!isAnimating ? styles.fadeOut : ''}`}>
      <Logo />
    </div>
  );
}; 