import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Error.module.scss';

interface ErrorProps {
  message?: string;
  onRetry?: () => void;
}

export const Error: React.FC<ErrorProps> = ({ 
  message = "Ops! Algo deu errado.",
  onRetry 
}) => {
  const navigate = useNavigate();

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div className={styles.error}>
      <div className={styles.content}>
        <i className='bx bx-error-circle'></i>
        <h2>Erro ao Carregar</h2>
        <p>{message}</p>
        <div className={styles.buttons}>
          <button onClick={handleRetry} className={styles.retryButton}>
            <i className='bx bx-refresh'></i>
            Tentar Novamente
          </button>
          <button onClick={() => navigate('/')} className={styles.homeButton}>
            <i className='bx bx-home'></i>
            Voltar ao Início
          </button>
        </div>
      </div>
    </div>
  );
}; 