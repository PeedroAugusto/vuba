import React, { useState, useEffect, useCallback } from 'react';
import styles from './NextEpisodePreview.module.scss';
import { Episode } from '../../types/Episode';
import { Serie } from '../../types/Serie';

interface NextEpisodePreviewProps {
    serie: Serie;
    nextEpisode: Episode;
    onPlayNextEpisode: () => void;
    timeRemaining: number;
}

export const NextEpisodePreview: React.FC<NextEpisodePreviewProps> = ({
    serie,
    nextEpisode,
    onPlayNextEpisode,
    timeRemaining
}) => {
    const formatTime = useCallback((seconds: number) => {
        return Math.max(0, Math.ceil(seconds));
    }, []);

    return (
        <div className={styles.previewContainer}>
            <div className={styles.previewContent}>
                <div className={styles.header}>
                    <span>Próximo episódio em</span>
                    <div className={styles.countdown}>
                        <span>{formatTime(timeRemaining)}s</span>
                    </div>
                </div>
                
                <div className={styles.episodeInfo}>
                    <div className={styles.thumbnail}>
                        {nextEpisode.thumbnail && (
                            <img src={nextEpisode.thumbnail} alt={nextEpisode.title} />
                        )}
                    </div>
                    
                    <div className={styles.details}>
                        <h3>{serie.title}</h3>
                        <h4>T{nextEpisode.seasonNumber} E{nextEpisode.episodeNumber} - {nextEpisode.title}</h4>
                        <p>{nextEpisode.synopsis}</p>
                        
                        <div className={styles.actions}>
                            <button onClick={onPlayNextEpisode} className={styles.playButton}>
                                <i className='bx bx-play'></i>
                                <span>Reproduzir</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}; 