import { Serie } from '../types/Serie';
import mediaData from '../data/media.json';

const isValidStatus = (status: string): status is Serie['status'] => {
  return ['Em andamento', 'Finalizada', 'Cancelada'].includes(status);
};

const validateSerie = (serie: any): Serie => {
  if (!isValidStatus(serie.status)) {
    throw new Error(`Status inválido: ${serie.status}. Deve ser "Em andamento", "Finalizada" ou "Cancelada"`);
  }

  return {
    type: 'serie',
    id: serie.id,
    title: serie.title,
    synopsis: serie.synopsis,
    thumbnail: serie.thumbnail,
    background: serie.background,
    ageGroup: serie.ageGroup,
    rating: serie.rating,
    duration: serie.duration,
    releaseYear: serie.releaseYear,
    genres: serie.genres,
    numberOfSeasons: serie.numberOfSeasons,
    status: serie.status,
    nextEpisodeDate: serie.nextEpisodeDate,
    episodes: serie.episodes.map((episode: any) => ({
      id: episode.id,
      title: episode.title,
      synopsis: episode.synopsis,
      duration: episode.duration,
      episodeNumber: episode.episodeNumber,
      seasonNumber: episode.seasonNumber,
      releaseDate: episode.releaseDate,
      thumbnail: episode.thumbnail,
      videoUrl: episode.videoUrl
    }))
  };
};

export interface SerieService {
  getSeries: (genre?: string) => Promise<Serie[]>;
  getSerie: (id: number) => Promise<Serie>;
  getFeaturedSerie: () => Promise<Serie>;
}

export const serieService: SerieService = {
  async getSeries(genre?: string): Promise<Serie[]> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    let series = mediaData.series.map(validateSerie);
    
    if (genre) {
      series = series.filter(serie => serie.genres.includes(genre));
    }
    
    return series;
  },

  async getSerie(id: number): Promise<Serie> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));

    // Procura na lista de séries
    const serie = mediaData.series.find(s => s.id === id);
    
    if (!serie) {
      throw new Error('Série não encontrada');
    }
    
    return validateSerie(serie);
  },

  async getFeaturedSerie(): Promise<Serie> {
    // Simula um delay de rede
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Retorna a primeira série como destaque
    return validateSerie(mediaData.series[0]);
  }
}; 