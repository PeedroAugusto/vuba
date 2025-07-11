import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import styles from './Media.module.scss';
import { Navbar } from '../../components/Navbar/Navbar';
import { Grid } from '../../components/List/Grid/Grid';
import { MediaHero } from './components/MediaHero';
import { EpisodeList } from './components/EpisodeList';
import { Loading } from '../../components/Loading/Loading';
import { NotFound } from './components/NotFound/NotFound';
import { useMedia } from '../../hooks/useMedia';    
import { useSimilarMedia } from '../../hooks/useSimilarMedia';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';

interface MediaParams {
  id: string;
  type: 'movie' | 'serie';
}

// Type guard para verificar se é uma série
const isSerie = (media: Movie | Serie): media is Serie => {
  return 'episodes' in media;
};

const Media = () => {
  const { id, type } = useParams<keyof MediaParams>() as MediaParams;
  const navigate = useNavigate();
  const { movies, series, getMediaById } = useMedia();
  const [media, setMedia] = useState<Movie | Serie | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedSeason, setSelectedSeason] = useState(1);

  // Handlers
  const handleWatchClick = useCallback(() => {
    if (!media) return;

    if (type === 'movie') {
      navigate(`/player/${id}/movie`);
    } else if (isSerie(media) && media.episodes.length > 0) {
      const firstEpisode = media.episodes[0];
      navigate(`/player/${id}/serie/${firstEpisode.id}`);
    }
  }, [media, type, id, navigate]);

  const handleAddToList = useCallback(() => {
    // Implementar lógica de adicionar à lista
    console.log('Adicionar à lista:', media?.title);
  }, [media]);

  // Formatadores
  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  }, []);

  const formatDuration = useCallback((minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
  }, []);

  // Busca mídia similar usando o hook personalizado
  const similarMedia = useSimilarMedia({
    currentMedia: media || {
      id: 0,
      title: '',
      synopsis: '',
      thumbnail: '',
      background: '',
      ageGroup: '',
      rating: 0,
      duration: 0,
      releaseYear: 0,
      genres: [],
      videoUrl: '',
      genre: '',
      type: 'movie'
    } as Movie,
    allMedia: type === 'movie' ? movies : series,
    type,
    limit: 10
  });

  // Busca dados da mídia
  const fetchData = useCallback(async () => {
    if (!id || !type) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Converte o ID para número e valida
      const mediaId = parseInt(id);
      if (isNaN(mediaId)) {
        throw new Error('ID inválido');
      }

      const mediaData = await getMediaById(mediaId, type);
      if (!mediaData) {
        throw new Error('Mídia não encontrada');
      }

      setMedia(mediaData);
    } catch (error: any) {
      console.error('Erro ao carregar mídia:', error);
      setError(error.message || 'Erro ao carregar mídia');
      setMedia(null);
    } finally {
      setLoading(false);
    }
  }, [id, type, getMediaById]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return <Loading />;
  }

  if (error || !media) {
    return <NotFound />;
  }

  return (
    <div className={styles.mediaPage}>
      <Navbar />
      
      <MediaHero 
        media={media}
        onBack={() => navigate('/')}
        onWatch={handleWatchClick}
        onAddToList={handleAddToList}
        formatDate={formatDate}
      />

      {isSerie(media) && (
        <EpisodeList 
          serie={media}
          selectedSeason={selectedSeason}
          setSelectedSeason={setSelectedSeason}
          formatDate={formatDate}
          formatDuration={formatDuration}
        />
      )}

      {similarMedia.length > 0 && (
        <div className={styles.similar}>
          <Grid 
            title={`${type === 'movie' ? 'Filmes' : 'Séries'} Similares`}
            items={similarMedia as (Movie[] | Serie[])}
            type={type}
          />
        </div>
      )}
    </div>
  );
};

export default Media; 