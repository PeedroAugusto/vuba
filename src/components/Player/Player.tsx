import React, { useRef, useState, useEffect } from 'react';
import styles from './Player.module.scss';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { Episode } from '../../types/Episode';
import { NextSuggestion } from './NextSuggestion';
import { NextEpisodePreview } from './NextEpisodePreview';
import { LogoIntro } from './LogoIntro';

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
    currentEpisode, 
    onEpisodeChange, 
    onClose,
    nextSuggestion,
    onPlayNextSuggestion
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    const [showControls, setShowControls] = useState(true);
    const [showEpisodeList, setShowEpisodeList] = useState(false);
    const [showCenterButton, setShowCenterButton] = useState(true);
    const [showMediaInfo, setShowMediaInfo] = useState(false);
    const [showNextSuggestion, setShowNextSuggestion] = useState(false);
    const [isVideoEnded, setIsVideoEnded] = useState(false);
    const [showIntro, setShowIntro] = useState(true);
    const controlsTimeoutRef = useRef<number>();
    const mediaInfoTimeoutRef = useRef<number>();
    const [showNextEpisodePreview, setShowNextEpisodePreview] = useState(false);
    const [nextEpisode, setNextEpisode] = useState<Episode | null>(null);

    const [controls, setControls] = useState({
        playing: false,
        currentTime: 0,
        duration: 0,
        volume: 1,
        muted: false,
        fullscreen: false,
        buffered: 0,
    });

    // Função para encontrar o próximo episódio
    const findNextEpisode = () => {
        if (!('episodes' in media) || !currentEpisode) return null;
        
        const currentIndex = media.episodes.findIndex(
            ep => ep.seasonNumber === currentEpisode.seasonNumber && 
                  ep.episodeNumber === currentEpisode.episodeNumber
        );
        
        if (currentIndex === -1 || currentIndex === media.episodes.length - 1) return null;
        return media.episodes[currentIndex + 1];
    };

    // Efeito para atualizar o próximo episódio quando o episódio atual mudar
    useEffect(() => {
        if (currentEpisode) {
            const next = findNextEpisode();
            setNextEpisode(next);
        }
    }, [currentEpisode, media]);

    // Efeito para iniciar a reprodução automaticamente
    useEffect(() => {
        const video = videoRef.current;
        if (!video || showIntro) return;

        // Inicia a reprodução e atualiza o estado
        video.play().then(() => {
            setControls(prev => ({ ...prev, playing: true }));
            setShowCenterButton(false);
            setShowMediaInfo(false);
        }).catch(error => {
            console.error("Erro ao iniciar reprodução automática:", error);
        });
    }, [showIntro]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        const handleTimeUpdate = () => {
            setControls(prev => ({
                ...prev,
                currentTime: video.currentTime,
                duration: video.duration
            }));

            // Verificar se está próximo do fim do episódio (faltando 15 segundos)
            const timeRemaining = video.duration - video.currentTime;
            if (timeRemaining <= 15 && timeRemaining > 0) {
                if (nextEpisode && !showNextEpisodePreview) {
                    setShowNextEpisodePreview(true);
                }
            } else if (timeRemaining <= 0) {
                // Se o tempo acabou, reproduz o próximo episódio
                if (nextEpisode) {
                    onEpisodeChange?.(nextEpisode);
                    setShowNextEpisodePreview(false);
                } else if (nextSuggestion) {
                    setShowNextSuggestion(true);
                }
                setIsVideoEnded(true);
            } else {
                setShowNextEpisodePreview(false);
                setShowNextSuggestion(false);
                setIsVideoEnded(false);
            }
        };

        const handleProgress = () => {
            if (video.buffered.length > 0) {
                setControls(prev => ({
                    ...prev,
                    buffered: video.buffered.end(video.buffered.length - 1)
                }));
            }
        };

        const handlePause = () => {
            setControls(prev => ({ ...prev, playing: false }));
            setShowCenterButton(true);
            
            // Mostrar informações da mídia após 3 segundos de pausa
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
            mediaInfoTimeoutRef.current = window.setTimeout(() => {
                setShowMediaInfo(true);
            }, 6000);
        };

        const handlePlay = () => {
            setControls(prev => ({ ...prev, playing: true }));
            setShowCenterButton(false);
            
            // Esconder informações da mídia quando reproduzir
            setShowMediaInfo(false);
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        };

        const handleCanPlay = () => {
            // Esconder botão central quando o vídeo puder ser reproduzido
            if (!video.paused) {
                setShowCenterButton(false);
            }
        };

        video.addEventListener('timeupdate', handleTimeUpdate);
        video.addEventListener('progress', handleProgress);
        video.addEventListener('pause', handlePause);
        video.addEventListener('play', handlePlay);
        video.addEventListener('canplay', handleCanPlay);
        
        return () => {
            video.removeEventListener('timeupdate', handleTimeUpdate);
            video.removeEventListener('progress', handleProgress);
            video.removeEventListener('pause', handlePause);
            video.removeEventListener('play', handlePlay);
            video.removeEventListener('canplay', handleCanPlay);
            
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        };
    }, [nextSuggestion, nextEpisode, onEpisodeChange]);

    const handleProgressBarClick = (e: React.MouseEvent<HTMLDivElement>) => {
        const progressBar = progressBarRef.current;
        if (!progressBar || !videoRef.current) return;

        const rect = progressBar.getBoundingClientRect();
        const clickPosition = (e.clientX - rect.left) / rect.width;
        const newTime = clickPosition * controls.duration;
        
        videoRef.current.currentTime = newTime;
        setControls(prev => ({ ...prev, currentTime: newTime }));
    };

    const togglePlay = () => {
        const video = videoRef.current;
        if (!video) return;

        if (video.paused) {
            video.play();
            setControls(prev => ({ ...prev, playing: true }));
            setShowCenterButton(false);
            
            // Esconder informações da mídia quando reproduzir
            setShowMediaInfo(false);
            if (mediaInfoTimeoutRef.current) {
                clearTimeout(mediaInfoTimeoutRef.current);
            }
        } else {
            video.pause();
            setControls(prev => ({ ...prev, playing: false }));
            setShowCenterButton(true);
        }
    };

    const toggleMute = () => {
        const video = videoRef.current;
        if (!video) return;

        video.muted = !video.muted;
        setControls(prev => ({ ...prev, muted: video.muted }));
    };

    const adjustVolume = (value: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.volume = value;
        video.muted = value === 0;
        setControls(prev => ({ ...prev, volume: value, muted: value === 0 }));
    };

    const seekTo = (time: number) => {
        const video = videoRef.current;
        if (!video) return;

        video.currentTime = Math.max(0, Math.min(time, video.duration));
    };

    const toggleFullscreen = () => {
        const container = document.querySelector(`.${styles.playerContainer}`);
        if (!container) return;

        if (!document.fullscreenElement) {
            container.requestFullscreen();
            setControls(prev => ({ ...prev, fullscreen: true }));
        } else {
            document.exitFullscreen();
            setControls(prev => ({ ...prev, fullscreen: false }));
        }
    };

    const formatTime = (time: number) => {
        const hours = Math.floor(time / 3600);
        const minutes = Math.floor((time % 3600) / 60);
        const seconds = Math.floor(time % 60);
        
        if (hours > 0) {
            return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }
        return `${minutes}:${seconds.toString().padStart(2, '0')}`;
    };

    const handleMouseMove = () => {
        setShowControls(true);
        if (controlsTimeoutRef.current) {
            clearTimeout(controlsTimeoutRef.current);
        }
        controlsTimeoutRef.current = window.setTimeout(() => {
            if (controls.playing) {
                setShowControls(false);
            }
        }, 3000);
    };

    return (
        <div 
            className={styles.playerContainer}
            onMouseMove={handleMouseMove}
            onMouseLeave={() => setShowControls(false)}
        >
            {showIntro && (
                <LogoIntro onComplete={() => setShowIntro(false)} />
            )}
            
            <video
                ref={videoRef}
                className={styles.video}
                onClick={togglePlay}
                onDoubleClick={toggleFullscreen}
            >
                <source src={currentEpisode?.videoUrl || (media as Movie).videoUrl} type="video/mp4" />
                Seu navegador não suporta o elemento de vídeo.
            </video>

            {/* Área de clique para pause/play */}
            <div 
                className={`${styles.clickArea} ${showControls ? styles.controlsVisible : ''}`}
                onClick={togglePlay}
                onMouseDown={(e) => e.stopPropagation()}
            />

            {/* Botão central de play/pause */}
            <div className={`${styles.centerPlayButton} ${showCenterButton ? styles.visible : ''}`}>
                <button onClick={togglePlay}>
                    <i className={`bx ${controls.playing ? 'bx-pause' : 'bx-play'}`} />
                </button>
            </div>

            {/* Informações da mídia quando pausado */}
            <div className={`${styles.mediaInfoOverlay} ${showMediaInfo ? styles.visible : ''}`}>
                <div className={styles.mediaInfoContent}>
                    <div className={styles.mediaTitle}>
                        {currentEpisode ? (
                            <>
                                <h2>{media.title}</h2>
                                <h3>{currentEpisode.title}</h3>
                                <span>Temporada {currentEpisode.seasonNumber} • Episódio {currentEpisode.episodeNumber}</span>
                            </>
                        ) : (
                            <h2>{media.title}</h2>
                        )}
                    </div>
                    
                    <div className={styles.mediaDescription}>
                        <p>{currentEpisode?.synopsis || media.synopsis}</p>
                    </div>
                    
                    <div className={styles.mediaMetadata}>
                        <div className={styles.metadataItem}>
                            <span className={styles.metadataLabel}>Duração:</span>
                            <span>{formatTime(controls.duration)}</span>
                        </div>
                        
                        {(('genre' in media && media.genre) || media.genres?.[0]) && (
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Gênero:</span>
                                <span>{'genre' in media ? media.genre : media.genres[0]}</span>
                            </div>
                        )}
                        
                        {media.releaseYear && (
                            <div className={styles.metadataItem}>
                                <span className={styles.metadataLabel}>Ano:</span>
                                <span>{media.releaseYear}</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <div className={`${styles.overlay} ${showControls ? styles.visible : ''}`}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={styles.topControls}>
                    <button onClick={onClose}>
                        <i className='bx bx-arrow-back'></i>
                    </button>
                </div>

                {showEpisodeList && 'episodes' in media && (
                    <div className={`${styles.episodeList} ${showEpisodeList ? styles.visible : ''}`}>
                        <div className={styles.episodeListHeader}>
                            <h3>Episódios</h3>
                            <button onClick={() => setShowEpisodeList(false)}>
                                <i className='bx bx-x' />
                            </button>
                        </div>
                        {media.episodes.map((episode) => (
                            <div 
                                key={`${episode.seasonNumber}-${episode.episodeNumber}`}
                                className={`${styles.episodeItem} ${currentEpisode?.episodeNumber === episode.episodeNumber && currentEpisode?.seasonNumber === episode.seasonNumber ? styles.active : ''}`}
                                onClick={() => {
                                    onEpisodeChange?.(episode);
                                    setShowEpisodeList(false);
                                    if (videoRef.current) {
                                        videoRef.current.currentTime = 0;
                                        videoRef.current.play();
                                    }
                                }}
                            >
                                <span className={styles.episodeNumber}>
                                    {episode.episodeNumber}
                                </span>
                                <div className={styles.episodeInfo}>
                                    <div className={styles.episodeTitle}>
                                        {episode.title}
                                    </div>
                                    <div className={styles.episodeDuration}>
                                        {Math.floor(episode.duration / 60)}min
                                    </div>
                                </div>
                                {currentEpisode?.episodeNumber === episode.episodeNumber && 
                                 currentEpisode?.seasonNumber === episode.seasonNumber && (
                                    <div className={styles.playingIndicator}>
                                        <i className='bx bx-play' />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                <div className={styles.progressBarContainer}
                    onClick={(e) => e.stopPropagation()}
                >
                    <div 
                        ref={progressBarRef}
                        className={styles.progressBar}
                        onClick={(e) => {
                            e.stopPropagation();
                            handleProgressBarClick(e);
                        }}
                    >
                        <div 
                            className={styles.progressFilled}
                            style={{ 
                                width: `${(controls.currentTime / controls.duration * 100) || 0}%`,
                                transform: `translateX(0)` 
                            }}
                        />
                    </div>
                    <span className={styles.time}>
                        {formatTime(controls.currentTime)} / {formatTime(controls.duration)}
                    </span>
                </div>

                <div className={styles.bottomControls}>
                    <div className={styles.leftControls}>
                        <button onClick={togglePlay}>
                            <i className={`bx ${controls.playing ? 'bx-pause' : 'bx-play'}`} />
                        </button>

                        <div className={styles.skipControls}>
                            <button onClick={() => seekTo(controls.currentTime - 10)} className={styles.skipButton}>
                                <i className='bx bx-rewind'></i>
                                <span>10</span>
                            </button>
                            <button onClick={() => seekTo(controls.currentTime + 10)} className={styles.skipButton}>
                                <span>10</span>
                                <i className='bx bx-fast-forward'></i>
                            </button>
                        </div>

                        <div className={styles.volumeControl}>
                            <button onClick={toggleMute}>
                                <i className={`bx ${
                                    controls.muted ? 'bx-volume-mute' : 
                                    controls.volume > 0.7 ? 'bx-volume-full' :
                                    controls.volume > 0.3 ? 'bx-volume-low' :
                                    controls.volume > 0 ? 'bx-volume' : 'bx-volume-mute'
                                }`} />
                            </button>
                            <div className={styles.volumeSlider}>
                                <input
                                    type="range"
                                    min="0"
                                    max="1"
                                    step="0.1"
                                    value={controls.volume}
                                    onChange={(e) => adjustVolume(parseFloat(e.target.value))}
                                />
                            </div>
                        </div>
                    </div>

                    <div className={styles.centerControls}>
                        <div className={styles.mediaInfo}>
                            {currentEpisode ? (
                                <>
                                    {media.title}
                                    <span>•</span>
                                    {currentEpisode.title}
                                    <span>•</span>
                                    <span>T{currentEpisode.seasonNumber} E{currentEpisode.episodeNumber}</span>
                                </>
                            ) : (
                                media.title
                            )}
                        </div>
                    </div>

                    <div className={styles.rightControls}>
                        {'episodes' in media && (
                            <button onClick={() => setShowEpisodeList(!showEpisodeList)}>
                                <i className='bx bx-list-ul' />
                            </button>
                        )}

                        <button onClick={toggleFullscreen}>
                            <i className={`bx ${controls.fullscreen ? 'bx-exit-fullscreen' : 'bx-fullscreen'}`} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Sugestão do próximo filme/série */}
            {showNextSuggestion && nextSuggestion && (
                <NextSuggestion
                    currentMedia={media}
                    suggestion={nextSuggestion}
                    onPlaySuggestion={() => {
                        setShowNextSuggestion(false);
                        onPlayNextSuggestion?.();
                    }}
                    onClose={() => setShowNextSuggestion(false)}
                />
            )}

            {/* Prévia do próximo episódio */}
            {showNextEpisodePreview && nextEpisode && 'episodes' in media && (
                <NextEpisodePreview
                    serie={media}
                    nextEpisode={nextEpisode}
                    onPlayNextEpisode={() => {
                        setShowNextEpisodePreview(false);
                        onEpisodeChange?.(nextEpisode);
                    }}
                    timeRemaining={videoRef.current ? videoRef.current.duration - videoRef.current.currentTime : 0}
                />
            )}
        </div>
    );
};