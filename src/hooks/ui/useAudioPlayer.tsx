import { useState, useCallback, useRef, useEffect } from 'react';

interface AudioPlayerState {
  isPlaying: boolean;
  progress: number;
  volume: number;
  isMuted: boolean;
  duration: number;
  currentTime: number;
  isLoading: boolean;
  error: string | null;
}

export const useAudioPlayer = (src: string | null) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [state, setState] = useState<AudioPlayerState>({
    isPlaying: false,
    progress: 0,
    volume: 1,
    isMuted: false,
    duration: 0,
    currentTime: 0,
    isLoading: false,
    error: null,
  });

  const togglePlay = useCallback(() => {
    if (!audioRef.current) return;

    if (state.isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
  }, [state.isPlaying]);

  const handleTimeUpdate = useCallback(() => {
    if (!audioRef.current) return;

    const progress = (audioRef.current.currentTime / audioRef.current.duration) * 100;
    setState(prev => ({
      ...prev,
      progress,
      currentTime: audioRef.current?.currentTime || 0,
    }));
  }, []);

  const seek = useCallback((value: number) => {
    if (!audioRef.current) return;

    const time = (value / 100) * audioRef.current.duration;
    audioRef.current.currentTime = time;
    setState(prev => ({
      ...prev,
      progress: value,
      currentTime: time,
    }));
  }, []);

  const handleVolume = useCallback((volume: number) => {
    if (!audioRef.current) return;

    audioRef.current.volume = volume;
    setState(prev => ({
      ...prev,
      volume,
      isMuted: volume === 0,
    }));
  }, []);

  const toggleMute = useCallback(() => {
    if (!audioRef.current) return;

    const newMutedState = !state.isMuted;
    audioRef.current.muted = newMutedState;
    setState(prev => ({
      ...prev,
      isMuted: newMutedState,
      volume: newMutedState ? 0 : prev.volume || 1,
    }));
  }, [state.isMuted]);

  useEffect(() => {
    if (!src) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));
      return;
    }

    const audio = new Audio(src);
    audioRef.current = audio;

    setState(prev => ({ ...prev, isLoading: true }));

    const handleLoadedMetadata = () => {
      setState(prev => ({
        ...prev,
        duration: audio.duration,
        isLoading: false,
      }));
    };

    const handlePlay = () => {
      setState(prev => ({ ...prev, isPlaying: true }));
    };

    const handlePause = () => {
      setState(prev => ({ ...prev, isPlaying: false }));
    };

    const handleError = () => {
      setState(prev => ({
        ...prev,
        error: 'Erro ao carregar áudio',
        isLoading: false,
      }));
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('error', handleError);
      audio.pause();
    };
  }, [src, handleTimeUpdate]);

  return {
    audioRef,
    ...state,
    togglePlay,
    seek,
    handleVolume,
    toggleMute,
  };
}; 