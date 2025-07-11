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
    handleInteraction: () => void;
    handleIntroComplete: () => void;
    toggleEpisodeList: () => void;
    setUIState: (state: Partial<PlayerUIState>) => void;
    isUserInteracting: boolean;
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
    const [isUserInteracting, setIsUserInteracting] = useState(false);
    const isMobileRef = useRef<boolean>(false);

    // Detecta se é um dispositivo móvel
    useEffect(() => {
        isMobileRef.current = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    }, []);

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
    const handleInteraction = useCallback(() => {
        // Limpa qualquer timer existente
        if (controlsTimeoutRef.current) {
            window.clearTimeout(controlsTimeoutRef.current);
            controlsTimeoutRef.current = undefined;
        }

        setIsUserInteracting(true);
        updateUIState({ showControls: true });

        // Só esconde os controles se o vídeo estiver em reprodução e não estiver mostrando a lista de episódios
        if (opts.isPlaying && !uiState.showEpisodeList) {
            const timeout = isMobileRef.current ? 3000 : opts.controlsTimeout; // Tempo maior para mobile
            controlsTimeoutRef.current = window.setTimeout(() => {
                if (opts.isPlaying && !uiState.showEpisodeList) {
                    updateUIState({ showControls: false });
                    setIsUserInteracting(false);
                }
            }, timeout);
        }
    }, [opts.isPlaying, opts.controlsTimeout, updateUIState, uiState.showEpisodeList]);

    // Reseta o timer quando o estado de reprodução muda
    useEffect(() => {
        if (!opts.isPlaying) {
            // Se o vídeo está pausado, mostra os controles
            updateUIState({ showControls: true });
            setIsUserInteracting(true);
            if (controlsTimeoutRef.current) {
                window.clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = undefined;
            }
        } else if (!uiState.showEpisodeList) {
            // Se o vídeo começou a reproduzir e a lista de episódios não está aberta
            handleInteraction();
        }
    }, [opts.isPlaying, handleInteraction, updateUIState, uiState.showEpisodeList]);

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
                window.clearTimeout(controlsTimeoutRef.current);
                controlsTimeoutRef.current = undefined;
            }
            if (mediaInfoTimeoutRef.current) {
                window.clearTimeout(mediaInfoTimeoutRef.current);
                mediaInfoTimeoutRef.current = undefined;
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
        // Reseta o timer de esconder controles quando a lista de episódios é aberta
        if (!uiState.showEpisodeList) {
            setIsUserInteracting(true);
            if (controlsTimeoutRef.current) {
                clearTimeout(controlsTimeoutRef.current);
            }
        }
    }, [uiState.showEpisodeList, updateUIState]);

    return {
        ...uiState,
        handleInteraction,
        handleIntroComplete,
        toggleEpisodeList,
        setUIState: updateUIState,
        isUserInteracting
    };
} 