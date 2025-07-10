import React, { useMemo } from 'react';
import styles from './Movies.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { useMedia } from '../../hooks/useMedia';
import { Movie } from '../../types/Movie';

interface GenreGroup {
  title: string;
  movies: Movie[];
}

const Movies: React.FC = () => {
  const { movies, featuredMovie, loading } = useMedia();

  // Memoize os grupos de gênero
  const genreGroups = useMemo(() => {
    // Coleta todos os gêneros únicos
    const allGenres = new Set<string>();
    movies.forEach(movie => {
      movie.genres.forEach(genre => allGenres.add(genre));
    });

    // Cria grupos para cada gênero
    return Array.from(allGenres).map(genre => ({
      title: genre,
      movies: movies.filter(movie => movie.genres.includes(genre))
    }));
  }, [movies]);

  if (loading || !featuredMovie) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Separa os filmes mais bem avaliados
  const topMovies = movies.slice(0, 10);

  return (
    <div className={styles.movies}>
      <Navbar />
      
      <div className={styles.featured} style={{ backgroundImage: `url(${featuredMovie.background})` }}>
        <div className={styles.vignette}></div>
        <div className={styles.content}>
          <h1>{featuredMovie.title}</h1>
          <div className={styles.meta}>
            <span className={styles.rating}>
              <i className='bx bxs-star'></i>
              {featuredMovie.rating}
            </span>
            <span>{featuredMovie.releaseYear}</span>
            <span>{featuredMovie.duration} min</span>
            <span className={styles.ageRating}>{featuredMovie.ageGroup}</span>
          </div>
          <p className={styles.synopsis}>{featuredMovie.synopsis}</p>
          <div className={styles.buttons}>
            <button className={styles.playButton}>
              <i className='bx bx-play'></i>
              Assistir
            </button>
            <button className={styles.moreButton}>
              <i className='bx bx-info-circle'></i>
              Mais Informações
            </button>
          </div>
        </div>
      </div>

      <div className={styles.carousels}>
        <Carousel title="Filmes em Alta" items={topMovies} type="movie" />
        
        {genreGroups.map(group => (
          <React.Fragment key={group.title}>
            {group.movies.length > 0 && (
              <Carousel 
                title={`Filmes de ${group.title}`} 
                items={group.movies} 
                type="movie" 
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Movies; 