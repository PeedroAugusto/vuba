import React, { useMemo } from 'react';
import styles from './Home.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { useMedia } from '../../hooks/useMedia';

const Home: React.FC = () => {
  const { movies, featuredMovie, loading, series } = useMedia();

  // Memoize os grupos de gênero
  const genreGroups = useMemo(() => {
    // Coleta todos os gêneros únicos
    const allGenres = new Set<string>();
    [...movies, ...series].forEach(item => {
      item.genres.forEach(genre => allGenres.add(genre));
    });

    // Cria grupos para cada gênero
    return Array.from(allGenres).map(genre => ({
      title: genre,
      movies: movies.filter(movie => movie.genres.includes(genre)),
      series: series.filter(serie => serie.genres.includes(genre))
    }));
  }, [movies, series]);

  if (loading || !featuredMovie) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Separa séries e filmes para carrosséis específicos
  const topMovies = movies.slice(0, 10);
  const topSeries = series.slice(0, 10);

  return (
    <div className={styles.home}>
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
        <Carousel title="Séries em Alta" items={topSeries} type="serie" />
        
        {genreGroups.map(group => (
          <React.Fragment key={group.title}>
            {group.movies.length > 0 && (
              <Carousel 
                title={`Filmes de ${group.title}`} 
                items={group.movies} 
                type="movie" 
              />
            )}
            {group.series.length > 0 && (
              <Carousel 
                title={`Séries de ${group.title}`} 
                items={group.series} 
                type="serie" 
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default Home; 