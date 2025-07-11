import { useState, useEffect, useRef, useCallback } from 'react';

interface VideoPlayerState {
    isPlaying: boolean;
    currentTime: number;
    duration: number;
    volume: number;
    isMuted: boolean;
    isFullscreen: boolean;
    buffered: number;
    playbackRate: number;
    error: Error | null;
}

interface VideoPlayerActions {
    play: () => Promise<void>;
    pause: () => void;
    togglePlay: () => void;
    seek: (time: number) => void;
    seekRelative: (offset: number) => void;
    setVolume: (volume: number) => void;
    toggleMute: () => void;
    toggleFullscreen: (containerRef: React.RefObject<HTMLDivElement>) => void;
    setPlaybackRate: (rate: number) => void;
    formatTime: (time: number) => string;
}

export type UseVideoPlayerReturn = VideoPlayerState & VideoPlayerActions;

export function useVideoPlayer(videoRef: React.RefObject<HTMLVideoElement>): UseVideoPlayerReturn {
    const [playerState, setPlayerState] = useState<VideoPlayerState>({
        isPlaying: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        isMuted: false,
        isFullscreen: false,
        buffered: 0,
        playbackRate: 1,
        error: null
    });

    const previousVolume = useRef(playerState.volume);

    const play = useCallback(async () => {
        if (!videoRef.current) return;
        try {
            await videoRef.current.play();
            setPlayerState(prev => ({ ...prev, isPlaying: true }));
        } catch (err) {
            setPlayerState(prev => ({ 
                ...prev, 
                error: err instanceof Error ? err : new Error('Erro desconhecido ao reproduzir vídeo') 
            }));
        }
    }, [videoRef]);

    const pause = useCallback(() => {
        if (!videoRef.current) return;
        videoRef.current.pause();
        setPlayerState(prev => ({ ...prev, isPlaying: false }));
    }, [videoRef]);

    const togglePlay = useCallback(() => {
        if (playerState.isPlaying) {
            pause();
        } else {
            play();
        }
    }, [playerState.isPlaying, play, pause]);

    const seek = useCallback((time: number) => {
        if (!videoRef.current) return;
        videoRef.current.currentTime = Math.max(0, Math.min(time, playerState.duration));
    }, [videoRef, playerState.duration]);

    const seekRelative = useCallback((offset: number) => {
        if (!videoRef.current) return;
        const newTime = videoRef.current.currentTime + offset;
        videoRef.current.currentTime = Math.max(0, Math.min(newTime, playerState.duration));
    }, [videoRef, playerState.duration]);

    const setVolume = useCallback((volume: number) => {
        if (!videoRef.current) return;
        const newVolume = Math.max(0, Math.min(volume, 1));
        videoRef.current.volume = newVolume;
        previousVolume.current = newVolume;
        setPlayerState(prev => ({ 
            ...prev, 
            volume: newVolume,
            isMuted: newVolume === 0
        }));
    }, [videoRef]);

    const toggleMute = useCallback(() => {
        if (!videoRef.current) return;
        if (playerState.isMuted) {
            videoRef.current.volume = previousVolume.current;
            setPlayerState(prev => ({ 
                ...prev, 
                isMuted: false,
                volume: previousVolume.current
            }));
        } else {
            previousVolume.current = videoRef.current.volume;
            videoRef.current.volume = 0;
            setPlayerState(prev => ({ 
                ...prev, 
                isMuted: true,
                volume: 0
            }));
        }
    }, [videoRef, playerState.isMuted]);

    const toggleFullscreen = useCallback((containerRef: React.RefObject<HTMLDivElement>) => {
        if (!containerRef.current) return;

        const container = containerRef.current;

        if (!document.fullscreenElement) {
            container.requestFullscreen()
                .then(() => {
                    setPlayerState(prev => ({ ...prev, isFullscreen: true }));
                })
                .catch(err => {
                    // Tenta métodos específicos do navegador se o padrão falhar
                    if ((container as any).webkitRequestFullscreen) {
                        (container as any).webkitRequestFullscreen();
                    } else if ((container as any).mozRequestFullScreen) {
                        (container as any).mozRequestFullScreen();
                    } else if ((container as any).msRequestFullscreen) {
                        (container as any).msRequestFullscreen();
                    } else {
                        setPlayerState(prev => ({ 
                            ...prev, 
                            error: new Error(`Erro ao entrar em tela cheia: ${err.message}`)
                        }));
                    }
                });
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen()
                    .then(() => {
                        setPlayerState(prev => ({ ...prev, isFullscreen: false }));
                    })
                    .catch(err => {
                        setPlayerState(prev => ({ 
                            ...prev, 
                            error: new Error(`Erro ao sair da tela cheia: ${err.message}`)
                        }));
                    });
            } else if ((document as any).webkitExitFullscreen) {
                (document as any).webkitExitFullscreen();
            } else if ((document as any).mozCancelFullScreen) {
                (document as any).mozCancelFullScreen();
            } else if ((document as any).msExitFullscreen) {
                (document as any).msExitFullscreen();
            }
        }
    }, []);

    const setPlaybackRate = useCallback((rate: number) => {
        if (!videoRef.current) return;
        videoRef.current.playbackRate = rate;
        setPlayerState(prev => ({ ...prev, playbackRate: rate }));
    }, [videoRef]);

    const formatTime = useCallback((time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setPlayerState(prev => ({ ...prev, currentTime: video.currentTime }));
        };

        const handleDurationChange = () => {
            setPlayerState(prev => ({ ...prev, duration: video.duration }));
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                const buffered = video.buffered.end(video.buffered.length - 1);
                setPlayerState(prev => ({ ...prev, buffered }));
            }
        };

        const handleError = () => {
            setPlayerState(prev => ({ 
                ...prev, 
                error: new Error('Erro ao reproduzir vídeo'),
                isPlaying: false
            }));
        };

        const handleEnded = () => {
            setPlayerState(prev => ({ ...prev, isPlaying: false }));
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('durationchange', handleDurationChange);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('error', handleError);
        video.addEventListener('ended', handleEnded);

        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('durationchange', handleDurationChange);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('error', handleError);
            video.removeEventListener('ended', handleEnded);
        };
    }, [videoRef]);

    return {
        ...playerState,
        play,
        pause,
        togglePlay,
        seek,
        seekRelative,
        setVolume,
        toggleMute,
        toggleFullscreen,
        setPlaybackRate,
        formatTime
    };
} 