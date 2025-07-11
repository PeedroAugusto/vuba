import { useState, useEffect, useCallback } from 'react';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { movieService } from '../../services/movieService';
import { serieService } from '../../services/serieService';

interface UseMediaReturn {
    movies: Movie[];
    series: Serie[];
    featuredMovie: Movie | null;
    featuredSerie: Serie | null;
    loading: boolean;
    error: Error | null;
    getMediaById: (id: number, type: 'movie' | 'serie') => Promise<Movie | Serie | null>;
    refreshData: () => Promise<void>;
    filteredMovies: (query: string) => Movie[];
    filteredSeries: (query: string) => Serie[];
}

interface MediaCache {
    timestamp: number;
    data: {
        movies: Movie[];
        series: Serie[];
        featuredMovie: Movie | null;
        featuredSerie: Serie | null;
    };
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos
const mediaCache: MediaCache = {
    timestamp: 0,
    data: {
        movies: [],
        series: [],
        featuredMovie: null,
        featuredSerie: null
    }
};

export const useMedia = (): UseMediaReturn => {
    const [movies, setMovies] = useState<Movie[]>([]);
    const [series, setSeries] = useState<Serie[]>([]);
    const [featuredMovie, setFeaturedMovie] = useState<Movie | null>(null);
    const [featuredSerie, setFeaturedSerie] = useState<Serie | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const isCacheValid = useCallback(() => {
        return Date.now() - mediaCache.timestamp < CACHE_DURATION;
    }, []);

    const fetchData = useCallback(async (force: boolean = false) => {
        if (!force && isCacheValid()) {
            setMovies(mediaCache.data.movies);
            setSeries(mediaCache.data.series);
            setFeaturedMovie(mediaCache.data.featuredMovie);
            setFeaturedSerie(mediaCache.data.featuredSerie);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const [moviesData, seriesData, featured, featuredS] = await Promise.all([
                movieService.getMovies(),
                serieService.getSeries(),
                movieService.getFeaturedMovie(),
                serieService.getFeaturedSerie()
            ]);

            // Atualiza o cache
            mediaCache.timestamp = Date.now();
            mediaCache.data = {
                movies: moviesData,
                series: seriesData,
                featuredMovie: featured,
                featuredSerie: featuredS
            };

            setMovies(moviesData);
            setSeries(seriesData);
            setFeaturedMovie(featured);
            setFeaturedSerie(featuredS);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar dados'));
            console.error('Erro ao carregar dados:', err);
        } finally {
            setLoading(false);
        }
    }, [isCacheValid]);

    useEffect(() => {
        let isMounted = true;

        const initData = async () => {
            if (!isMounted) return;
            await fetchData();
        };

        initData();

        return () => {
            isMounted = false;
        };
    }, [fetchData]);

    const getMediaById = useCallback(async (id: number, type: 'movie' | 'serie'): Promise<Movie | Serie | null> => {
        try {
            // Primeiro tenta encontrar nos dados em cache
            if (type === 'movie') {
                const cachedMovie = movies.find(m => m.id === id);
                if (cachedMovie) return cachedMovie;
                return await movieService.getMovie(id);
            } else {
                const cachedSerie = series.find(s => s.id === id);
                if (cachedSerie) return cachedSerie;
                return await serieService.getSerie(id);
            }
        } catch (err) {
            console.error(`Erro ao carregar ${type}:`, err);
            return null;
        }
    }, [movies, series]);

    const refreshData = useCallback(async () => {
        await fetchData(true);
    }, [fetchData]);

    const filteredMovies = useCallback((query: string) => {
        const searchTerm = query.toLowerCase().trim();
        return movies.filter(movie => 
            movie.title.toLowerCase().includes(searchTerm) ||
            movie.synopsis.toLowerCase().includes(searchTerm)
        );
    }, [movies]);

    const filteredSeries = useCallback((query: string) => {
        const searchTerm = query.toLowerCase().trim();
        return series.filter(serie => 
            serie.title.toLowerCase().includes(searchTerm) ||
            serie.synopsis.toLowerCase().includes(searchTerm)
        );
    }, [series]);

    return {
        movies,
        series,
        featuredMovie,
        featuredSerie,
        loading,
        error,
        getMediaById,
        refreshData,
        filteredMovies,
        filteredSeries
    };
}; 