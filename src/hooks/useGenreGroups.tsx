import { useMemo } from 'react';
import { Movie } from '../types/Movie';
import { Serie } from '../types/Serie';

interface GenreGroup {
  title: string;
  movies: Movie[];
  series: Serie[];
}

export const useGenreGroups = (movies: Movie[], series: Serie[]): GenreGroup[] => {
  return useMemo(() => {
    // Coleta todos os gêneros únicos
    const allGenres = new Set<string>();
    [...movies, ...series].forEach(item => {
      item.genres.forEach(genre => allGenres.add(genre));
    });

    // Cria grupos para cada gênero
    return Array.from(allGenres)
      .map(genre => ({
        title: genre,
        movies: movies.filter(movie => movie.genres.includes(genre)),
        series: series.filter(serie => serie.genres.includes(genre))
      }))
      .filter(group => group.movies.length > 0 || group.series.length > 0) // Remove grupos vazios
      .sort((a, b) => {
        // Ordena por quantidade total de itens (filmes + séries)
        const totalA = a.movies.length + a.series.length;
        const totalB = b.movies.length + b.series.length;
        return totalB - totalA;
      });
  }, [movies, series]);
}; 