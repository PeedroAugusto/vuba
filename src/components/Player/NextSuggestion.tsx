import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NextSuggestion.module.scss';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';

interface ButtonProps {
    onClick: () => void;
    icon: string;
    label: string;
    className?: string;
}

interface NextSuggestionProps {
    currentMedia: Movie | Serie;
    suggestion: Movie | Serie;
    onPlaySuggestion: () => void;
    onClose: () => void;
}

export const NextSuggestion: React.FC<NextSuggestionProps> = ({
    currentMedia,
    suggestion,
    onPlaySuggestion,
    onClose
}) => {
    const navigate = useNavigate();
    useEffect(() => {
        // Define a variável CSS para o background da sugestão
        document.documentElement.style.setProperty(
            '--suggestion-background',
            `url(${suggestion.thumbnail})`
        );

        return () => {
            document.documentElement.style.removeProperty('--suggestion-background');
        };
    }, [suggestion.thumbnail]);

    const ActionButton: React.FC<ButtonProps> = ({ onClick, icon, label, className }) => (
        <button className={`${styles.actionButton} ${className || ''}`} onClick={onClick}>
            <i className={`bx ${icon}`} />
            {label}
        </button>
    );

    return (
        <div className={styles.container}>
            <ActionButton
                onClick={() => navigate('/')}
                icon="bx-home"
                label="Início"
                className={styles.homeButton}
            />
            <div 
                className={styles.currentMedia} 
                onClick={onClose}
            >
                <div className={styles.thumbnail}>
                    <img src={currentMedia.thumbnail} alt={currentMedia.title} />
                    <div className={styles.checkIcon}>
                        <i className='bx bx-check' />
                    </div>
                </div>
                <span>Concluído</span>
            </div>

            <div className={styles.suggestion}>
                <div className={styles.content}>
                    <div className={styles.label}>
                        <i className='bx bx-play-circle' />
                        Próxima Sugestão
                    </div>

                    <h3>{suggestion.title}</h3>
                    <p>{suggestion.synopsis}</p>

                    <div className={styles.metadata}>
                        {suggestion.releaseYear && (
                            <span>{suggestion.releaseYear}</span>
                        )}
                        {('genre' in suggestion && suggestion.genre) || (suggestion.genres?.[0] && (
                            <>
                                <div className={styles.dot} />
                                <span>{'genre' in suggestion ? suggestion.genre : suggestion.genres[0]}</span>
                            </>
                        ))}
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.playButton} onClick={onPlaySuggestion}>
                            <i className='bx bx-play' />
                            Assistir Agora
                        </button>
                        <button 
                            className={styles.moreButton} 
                            onClick={() => navigate(`/media/${'episodes' in suggestion ? 'serie' : 'movie'}/${suggestion.id}`)}
                        >
                            <i className='bx bx-info-circle' />
                            Mais Informações
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 