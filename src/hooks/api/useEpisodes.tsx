import { useState, useCallback, useEffect } from 'react';
import { Episode } from '../../types/Episode';
import { Serie } from '../../types/Serie';

interface UseEpisodesOptions {
    serie?: Serie;
    currentEpisode?: Episode;
    onEpisodeChange?: (episode: Episode) => void;
}

interface UseEpisodesReturn {
    nextEpisode: Episode | null;
    currentEpisode: Episode | null;
    episodes: Episode[];
    handleEpisodeSelect: (episode: Episode) => void;
    handleNextEpisode: () => void;
    isLastEpisode: boolean;
}

export function useEpisodes(options: UseEpisodesOptions): UseEpisodesReturn {
    const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);
    const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);

    // Atualiza o episódio atual quando mudar nas props
    useEffect(() => {
        if (options.currentEpisode) {
            setCurrentEpisode(options.currentEpisode);
        }
    }, [options.currentEpisode]);

    // Encontra o próximo episódio
    const findNextEpisode = useCallback((episode: Episode | null = null) => {
        if (!options.serie?.episodes || !episode) return null;
        
        const currentIndex = options.serie.episodes.findIndex(
            ep => ep.seasonNumber === episode.seasonNumber && 
                  ep.episodeNumber === episode.episodeNumber
        );
        
        if (currentIndex === -1 || currentIndex === options.serie.episodes.length - 1) return null;
        return options.serie.episodes[currentIndex + 1];
    }, [options.serie]);

    // Atualiza o próximo episódio quando o episódio atual mudar
    useEffect(() => {
        if (currentEpisode) {
            const next = findNextEpisode(currentEpisode);
            setNextEpisode(next);
        }
    }, [currentEpisode, findNextEpisode]);

    // Handler para seleção de episódio
    const handleEpisodeSelect = useCallback((episode: Episode) => {
        setCurrentEpisode(episode);
        options.onEpisodeChange?.(episode);
    }, [options.onEpisodeChange]);

    // Handler para reproduzir o próximo episódio
    const handleNextEpisode = useCallback(() => {
        if (nextEpisode) {
            handleEpisodeSelect(nextEpisode);
        }
    }, [nextEpisode, handleEpisodeSelect]);

    // Verifica se é o último episódio
    const isLastEpisode = useCallback((episode: Episode | null = currentEpisode) => {
        if (!options.serie?.episodes || !episode) return true;
        
        const currentIndex = options.serie.episodes.findIndex(
            ep => ep.seasonNumber === episode.seasonNumber && 
                  ep.episodeNumber === episode.episodeNumber
        );
        
        return currentIndex === options.serie.episodes.length - 1;
    }, [options.serie, currentEpisode]);

    return {
        nextEpisode,
        currentEpisode: options.currentEpisode || currentEpisode,
        episodes: options.serie?.episodes || [],
        handleEpisodeSelect,
        handleNextEpisode,
        isLastEpisode: isLastEpisode()
    };
} 