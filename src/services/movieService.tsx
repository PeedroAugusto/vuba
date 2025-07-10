import { Movie } from '../types/Movie';
import moviesData from '../data/media.json';

const convertMovie = (movie: any): Movie => {
  return {
    id: movie.id,
    title: movie.title,
    synopsis: movie.synopsis,
    thumbnail: movie.thumbnail,
    background: movie.background,
    ageGroup: movie.ageGroup,
    rating: movie.rating,
    duration: movie.duration,
    releaseYear: movie.releaseYear,
    genres: movie.genres,
    videoUrl: movie.videoUrl,
    featured: movie.featured,
    genre: movie.genre
  };
};

export interface MovieService {
  getMovies: (genre?: string) => Promise<Movie[]>;
  getMovie: (id: number) => Promise<Movie>;
  getFeaturedMovie: () => Promise<Movie>;
}

export const movieService: MovieService = {
  async getMovies(genre?: string): Promise<Movie[]> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    let movies = moviesData.movies.map(convertMovie);
    
    if (genre) {
      movies = movies.filter(movie => movie.genres.includes(genre));
    }
    
    return movies;
  },

  async getMovie(id: number): Promise<Movie> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Procura primeiro no filme em destaque
    if (moviesData.featured.id === id) {
      return convertMovie(moviesData.featured);
    }

    // Depois procura na lista de filmes
    const movie = moviesData.movies.find(m => m.id === id);
    
    if (!movie) {
      throw new Error('Filme não encontrado');
    }
    
    return convertMovie(movie);
  },

  async getFeaturedMovie(): Promise<Movie> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return convertMovie(moviesData.featured);
  }
}; 