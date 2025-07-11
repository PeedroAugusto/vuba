import { useMemo } from 'react';
import { Movie } from '../types/Movie';
import { Serie } from '../types/Serie';

interface UseSimilarMediaProps {
  currentMedia: Movie | Serie;
  allMedia: (Movie | Serie)[];
  type: 'movie' | 'serie';
  limit?: number;
}

export const useSimilarMedia = ({
  currentMedia,
  allMedia,
  type,
  limit = 10
}: UseSimilarMediaProps) => {
  return useMemo(() => {
    if (!currentMedia || !allMedia?.length) {
      return [];
    }

    // Filtra mídia do mesmo tipo
    const sameTypeMedia = allMedia.filter(
      media => 'episodes' in media === (type === 'serie')
    );

    // Encontra mídia com gêneros similares
    return sameTypeMedia
      .filter(media => 
        media.id !== currentMedia.id && 
        media.genres?.some(genre => currentMedia.genres?.includes(genre))
      )
      .slice(0, limit);
  }, [currentMedia, allMedia, type, limit]);
}; 