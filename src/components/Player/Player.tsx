import React, { useRef, useEffect } from 'react';
import styles from './Player.module.scss';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { Episode } from '../../types/Episode';
import { NextSuggestion } from './NextSuggestion';
import { NextEpisodePreview } from './NextEpisodePreview';
import { LogoIntro } from './LogoIntro';
import { useVideoPlayer } from '../../hooks/ui/useVideoPlayer';
import { usePlayerUI } from '../../hooks/ui/usePlayerUI';
import { useEpisodes } from '../../hooks/api/useEpisodes';
import 'boxicons/css/boxicons.min.css';

interface PlayerProps {
    media: Movie | Serie;
    currentEpisode?: Episode;
    onEpisodeChange?: (episode: Episode) => void;
    onClose: () => void;
    nextSuggestion?: Movie | Serie;
    onPlayNextSuggestion?: () => void;
}

export const Player: React.FC<PlayerProps> = ({ 
    media, 
    currentEpisode: initialEpisode, 
    onEpisodeChange, 
    onClose,
    nextSuggestion,
    onPlayNextSuggestion
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);

    // Hook de controle do vídeo
    const {
        isPlaying,
        currentTime,
        duration,
        volume,
        isMuted,
        isFullscreen,
        buffered,
        error,
        togglePlay,
        seek,
        setVolume,
        toggleMute,
        toggleFullscreen,
        formatTime,
        seekRelative
    } = useVideoPlayer(videoRef);

    // Hook de controle da UI
    const {
        showControls,
        showEpisodeList,
        showNextSuggestion: showNextSuggestionUI,
        showIntro,
        showNextEpisodePreview,
        handleMouseMove,
        handleIntroComplete,
        toggleEpisodeList,
        setUIState
    } = usePlayerUI({ isPlaying });

    // Hook de controle dos episódios
    const {
        nextEpisode,
        currentEpisode,
        episodes,
        handleEpisodeSelect,
        handleNextEpisode,
    } = useEpisodes({
        serie: 'episodes' in media ? media : undefined,
        currentEpisode: initialEpisode,
        onEpisodeChange
    });

    // Monitora o progresso do vídeo para exibir preview do próximo episódio
    useEffect(() => {
        const timeRemaining = duration - currentTime;
        
        if (timeRemaining <= 15 && timeRemaining > 0) {
            if (nextEpisode && !showNextEpisodePreview) {
                setUIState({ showNextEpisodePreview: true });
            }
        } else if (timeRemaining <= 0) {
            if (nextSuggestion) {
                setUIState({ 
                    showNextEpisodePreview: false,
                    showNextSuggestion: true 
                });
            }
        } else {
            setUIState({
                showNextEpisodePreview: false,
                showNextSuggestion: false
            });
        }
    }, [currentTime, duration, nextEpisode, nextSuggestion, setUIState, showNextEpisodePreview]);

    // Handler para cliques na barra de progresso
    const handleProgressBarClick = React.useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = progressBarRef.current;
        if (!progressBar) return;

        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * duration;
        
        seek(newTime);
    }, [duration, seek]);

    if (error) {
        return (
            <div className={styles.error}>
                <h2>Erro ao reproduzir vídeo</h2>
                <p>{error.message}</p>
                <button onClick={onClose}>Fechar</button>
            </div>
        );
    }

    return (
        <div 
            className={styles.playerContainer} 
            onMouseMove={handleMouseMove}
            data-showing-controls={showControls}
            data-testid="player-container"
        >
            {showIntro && (
                <LogoIntro onComplete={handleIntroComplete} />
            )}
            
            <video
                ref={videoRef}
                className={styles.videoPlayer}
                src={currentEpisode?.videoUrl || (media as Movie).videoUrl}
                data-testid="video-player"
                autoPlay={true}
            />

            <button className={styles.backButton} onClick={onClose}>
                <i className='bx bx-arrow-back'></i>
            </button>

            {/* Controles do player */}
            <div className={`${styles.controls} ${showControls ? styles.visible : ''}`}>
                <div className={styles.progressContainer}>
                    <span className={styles.timeDisplay} data-testid="time-display">
                        {formatTime(currentTime)}
                    </span>
                    
                    {/* Barra de progresso */}
                    <div 
                        ref={progressBarRef}
                        className={styles.progressBar}
                        onClick={handleProgressBarClick}
                        data-testid="progress-bar"
                    >
                        <div 
                            className={styles.buffered}
                            style={{ width: `${(buffered / duration) * 100}%` }}
                        />
                        <div 
                            className={styles.progress}
                            style={{ width: `${(currentTime / duration) * 100}%` }}
                        />
                    </div>

                    <span className={styles.timeDisplay} data-testid="duration-display">
                        {formatTime(duration)}
                    </span>
                </div>

                <div className={styles.controlsRow}>
                    {/* Botões de controle */}
                    <div className={styles.leftControls}>
                        <button onClick={togglePlay} data-testid="play-button">
                            <i className={`bx ${isPlaying ? 'bx-pause' : 'bx-play'}`}></i>
                        </button>
                        <button onClick={() => seekRelative(-10)} data-testid="rewind-button">
                            <i className='bx bx-rewind'></i>
                        </button>
                        <button onClick={() => seekRelative(10)} data-testid="forward-button">
                            <i className='bx bx-fast-forward'></i>
                        </button>
                        <button onClick={toggleMute} data-testid="mute-button">
                            <i className={`bx ${isMuted ? 'bx-volume-mute' : 'bx-volume-full'}`}></i>
                        </button>
                        <div className={styles.volumeControl}>
                            <input
                                type="range"
                                min="0"
                                max="1"
                                step="0.1"
                                value={volume}
                                onChange={(e) => setVolume(Number(e.target.value))}
                                data-testid="volume-slider"
                            />
                        </div>
                    </div>

                    <div className={styles.centerControls}>
                        <div className={styles.mediaTitle}>
                            <span className={styles.seriesInfo}>
                                {initialEpisode && `T${initialEpisode.seasonNumber} E${initialEpisode.episodeNumber} •`} {media.title}
                            </span>
                            <h2>{initialEpisode?.title || media.title}</h2>
                        </div>
                    </div>

                    <div className={styles.rightControls}>
                        {episodes.length > 0 && (
                            <button onClick={toggleEpisodeList} data-testid="episodes-button">
                                <i className='bx bx-list-ul'></i>
                            </button>
                        )}
                        <button onClick={toggleFullscreen} data-testid="fullscreen-button">
                            <i className={`bx ${isFullscreen ? 'bx-exit-fullscreen' : 'bx-fullscreen'}`}></i>
                        </button>
                    </div>
                </div>
            </div>

            {/* Lista de episódios */}
            {showEpisodeList && episodes.length > 0 && (
                <div className={`${styles.episodeList} ${styles.visible}`} data-testid="episode-list">
                    <div className={styles.episodeListHeader}>
                        <h3>Episódios</h3>
                        <button onClick={toggleEpisodeList}>
                            <i className='bx bx-x'></i>
                        </button>
                    </div>
                    {episodes.map((episode) => (
                        <div 
                            key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                            className={`${styles.episodeItem} ${currentEpisode?.id === episode.id ? styles.active : ''}`}
                            onClick={() => handleEpisodeSelect(episode)}
                            data-testid={`episode-item-${episode.id}`}
                        >
                            <div className={styles.episodeNumber}>
                                <span>T{episode.seasonNumber} E{episode.episodeNumber}</span>
                            </div>
                            <div className={styles.episodeInfo}>
                                <h4>{episode.title}</h4>
                                <p>{episode.synopsis}</p>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Preview do próximo episódio */}
            {showNextEpisodePreview && nextEpisode && (
                <NextEpisodePreview 
                    episode={nextEpisode}
                    onPlay={handleNextEpisode}
                    currentTime={currentTime}
                    duration={duration}
                />
            )}

            {/* Sugestão do próximo conteúdo */}
            {showNextSuggestionUI && nextSuggestion && onPlayNextSuggestion && (
                <NextSuggestion
                    media={nextSuggestion}
                    onPlay={onPlayNextSuggestion}
                    currentMedia={media}
                    currentEpisode={currentEpisode || undefined}
                />
            )}
        </div>
    );
};