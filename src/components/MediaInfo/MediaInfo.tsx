import React, { useLayoutEffect, useState, useEffect } from 'react';
import { Movie } from '../../types/Movie';
import styles from './MediaInfo.module.scss';
import Number10 from '../../assets/images/number-10.png';
import Number12 from '../../assets/images/number-12.png';
import Number14 from '../../assets/images/number-14.png';
import Number16 from '../../assets/images/number-16.png';
import Number18 from '../../assets/images/number-18.png';
import L from '../../assets/images/letter-l.png';
import { movieService } from '../../services/movieService';
import SuggestionCard from '../SuggestionCard/SuggestionCard';


interface MediaInfoProps {
    movie: Movie;
    isOpen: boolean;
    onClose: () => void;
}

const MediaInfo: React.FC<MediaInfoProps> = ({ movie, isOpen, onClose }) => {
    const [suggestions, setSuggestions] = useState<Movie[]>([]);

    const getAgeGroupImage = (ageGroup: string) => {
        switch (ageGroup) {
            case '10':
                return Number10;
            case '12':
                return Number12;
            case '14':
                return Number14;
            case '16':
                return Number16;
            case '18':
                return Number18;
            case 'L':
                return L;
            default:
                return null;
        }
    };

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

    
    
    useLayoutEffect(() => {
        if (isOpen) {
            const originalStyle = window.getComputedStyle(document.body).overflow;
            document.body.style.overflow = 'hidden';

            return () => {
                document.body.style.overflow = originalStyle;
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (isOpen && movie.genres.length > 0) {
            const fetchSuggestions = async () => {
                try {
                    // Fetch movies for the first genre and filter out the current movie
                    //const suggestedMovies = await movieService.getMovies(movie.genres[0]);
                    const suggestedMovies = [
                        {
                            id: 3,
                            title: "Monstros S.A",
                            synopsis: "Neste suspense sombrio, uma adolescente começa a se sentir estranha após testemunhar um assassinato brutal por uma criatura desconhecida.",
                            thumbnail: "https://occ-0-964-185.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaAUz-BMcRQl0Nf2lUS-CfGi-ev5ZtQJ9eim7qiLhgHiocjiAJjGyFhM8mV6kRx1SoCvFP1-YCbPXM60JJTd6Hsc4HDlRR_U45P7LTwLUuLUfTfXc_osC5EMqzDSBofK40AfrAh1OupTpv2W8humHfbLIAWLDXSjxvKJnlSaIpd-HcPuQrb9kmOpA71CkKb5yR015uP6zw2qQeE8_8HlpEg1K0nbE8VesKC4T2EnWMmxFe-9r4W5IL3-OQo.jpg?r=e4c",
                            ageGroup: "16",
                            rating: 4.5,
                            duration: 119,
                            releaseYear: 2001,
                            genres: ["Ação", "Drama", "Suspense"]
                        },
                        {
                            id: 4,
                            title: "Monstros S.A",
                            synopsis: "Neste suspense sombrio, uma adolescente começa a se sentir estranha após testemunhar um assassinato brutal por uma criatura desconhecida.",
                            thumbnail: "https://occ-0-964-185.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaAUz-BMcRQl0Nf2lUS-CfGi-ev5ZtQJ9eim7qiLhgHiocjiAJjGyFhM8mV6kRx1SoCvFP1-YCbPXM60JJTd6Hsc4HDlRR_U45P7LTwLUuLUfTfXc_osC5EMqzDSBofK40AfrAh1OupTpv2W8humHfbLIAWLDXSjxvKJnlSaIpd-HcPuQrb9kmOpA71CkKb5yR015uP6zw2qQeE8_8HlpEg1K0nbE8VesKC4T2EnWMmxFe-9r4W5IL3-OQo.jpg?r=e4c",
                            ageGroup: "16",
                            rating: 4.5,
                            duration: 119,
                            releaseYear: 2001,
                            genres: ["Ação", "Drama", "Suspense"]
                        },
                        {
                            id: 4,
                            title: "Monstros S.A",
                            synopsis: "Neste suspense sombrio, uma adolescente começa a se sentir estranha após testemunhar um assassinato brutal por uma criatura desconhecida.",
                            thumbnail: "https://occ-0-964-185.1.nflxso.net/dnm/api/v6/Qs00mKCpRvrkl3HZAN5KwEL1kpE/AAAABaAUz-BMcRQl0Nf2lUS-CfGi-ev5ZtQJ9eim7qiLhgHiocjiAJjGyFhM8mV6kRx1SoCvFP1-YCbPXM60JJTd6Hsc4HDlRR_U45P7LTwLUuLUfTfXc_osC5EMqzDSBofK40AfrAh1OupTpv2W8humHfbLIAWLDXSjxvKJnlSaIpd-HcPuQrb9kmOpA71CkKb5yR015uP6zw2qQeE8_8HlpEg1K0nbE8VesKC4T2EnWMmxFe-9r4W5IL3-OQo.jpg?r=e4c",
                            ageGroup: "16",
                            rating: 4.5,
                            duration: 119,
                            releaseYear: 2001,
                            genres: ["Ação", "Drama", "Suspense"]
                        }
                            
                    ]
                    
                    setSuggestions(suggestedMovies.filter(m => m.id !== movie.id));
                } catch (error) {
                    console.error("Failed to fetch suggestions:", error);
                }
            };

            fetchSuggestions();
        }
    }, [isOpen, movie]);

    if (!isOpen) return null;

    return (
        <div className={styles.modalOverlay} onClick={onClose}>
            <div className={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                <button className={styles.closeButton} onClick={onClose}>
                    ×
                </button>
                <div className={styles.mediaInfo}>
                    <div className={styles.imageContainer}>
                        <img src={movie.thumbnail} alt={movie.title} />
                        <div className={styles.imageOverlay} />
                        <div className={styles.overlayContent}>
                            <h2>{movie.title}</h2>
                            <div className={styles.playButtonContainer}>
                                <button className={styles.playButton}>
                                    <i className='bx bx-play'></i>
                                    Assistir
                                </button>
                                <button className={styles.addFavoriteButton}>
                                    <i className='bx bx-plus'></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className={styles.content}>
                        <div className={styles.metaInfo}>
                            <span>{movie.releaseYear}</span>
                            <span>{formatDuration(movie.duration)}</span>
                            <span>{movie.genres.join(', ')}</span>
                        </div>
                        <div className={styles.parentalRating}>
                            <img src={getAgeGroupImage(movie.ageGroup) || ''} alt={movie.ageGroup} className={styles.ageGroup} />
                        </div>
                        <p>{movie.synopsis}</p>
                    </div>
                    <div className={styles.suggestions}>
                        <h2>Títulos semelhantes</h2>
                        <div className={styles.suggestionsGrid}>
                            {suggestions.map(suggestion => (
                                <SuggestionCard key={suggestion.id} movie={suggestion} />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MediaInfo;
