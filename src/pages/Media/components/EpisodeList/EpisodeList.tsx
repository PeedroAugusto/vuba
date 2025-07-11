import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Serie } from '../../../../types/Serie';
import styles from './EpisodeList.module.scss';

interface EpisodeListProps {
  serie: Serie;
  selectedSeason: number;
  setSelectedSeason: (season: number) => void;
  formatDate: (date: string) => string;
  formatDuration: (minutes: number) => string;
}

interface SeasonDropdownProps {
  selectedSeason: number;
  availableSeasons: number[];
  onSeasonSelect: (season: number) => void;
}

const SeasonDropdown: React.FC<SeasonDropdownProps> = ({ 
  selectedSeason, 
  availableSeasons, 
  onSeasonSelect 
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={styles.seasonDropdown}>
      <button 
        className={styles.dropdownToggle}
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        Temporada {selectedSeason}
        <i className={`bx bx-chevron-down ${isOpen ? styles.open : ''}`} aria-hidden="true"></i>
      </button>
      {isOpen && (
        <div 
          className={styles.dropdownMenu} 
          role="listbox"
          aria-label="Selecione uma temporada"
        >
          {availableSeasons.map((season) => (
            <button
              key={season}
              className={selectedSeason === season ? styles.active : ''}
              onClick={() => {
                onSeasonSelect(season);
                setIsOpen(false);
              }}
              role="option"
              aria-selected={selectedSeason === season}
            >
              Temporada {season}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

const EpisodeCard: React.FC<{
  episode: Serie['episodes'][0];
  formatDate: (date: string) => string;
  formatDuration: (minutes: number) => string;
  mediaId: number;
}> = ({ episode, formatDate, formatDuration, mediaId }) => {
  const navigate = useNavigate();

  const handlePlayClick = () => {
    navigate(`/player/${mediaId}/serie/${episode.id}`);
  };

  return (
    <div className={styles.episodeCard} onClick={handlePlayClick}>
      <div className={styles.episodeThumb}>
        <img src={episode.thumbnail} alt={`Thumbnail do episódio ${episode.title}`} />
        <span className={styles.episodeNumber}>
          Episódio {episode.episodeNumber}
        </span>
        <button 
          className={styles.playButton}
          aria-label={`Assistir ${episode.title}`}
          onClick={(e) => {
            e.stopPropagation();
            handlePlayClick();
          }}
        >
          <i className='bx bx-play' aria-hidden="true"></i>
        </button>
      </div>
      <div className={styles.episodeInfo}>
        <div className={styles.episodeHeader}>
          <h3>{episode.title}</h3>
        </div>
        <div className={styles.episodeMeta}>
          <span>
            <i className='bx bx-time' aria-hidden="true"></i>
            {formatDuration(episode.duration)}
          </span>
          <span>
            <i className='bx bx-calendar' aria-hidden="true"></i>
            {formatDate(episode.releaseDate)}
          </span>
        </div>
        <p className={styles.episodeSynopsis}>{episode.synopsis}</p>
      </div>
    </div>
  );
};

export const EpisodeList: React.FC<EpisodeListProps> = ({
  serie,
  selectedSeason,
  setSelectedSeason,
  formatDate,
  formatDuration
}) => {
  const [showAllEpisodes, setShowAllEpisodes] = useState(false);

  const availableSeasons = Array.from(
    { length: serie.numberOfSeasons }, 
    (_, i) => i + 1
  );

  const filteredEpisodes = serie.episodes.filter(
    episode => episode.seasonNumber === selectedSeason
  );

  const displayedEpisodes = showAllEpisodes 
    ? filteredEpisodes 
    : filteredEpisodes.slice(0, 3);

  return (
    <div className={styles.episodes}>
      <div className={styles.episodesHeader}>
        <h2>Episódios</h2>
        <SeasonDropdown 
          selectedSeason={selectedSeason}
          availableSeasons={availableSeasons}
          onSeasonSelect={(season) => setSelectedSeason(season)}
        />
      </div>
      <div className={styles.episodeList}>
        {displayedEpisodes.map((episode) => (
          <EpisodeCard 
            key={episode.id}
            episode={episode}
            formatDate={formatDate}
            formatDuration={formatDuration}
            mediaId={serie.id}
          />
        ))}
      </div>
      {filteredEpisodes.length > 3 && (
        <button 
          className={styles.expandButton}
          onClick={() => setShowAllEpisodes(!showAllEpisodes)}
          aria-expanded={showAllEpisodes}
        >
          <span>
            {showAllEpisodes ? 'Ver menos' : 'Ver mais'}
            <i 
              className={`bx bx-chevron-${showAllEpisodes ? 'up' : 'down'}`}
              aria-hidden="true"
            ></i>
          </span>
        </button>
      )}
    </div>
  );
}; 