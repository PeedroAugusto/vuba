import React, { useCallback } from 'react';
import styles from './Series.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { useMedia } from '../../hooks/useMedia';
import { useNavigate } from 'react-router-dom';
import { useGenreGroups } from '../../hooks/useGenreGroups';
import { Featured } from '../../components/Featured/Featured';
import { Loading } from '../../components/Loading/Loading';

const Series: React.FC = () => {
  const { series, featuredSerie, loading, movies } = useMedia();
  const navigate = useNavigate();

  // Memoize os grupos de gênero
  const genreGroups = useGenreGroups(movies, series);

  const handlePlay = useCallback(() => {
    if (featuredSerie) {
      navigate(`/player/${featuredSerie.type}/${featuredSerie.id}`);
    }
  }, [featuredSerie, navigate]);

  const handleMoreInfo = useCallback(() => {
    if (featuredSerie) {
      navigate(`/media/${featuredSerie.type}/${featuredSerie.id}`);
    }
  }, [featuredSerie, navigate]);

  if (loading || !featuredSerie) {
    return <Loading />;
  }

  // Separa as séries mais bem avaliadas
  const topSeries = series.slice(0, 10);

  return (
    <div className={styles.series}>
      <Navbar />
      
      <Featured
        media={featuredSerie}
        onPlay={handlePlay}
        onMoreInfo={handleMoreInfo}
      />

      <div className={styles.carousels}>
        <Carousel title="Séries em Alta" items={topSeries} type="serie" />
        
        {genreGroups.map(group => (
          <React.Fragment key={group.title}>
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

export default Series; 