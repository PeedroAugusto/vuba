import React from 'react';
import styles from './Logo.module.scss';

export const Logo: React.FC = () => {
  return (
    <div className={styles.logoContainer}>
      <svg 
        viewBox="0 0 160 60" 
        className={styles.logo}
      >
        {/* Letra V - assimétrica com perna esquerda menor */}
        <path 
          className={`${styles.letter} ${styles.v}`}
          d="M20,20 L32,48 L42,12"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Letra U - condensada */}
        <path 
          className={`${styles.letter} ${styles.u}`}
          d="M52,12 L52,40 Q52,48 58,48 L62,48 Q68,48 68,40 L68,12"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Letra B - arcos */}
        <path 
          className={`${styles.letter} ${styles.b}`}
          d="M78,12 L78,48 C78,48 88,48 92,48 C96,48 96,42 96,40 C96,38 96,32 92,30 C88,28 78,30 78,30 C78,30 88,30 92,30 C96,30 96,24 96,22 C96,20 96,12 92,12 C88,12 78,12 78,12"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
        />
        
        {/* Letra A - condensada */}
        <path 
          className={`${styles.letter} ${styles.a}`}
          d="M102,48 L114,12 L126,48 M106,36 L122,36"
          fill="none"
          strokeWidth="5"
          strokeLinecap="round"
        />

        {/* Ponto */}
        <circle 
          className={styles.dot}
          cx="130" 
          cy="14" 
          r="2.5"
          fill="currentColor"
        />
      </svg>
    </div>
  );
}; 