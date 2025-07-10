import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import styles from './Media.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Grid } from '../../components/List/Grid/Grid';
import { useMedia } from '../../hooks/useMedia';

interface MediaParams {
    id: string;
    type: 'movie' | 'serie';
}

// Type guard para verificar se é uma série
const isSerie = (media: Movie | Serie): media is Serie => {
    return 'episodes' in media;
};

// Componente para o botão de voltar
const BackButton: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        className={styles.backButton} 
        onClick={onClick}
        aria-label="Voltar para Home"
    >
        <i className='bx bx-arrow-back' aria-hidden="true"></i>
        Voltar para Home
    </button>
);

// Componente para os metadados da mídia
const MediaMeta: React.FC<{ media: Movie | Serie }> = ({ media }) => (
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
        {media.genres.map((genre) => (
            <span key={genre} className={styles.genre}>{genre}</span>
        ))}
    </div>
);

// Componente para o dropdown de temporadas
interface SeasonDropdownProps {
    selectedSeason: number;
    availableSeasons: number[];
    onSeasonSelect: (season: number) => void;
}

const SeasonDropdown: React.FC<SeasonDropdownProps> = ({ 
    selectedSeason, 
    availableSeasons, 
    onSeasonSelect 
}) => {
    const [isOpen, setIsOpen] = useState(false);

    const handleSeasonSelect = useCallback((season: number) => {
        onSeasonSelect(season);
        setIsOpen(false);
    }, [onSeasonSelect]);

    return (
        <div className={styles.seasonDropdown}>
            <button 
                className={styles.dropdownToggle}
                onClick={() => setIsOpen(!isOpen)}
                aria-haspopup="listbox"
                aria-expanded={isOpen}
            >
                Temporada {selectedSeason}
                <i className={`bx bx-chevron-down ${isOpen ? styles.open : ''}`} aria-hidden="true"></i>
            </button>
            {isOpen && (
                <div 
                    className={styles.dropdownMenu} 
                    role="listbox"
                    aria-label="Selecione uma temporada"
                >
                    {availableSeasons.map((season) => (
                        <button
                            key={season}
                            className={selectedSeason === season ? styles.active : ''}
                            onClick={() => handleSeasonSelect(season)}
                            role="option"
                            aria-selected={selectedSeason === season}
                        >
                            Temporada {season}
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// Componente para o cartão de episódio
interface EpisodeCardProps {
    episode: Serie['episodes'][0];
    formatDate: (date: string) => string;
    formatDuration: (minutes: number) => string;
    mediaId: number;
}

const EpisodeCard: React.FC<EpisodeCardProps> = ({ 
    episode, 
    formatDate, 
    formatDuration,
    mediaId
}) => {
    const navigate = useNavigate();

    const handlePlayClick = () => {
        navigate(`/player/${mediaId}/serie/${episode.id}`);
    };

    return (
        <div className={styles.episodeCard} onClick={handlePlayClick}>
            <div className={styles.episodeThumb}>
                <img src={episode.thumbnail} alt={`Thumbnail do episódio ${episode.title}`} />
                <span className={styles.episodeNumber}>
                    Episódio {episode.episodeNumber}
                </span>
                <button 
                    className={styles.playButton}
                    aria-label={`Assistir ${episode.title}`}
                    onClick={(e) => {
                        e.stopPropagation(); // Evita duplo disparo do clique
                        handlePlayClick();
                    }}
                >
                    <i className='bx bx-play' aria-hidden="true"></i>
                </button>
            </div>
            <div className={styles.episodeInfo}>
                <div className={styles.episodeHeader}>
                    <h3>{episode.title}</h3>
                </div>
                <div className={styles.episodeMeta}>
                    <span>
                        <i className='bx bx-time' aria-hidden="true"></i>
                        {formatDuration(episode.duration)}
                    </span>
                    <span>
                        <i className='bx bx-calendar' aria-hidden="true"></i>
                        {formatDate(episode.releaseDate)}
                    </span>
                </div>
                <p className={styles.episodeSynopsis}>{episode.synopsis}</p>
            </div>
        </div>
    );
};

const Media = () => {
    const { id, type } = useParams<keyof MediaParams>() as MediaParams;
    const navigate = useNavigate();
    const { movies, series, getMediaById } = useMedia();
    const [media, setMedia] = useState<Movie | Serie | null>(null);
    const [similarMedia, setSimilarMedia] = useState<(Movie | Serie)[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedSeason, setSelectedSeason] = useState(1);
    const [showAllEpisodes, setShowAllEpisodes] = useState(false);

    const fetchData = useCallback(async () => {
        if (!id || !type) return;
        
        try {
            setLoading(true);
            setError(null);
            
            const mediaId = parseInt(id);
            const mediaData = await getMediaById(mediaId, type);
            
            if (!mediaData) {
                throw new Error('Mídia não encontrada');
            }

            setMedia(mediaData);

            // Encontra conteúdo similar baseado nos gêneros
            const contentList = type === 'movie' ? movies : series;
            const similar = contentList
                .filter(m => 
                    m.id !== mediaId && 
                    m.genres.some(genre => mediaData.genres.includes(genre))
                )
                .slice(0, 10);
            
            setSimilarMedia(similar);
        } catch (error) {
            console.error('Erro ao carregar mídia:', error);
            setError('Conteúdo não encontrado');
        } finally {
            setLoading(false);
        }
    }, [id, type, getMediaById, movies, series]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    }, []);

    const formatDuration = useCallback((minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    }, []);

    // Memoize valores derivados
    const filteredEpisodes = useMemo(() => 
        media && isSerie(media) ? 
            media.episodes.filter(episode => episode.seasonNumber === selectedSeason) : 
            [],
        [media, selectedSeason]
    );

    const displayedEpisodes = useMemo(() => 
        showAllEpisodes ? filteredEpisodes : filteredEpisodes.slice(0, 3),
        [filteredEpisodes, showAllEpisodes]
    );

    const availableSeasons = useMemo(() => 
        media && isSerie(media) ? 
            Array.from({ length: media.numberOfSeasons }, (_, i) => i + 1) : 
            [],
        [media]
    );

    const currentSimilarMedia = useMemo(() => 
        similarMedia.length > 0 ? similarMedia : 
            (type === 'movie' ? movies : series)
                .filter(m => 
                    m.id !== parseInt(id) && 
                    media?.genres.some(genre => m.genres.includes(genre))
                )
                .slice(0, 10),
        [similarMedia, type, movies, series, id, media]
    );

    const handleWatchClick = () => {
        if (type === 'movie' && media) {
            navigate(`/player/${id}/movie`);
        } else if (type === 'serie' && media && 'episodes' in media && media.episodes.length > 0) {
            // Navega para o primeiro episódio da série
            const firstEpisode = media.episodes[0];
            navigate(`/player/${id}/serie/${firstEpisode.id}`);
        }
    };

    if (loading) {
        return (
            <div className={styles.loading} role="alert" aria-busy="true">
                <div className={styles.spinner}></div>
            </div>
        );
    }

    if (error || !media) {
        return (
            <div className={styles.error} role="alert">
                <h2>{error}</h2>
                <p>Desculpe, não conseguimos encontrar o conteúdo que você está procurando.</p>
                <button onClick={() => navigate('/')}>Voltar para Home</button>
            </div>
        );
    }

    return (
        <div className={styles.moviePage}>
            <Navbar />
            <div 
                className={styles.hero} 
                style={{ backgroundImage: `url(${media.background})` }}
                role="banner"
            >
                <div className={styles.overlay}></div>
                <div className={styles.content}>
                    <div className={styles.info}>
                        <BackButton onClick={() => navigate('/')} />
                        <div className={styles.mediaInfo}>
                            <h1>{media.title}</h1>
                            <div className={styles.metadata}>
                                <span>{media.releaseYear}</span>
                                <span>{media.duration} min</span>
                                <span>{media.rating}</span>
                            </div>
                            <p>{media.synopsis}</p>
                            <div className={styles.genres}>
                                {media.genres.map((genre, index) => (
                                    <span key={index}>{genre}</span>
                                ))}
                            </div>
                          
                        </div>
                        <MediaMeta media={media} />
                        <div className={styles.buttons}>
                            <button 
                                className={styles.playButton}
                                aria-label="Assistir agora"
                                onClick={handleWatchClick}
                            >
                                <i className='bx bx-play' aria-hidden="true"></i>
                                Assistir
                            </button>
                            <button 
                                className={styles.listButton}
                                aria-label="Adicionar à minha lista"
                            >
                                <i className='bx bx-plus' aria-hidden="true"></i>
                                Minha Lista
                            </button>
                        </div>
                        {isSerie(media) && media.nextEpisodeDate && (
                            <div className={styles.nextEpisode}>
                                <i className='bx bx-calendar-event' aria-hidden="true"></i>
                                Próximo episódio em: {formatDate(media.nextEpisodeDate)}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isSerie(media) && media.episodes && (
                <div className={styles.episodes}>
                    <div className={styles.episodesHeader}>
                        <h2>Episódios</h2>
                        <SeasonDropdown 
                            selectedSeason={selectedSeason}
                            availableSeasons={availableSeasons}
                            onSeasonSelect={setSelectedSeason}
                        />
                    </div>
                    <div className={styles.episodeList}>
                        {displayedEpisodes.map((episode) => (
                            <EpisodeCard 
                                key={episode.id}
                                episode={episode}
                                formatDate={formatDate}
                                formatDuration={formatDuration}
                                mediaId={parseInt(id)}
                            />
                        ))}
                    </div>
                    {filteredEpisodes.length > 3 && (
                        <button 
                            className={styles.expandButton}
                            onClick={() => setShowAllEpisodes(!showAllEpisodes)}
                            aria-expanded={showAllEpisodes}
                        >
                            <span>
                                {showAllEpisodes ? 'Ver menos' : 'Ver mais'}
                                <i 
                                    className={`bx bx-chevron-${showAllEpisodes ? 'up' : 'down'}`}
                                    aria-hidden="true"
                                ></i>
                            </span>
                        </button>
                    )}
                </div>
            )}

            {currentSimilarMedia.length > 0 && (
                <div className={styles.similar}>
                    <Grid 
                        title={`${type === 'movie' ? 'Filmes' : 'Séries'} Similares`}
                        items={type === 'movie' ? currentSimilarMedia as Movie[] : currentSimilarMedia as Serie[]}
                        type={type}
                    />
                </div>
            )}
        </div>
    );
};

export default Media; 