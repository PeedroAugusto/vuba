export interface Episode {
    id: number;
    title: string;
    synopsis: string;
    duration: number;
    episodeNumber: number;
    seasonNumber: number;
    releaseDate: string;
    thumbnail: string;
    videoUrl: string;
}

export interface Serie {
    id: number;
    title: string;
    synopsis: string;
    releaseYear: number;
    ageGroup: string;
    rating: number;
    duration: number;
    genres: string[];
    thumbnail: string;
    background: string;
    featured?: boolean;
    episodes: Episode[];
    numberOfSeasons: number;
    status: 'Em andamento' | 'Finalizada' | 'Cancelada';
    nextEpisodeDate?: string;
}