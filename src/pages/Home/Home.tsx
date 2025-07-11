import React, { useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Home.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { Featured } from '../../components/Featured/Featured';
import { Loading } from '../../components/Loading/Loading';
import { useMedia } from '../../hooks/useMedia';
import { useGenreGroups } from '../../hooks/useGenreGroups';

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { movies, featuredMovie, loading, series } = useMedia();
  const genreGroups = useGenreGroups(movies, series);

  const handlePlay = useCallback(() => {
    if (featuredMovie) {
      navigate(`/player/${featuredMovie.type}/${featuredMovie.id}`);
    }
  }, [featuredMovie, navigate]);

  const handleMoreInfo = useCallback(() => {
    if (featuredMovie) {
      navigate(`/media/${featuredMovie.type}/${featuredMovie.id}`);
    }
  }, [featuredMovie, navigate]);

  if (loading || !featuredMovie) {
    return <Loading />;
  }

  // Separa séries e filmes para carrosséis específicos
  const topMovies = movies.slice(0, 10);
  const topSeries = series.slice(0, 10);

  return (
    <div className={styles.home}>
      <Navbar />
      
      <Featured 
        media={featuredMovie}
        onPlay={handlePlay}
        onMoreInfo={handleMoreInfo}
      />

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