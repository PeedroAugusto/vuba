import React from 'react';
import styles from './NextEpisodePreview.module.scss';
import { Episode } from '../../types/Episode';

interface NextEpisodePreviewProps {
    episode: Episode;
    onPlay: () => void;
    currentTime: number;
    duration: number;
}

export const NextEpisodePreview: React.FC<NextEpisodePreviewProps> = ({
    episode,
    onPlay,
    currentTime,
    duration
}) => {
    // Calcula quantos segundos faltam baseado no tempo real do vídeo
    const timeRemaining = Math.max(0, Math.floor(duration - currentTime));

    // Se chegou a zero, dispara o próximo episódio
    if (timeRemaining === 0) {
        onPlay();
    }

    return (
        <div className={styles.previewContainer}>
            <div className={styles.previewContent}>
                <div className={styles.episodeInfo}>
                    <div className={styles.thumbnail}>
                        {episode.thumbnail && (
                            <img src={episode.thumbnail} alt={episode.title} />
                        )}
                    </div>
                    
                    <div className={styles.details}>
                        <div className={styles.countdown}>
                            <span>Próximo episódio em {timeRemaining}s</span>
                        </div>
                        <h4>T{episode.seasonNumber} E{episode.episodeNumber} - {episode.title}</h4>
                        <p>{episode.synopsis}</p>
                        
                        <div className={styles.actions}>
                            <button onClick={onPlay} className={styles.playNextButton}>
                                <i className='bx bx-play'></i>
                                <span>Reproduzir Agora</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 