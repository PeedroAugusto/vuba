export interface Movie {
    id: number;
    title: string;
    synopsis: string;
    duration: number;
    videoUrl: string;
    thumbnail: string;
    background: string;
    genres: string[];
    genre: string;
    rating: number;
    releaseYear: number;
    ageGroup: string;
    featured?: boolean;
    
}
