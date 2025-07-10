import React, { useMemo } from 'react';
import styles from './Series.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Carousel } from "../../components/List/Carousel/Carousel";
import { useMedia } from '../../hooks/useMedia';

const Series: React.FC = () => {
  const { series, featuredSerie, loading } = useMedia();

  // Memoize os grupos de gênero
  const genreGroups = useMemo(() => {
    // Coleta todos os gêneros únicos
    const allGenres = new Set<string>();
    series.forEach(serie => {
      serie.genres.forEach(genre => allGenres.add(genre));
    });

    // Cria grupos para cada gênero
    return Array.from(allGenres).map(genre => ({
      title: genre,
      series: series.filter(serie => serie.genres.includes(genre))
    }));
  }, [series]);

  if (loading || !featuredSerie) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Separa as séries mais bem avaliadas
  const topSeries = series.slice(0, 10);

  return (
    <div className={styles.series}>
      <Navbar />
      
      <div className={styles.featured} style={{ backgroundImage: `url(${featuredSerie.background})` }}>
        <div className={styles.vignette}></div>
        <div className={styles.content}>
          <h1>{featuredSerie.title}</h1>
          <div className={styles.meta}>
            <span className={styles.rating}>
              <i className='bx bxs-star'></i>
              {featuredSerie.rating}
            </span>
            <span>{featuredSerie.releaseYear}</span>
            <span>{featuredSerie.numberOfSeasons} temporadas</span>
            <span className={styles.ageRating}>{featuredSerie.ageGroup}</span>
          </div>
          <p className={styles.synopsis}>{featuredSerie.synopsis}</p>
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