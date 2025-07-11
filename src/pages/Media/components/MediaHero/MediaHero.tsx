import React from 'react';
import { Movie } from '../../../../types/Movie';
import { Serie } from '../../../../types/Serie';
import styles from './MediaHero.module.scss';

interface MediaHeroProps {
    media: Movie | Serie;
    onBack: () => void;
    onWatch: () => void;
    onAddToList: () => void;
    formatDate?: (date: string) => string;
}

export const MediaHero: React.FC<MediaHeroProps> = ({
    media,
    onBack,
    onWatch,
    onAddToList,
    formatDate
}) => {
    const isSerie = (media: Movie | Serie): media is Serie => 'episodes' in media;

    return (
        <div
            className={styles.hero}
            style={{ backgroundImage: `url(${media.background})` }}
            role="banner"
        >
            <div className={styles.overlay}></div>
            <div className={styles.content}>
                <div className={styles.info}>
                    <button
                        className={styles.backButton}
                        onClick={onBack}
                        aria-label="Voltar para Home"
                    >
                        <i className='bx bx-arrow-back' aria-hidden="true"></i>
                        Voltar para Home
                    </button>

                    <div className={styles.mediaInfo}>
                        <h1>{media.title}</h1>
                        <p>{media.synopsis}</p>
                        <div className={styles.meta}>
                            <span className={styles.rating} title="Avaliação">
                                <i className='bx bxs-star' aria-hidden="true"></i>
                                {media.rating}
                            </span>
                            <span>{media.releaseYear}</span>
                            {isSerie(media) ? (
                                <>
                                    <span>{media.numberOfSeasons} Temporadas</span>
                                    <span className={styles.status}>{media.status}</span>
                                </>
                            ) : (
                                <span>{media.duration} min</span>
                            )}
                            <span className={styles.ageRating}>{media.ageGroup}</span>
                            {media.genres.map((genre: string, index: number) => (
                                <span key={index} className={styles.genre}>{genre}</span>
                            ))}
                        </div>
                    </div>

                    <div className={styles.buttons}>
                        <button
                            className={styles.playButton}
                            aria-label="Assistir agora"
                            onClick={onWatch}
                        >
                            <i className='bx bx-play' aria-hidden="true"></i>
                            Assistir
                        </button>
                        <button
                            className={styles.listButton}
                            aria-label="Adicionar à minha lista"
                            onClick={onAddToList}
                        >
                            <i className='bx bx-plus' aria-hidden="true"></i>
                            Minha Lista
                        </button>
                    </div>

                    {isSerie(media) && media.nextEpisodeDate && formatDate && (
                        <div className={styles.nextEpisode}>
                            <i className='bx bx-calendar-event' aria-hidden="true"></i>
                            Próximo episódio em: {formatDate(media.nextEpisodeDate)}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}; 