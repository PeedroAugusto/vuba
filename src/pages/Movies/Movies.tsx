import React, { useCallback } from 'react';
import styles from './Movies.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { useMedia } from '../../hooks/useMedia';
import { Featured } from '../../components/Featured/Featured';
import { useNavigate } from 'react-router-dom';
import { useGenreGroups } from '../../hooks/useGenreGroups';
import { Loading } from '../../components/Loading/Loading';

const Movies: React.FC = () => {
  const { movies, featuredMovie, loading, series } = useMedia();
  const navigate = useNavigate();
  // Memoize os grupos de gênero
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

  // Separa os filmes mais bem avaliados
  const topMovies = movies.slice(0, 10);

  return (
    <div className={styles.movies}>
      <Navbar />

      <Featured
        media={featuredMovie}
        onPlay={handlePlay}
        onMoreInfo={handleMoreInfo}
      />

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