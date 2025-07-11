import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './NextSuggestion.module.scss';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { Episode } from '../../types/Episode';

interface NextSuggestionProps {
    media: Movie | Serie;
    onPlay: () => void;
    currentMedia: Movie | Serie;
    currentEpisode?: Episode;
}

export const NextSuggestion: React.FC<NextSuggestionProps> = ({
    media,
    onPlay,
    currentMedia,
    currentEpisode
}) => {
    const navigate = useNavigate();

    return (
        <div className={styles.nextSuggestionContainer}>
            {/* Background Image */}
            <div 
                className={styles.backgroundImage}
                style={{ 
                    backgroundImage: `url(${media.background})`,
                }}
            />

            {/* Botão Voltar à Navegação */}
            <button 
                className={styles.homeButton}
                onClick={() => navigate('/')}
            >
                <i className='bx bx-arrow-back'></i>
                Voltar à Navegação
            </button>

            {/* Current Media Box */}
            <div className={styles.currentMedia}>
                <div className={styles.thumbnail}>
                    <img src={currentMedia.thumbnail} alt={currentMedia.title} />
                    <div className={styles.checkIcon}>
                        <i className='bx bx-check' />
                    </div>
                </div>
                <span>
                    {currentEpisode 
                        ? `T${currentEpisode.seasonNumber} E${currentEpisode.episodeNumber} - ${currentEpisode.title}`
                        : currentMedia.title
                    }
                </span>
            </div>

            <div className={styles.suggestion}>
                <div className={styles.content}>
                    <div className={styles.label}>
                        <i className='bx bx-play-circle' />
                        <span>Próxima Sugestão</span>
                    </div>

                    <h3>{media.title}</h3>
                    <p>{media.synopsis}</p>

                    <div className={styles.metadata}>
                        {media.releaseYear && (
                            <span>{media.releaseYear}</span>
                        )}
                        {/* Gênero */}
                        <div className={styles.dot} />
                        <span>
                            {('genre' in media && media.genre) || media.genres?.[0] || 'Sem gênero'}
                        </span>
                        {/* Tipo de mídia */}
                                <div className={styles.dot} />
                        <span>{('episodes' in media ? 'Série' : 'Filme')}</span>
                    </div>

                    <div className={styles.buttons}>
                        <button className={styles.playButton} onClick={onPlay}>
                            <i className='bx bx-play' />
                            <span>Assistir Agora</span>
                        </button>
                        <button 
                            className={styles.moreButton} 
                            onClick={() => navigate(`/media/${'episodes' in media ? 'serie' : 'movie'}/${media.id}`)}
                        >
                            <i className='bx bx-info-circle' />
                            <span>Mais Informações</span>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}; 