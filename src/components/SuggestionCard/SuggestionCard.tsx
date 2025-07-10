import React from 'react';
import { Movie } from '../../types/Movie';
import styles from './SuggestionCard.module.scss';

interface SuggestionCardProps {
    movie: Movie;
}

const SuggestionCard: React.FC<SuggestionCardProps> = ({ movie }) => {

    const formatDuration = (minutes: number): string => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        if (hours === 0) {
            return `${remainingMinutes}min`;
        } else if (remainingMinutes === 0) {
            return `${hours}h`;
        } else {
            return `${hours}h ${remainingMinutes}min`;
        }
    };

    return (
        <div className={styles.card}>
            <div className={styles.imageContainer}>
                <img src={movie.thumbnail} alt={movie.title} />
                <span className={styles.duration}>{formatDuration(movie.duration)}</span>
            </div>
            <div className={styles.info}>
                <div className={styles.meta}>
                    <span className={styles.ageRating}>{movie.ageGroup}</span>
                    <span className={styles.hd}>HD</span>
                    <span className={styles.year}>{movie.releaseYear}</span>
                    <button className={styles.addButton}><i className='bx bx-plus'></i></button>
                </div>
                <p className={styles.synopsis}>{movie.synopsis}</p>
            </div>
        </div>
    );
};

export default SuggestionCard; 