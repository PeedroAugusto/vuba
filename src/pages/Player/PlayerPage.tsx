import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Player } from '../../components/Player/Player';
import { useMedia } from '../../hooks/useMedia';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { Episode } from '../../types/Episode';
import styles from './PlayerPage.module.scss';

const PlayerPage: React.FC = () => {
    const navigate = useNavigate();
    const { id, episodeId } = useParams();
    const { movies, series } = useMedia();
    const [media, setMedia] = useState<Movie | Serie | null>(null);
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
    const [mediaType, setMediaType] = useState<'movie' | 'serie'>('movie');
    const [nextSuggestion, setNextSuggestion] = useState<Movie | Serie | null>(null);

    useEffect(() => {
        const isSerie = window.location.pathname.includes('/serie/');
        setMediaType(isSerie ? 'serie' : 'movie');
        
        const currentMedia = isSerie
            ? series.find(s => s.id === Number(id))
            : movies.find(m => m.id === Number(id));

        if (currentMedia) {
            setMedia(currentMedia);

            if (isSerie && episodeId && 'episodes' in currentMedia) {
                const episode = currentMedia.episodes.find(ep => ep.id === Number(episodeId));
                if (episode) {
                    setCurrentEpisode(episode);
                }
            }

            // Encontrar próxima sugestão
            if (isSerie) {
                // Para séries, sugerir outra série do mesmo gênero
                const suggestion = series
                    .filter(s => 
                        s.id !== currentMedia.id && 
                        s.genres.some(g => currentMedia.genres.includes(g))
                    )
                    .sort(() => Math.random() - 0.5)[0];
                setNextSuggestion(suggestion);
            } else {
                // Para filmes, sugerir outro filme do mesmo gênero
                const suggestion = movies
                    .filter(m => 
                        m.id !== currentMedia.id && 
                        m.genres.some(g => currentMedia.genres.includes(g))
                    )
                    .sort(() => Math.random() - 0.5)[0];
                setNextSuggestion(suggestion);
            }
        }
    }, [id, episodeId, movies, series]);

    const handleEpisodeChange = (newEpisode: Episode) => {
        if (id) {
            navigate(`/player/${id}/serie/${newEpisode.id}`);
        }
    };

    const handleClose = () => {
        if (id) {
            navigate(`/media/${mediaType}/${id}`);
        }
    };

    const handlePlayNextSuggestion = () => {
        if (nextSuggestion) {
            if ('episodes' in nextSuggestion) {
                // Se for série, começar pelo primeiro episódio
                const firstEpisode = nextSuggestion.episodes[0];
                navigate(`/player/${nextSuggestion.id}/serie/${firstEpisode.id}`);
            } else {
                // Se for filme, ir direto para o player
                navigate(`/player/${nextSuggestion.id}/movie`);
            }
        }
    };

    if (!media) {
        return <></>;
    }

    return (
        <div className={styles.playerPage}>
            <Player
                key={`${mediaType}-${id}-${episodeId || ''}`}
                media={media}
                currentEpisode={currentEpisode || undefined}
                onEpisodeChange={mediaType === 'serie' ? handleEpisodeChange : undefined}
                onClose={handleClose}
                nextSuggestion={nextSuggestion || undefined}
                onPlayNextSuggestion={handlePlayNextSuggestion}
            />
        </div>
    );
};

export default PlayerPage; 