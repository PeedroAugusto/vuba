import { useNavigate } from 'react-router-dom';
import styles from './NotFound.module.scss';

export const NotFound = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        <i className="ri-movie-2-line"></i>
        <h1>Conteúdo Não Encontrado</h1>
        <p>
          Ops! Parece que o conteúdo que você está procurando não está disponível.
          Isso pode acontecer se o título foi removido ou se o link está incorreto.
        </p>
        <button onClick={() => navigate('/')} className={styles.backButton}>
          <i className="ri-arrow-left-line"></i>
          Voltar à Navegação
        </button>
      </div>
    </div>
  );
}; 