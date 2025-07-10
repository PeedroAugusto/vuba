import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../types/Movie';
import { Serie } from '../types/Serie';
import { movieService } from '../services/movieService';
import { serieService } from '../services/serieService';

interface UseMediaReturn {
    movies: Movie[];
    series: Serie[];
    featuredMovie: Movie | null;
    featuredSerie: Serie | null;
    loading: boolean;
    getMediaById: (id: number, type: 'movie' | 'serie') => Promise<Movie | Serie | null>;
}

export const useMedia = (): UseMediaReturn => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
    const [featuredSerie, setFeaturedSerie] = useState<Serie | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;

        const fetchData = async () => {
            try {
                const [moviesData, seriesData, featured, featuredS] = await Promise.all([
                    movieService.getMovies(),
                    serieService.getSeries(),
                    movieService.getFeaturedMovie(),
                    serieService.getFeaturedSerie()
                ]);
                
                if (!isMounted) return;

                setMovies(moviesData);
                setSeries(seriesData);
                setFeaturedMovie(featured);
                setFeaturedSerie(featuredS);
            } catch (error) {
                console.error('Erro ao carregar dados:', error);
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchData();

        return () => {
            isMounted = false;
        };
    }, []);

    const getMediaById = useCallback(async (id: number, type: 'movie' | 'serie'): Promise<Movie | Serie | null> => {
        try {
            if (type === 'movie') {
                return await movieService.getMovie(id);
            } else {
                return await serieService.getSerie(id);
            }
        } catch (error) {
            console.error(`Erro ao carregar ${type}:`, error);
            return null;
        }
    }, []);

    return {
        movies,
        series,
        featuredMovie,
        featuredSerie,
        loading,
        getMediaById
    };
}; 