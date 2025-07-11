import { useState, useRef, useCallback, useEffect } from 'react';

interface PlayerUIState {
    showControls: boolean;
    showEpisodeList: boolean;
    showCenterButton: boolean;
    showMediaInfo: boolean;
    showNextSuggestion: boolean;
    showIntro: boolean;
    showNextEpisodePreview: boolean;
}

interface UsePlayerUIOptions {
    isPlaying: boolean;
    controlsTimeout?: number;
    mediaInfoTimeout?: number;
}

interface UsePlayerUIReturn extends PlayerUIState {
    handleMouseMove: () => void;
    handleIntroComplete: () => void;
    toggleEpisodeList: () => void;
    setUIState: (state: Partial<PlayerUIState>) => void;
}

const defaultOptions: Required<UsePlayerUIOptions> = {
    isPlaying: false,
    controlsTimeout: 3000,
    mediaInfoTimeout: 6000
};

export function usePlayerUI(options: UsePlayerUIOptions): UsePlayerUIReturn {
    const opts = { ...defaultOptions, ...options };
    const controlsTimeoutRef = useRef<number>();
    const mediaInfoTimeoutRef = useRef<number>();

    const [uiState, setUiState] = useState<PlayerUIState>({
        showControls: true,
        showEpisodeList: false,
        showCenterButton: true,
        showMediaInfo: false,
        showNextSuggestion: false,
        showIntro: true,
        showNextEpisodePreview: false
    });

    // Atualiza o estado da UI
    const updateUIState = useCallback((newState: Partial<PlayerUIState>) => {
        setUiState(prev => ({ ...prev, ...newState }));
    }, []);

    // Gerencia a visibilidade dos controles
    const handleMouseMove = useCallback(() => {
        updateUIState({ showControls: true });

        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }

        if (opts.isPlaying) {
            controlsTimeoutRef.current = window.setTimeout(() => {
                updateUIState({ showControls: false });
            }, opts.controlsTimeout);
        }
    }, [opts.isPlaying, opts.controlsTimeout, updateUIState]);

    // Gerencia a visibilidade das informações da mídia
    useEffect(() => {
        if (!opts.isPlaying) {
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
            mediaInfoTimeoutRef.current = window.setTimeout(() => {
                updateUIState({ showMediaInfo: true });
            }, opts.mediaInfoTimeout);
        } else {
            updateUIState({ showMediaInfo: false });
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        }

        return () => {
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        };
    }, [opts.isPlaying, opts.mediaInfoTimeout, updateUIState]);

    // Limpa os timeouts quando o componente é desmontado
    useEffect(() => {
        return () => {
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        };
    }, []);

    // Handlers
    const handleIntroComplete = useCallback(() => {
        updateUIState({
            showIntro: false,
            showCenterButton: false,
            showMediaInfo: false
        });
    }, [updateUIState]);

    const toggleEpisodeList = useCallback(() => {
        updateUIState({ showEpisodeList: !uiState.showEpisodeList });
    }, [uiState.showEpisodeList, updateUIState]);

    return {
        ...uiState,
        handleMouseMove,
        handleIntroComplete,
        toggleEpisodeList,
        setUIState: updateUIState
    };
} 