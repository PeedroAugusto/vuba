import React from 'react';
import styles from './Featured.module.scss';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';

interface FeaturedProps {
  media: Movie | Serie;
  onPlay: () => void;
  onMoreInfo: () => void;
}

export const Featured: React.FC<FeaturedProps> = ({ media, onPlay, onMoreInfo }) => {
  return (
    <div className={styles.featured} style={{ backgroundImage: `url(${media.background})` }}>
      <div className={styles.vignette}></div>
      <div className={styles.content}>
        <h1>{media.title}</h1>
        <div className={styles.meta}>
          <span className={styles.rating}>
            <i className='bx bxs-star'></i>
            {media.rating}
          </span>
          <span>{media.releaseYear}</span>
          <span>{media.duration} min</span>
          <span className={styles.ageRating}>{media.ageGroup}</span>
        </div>
        <p className={styles.synopsis}>{media.synopsis}</p>
        <div className={styles.buttons}>
          <button className={styles.playButton} onClick={onPlay}>
            <i className='bx bx-play'></i>
            Assistir
          </button>
          <button className={styles.moreButton} onClick={onMoreInfo}>
            <i className='bx bx-info-circle'></i>
            Mais Informações
          </button>
        </div>
      </div>
    </div>
  );
}; 