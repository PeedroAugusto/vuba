import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import { Player } from './Player';
import { Movie } from '../../types/Movie';
import { Serie } from '../../types/Serie';
import { Episode } from '../../types/Episode';
import { BrowserRouter } from 'react-router-dom';

// Mock dos hooks personalizados
jest.mock('../../hooks/ui/useVideoPlayer', () => ({
    useVideoPlayer: jest.fn(() => ({
        isPlaying: false,
        currentTime: 0,
        duration: 100,
        volume: 1,
        isMuted: false,
        isFullscreen: false,
        buffered: 0,
        error: null,
        play: jest.fn(),
        pause: jest.fn(),
        togglePlay: jest.fn(),
        seek: jest.fn(),
        setVolume: jest.fn(),
        toggleMute: jest.fn(),
        toggleFullscreen: jest.fn(),
        formatTime: (time: number) => `${Math.floor(time / 60)}:${Math.floor(time % 60).toString().padStart(2, '0')}`
    }))
}));

jest.mock('../../hooks/ui/usePlayerUI', () => ({
    usePlayerUI: jest.fn(() => ({
        showControls: true,
        showEpisodeList: false,
        showMediaInfo: true,
        showNextSuggestion: false,
        showIntro: false,
        showNextEpisodePreview: false,
        handleMouseMove: jest.fn(),
        handleIntroComplete: jest.fn(),
        toggleEpisodeList: jest.fn(),
        setUIState: jest.fn()
    }))
}));

jest.mock('../../hooks/api/useEpisodes', () => ({
    useEpisodes: jest.fn(() => ({
        nextEpisode: null,
        currentEpisode: null,
        episodes: [],
        handleEpisodeSelect: jest.fn(),
        handleNextEpisode: jest.fn()
    }))
}));

// Mock dos componentes filhos
jest.mock('./LogoIntro', () => ({
    LogoIntro: () => <div data-testid="logo-intro">Logo Intro</div>
}));

jest.mock('./NextEpisodePreview', () => ({
    NextEpisodePreview: () => <div data-testid="next-episode-preview">Next Episode Preview</div>
}));

jest.mock('./NextSuggestion', () => ({
    NextSuggestion: () => <div data-testid="next-suggestion">Next Suggestion</div>
}));

const mockMovie: Movie = {
    type: 'movie',
    id: 1,
    title: 'Test Movie',
    synopsis: 'Test Synopsis',
    thumbnail: 'test.jpg',
    background: 'background.jpg',
    videoUrl: 'test.mp4',
    releaseYear: 2023,
    genre: 'Action',
    genres: ['Action', 'Adventure'],
    duration: 120,
    rating: 4.5,
    ageGroup: '14+'
};

const mockEpisode: Episode = {
    id: 1,
    title: 'Episode 1',
    synopsis: 'Episode 1 Synopsis',
    thumbnail: 'episode1.jpg',
    videoUrl: 'episode1.mp4',
    seasonNumber: 1,
    episodeNumber: 1,
    duration: 45,
    releaseDate: '2023-01-01'
};

const mockSerie: Serie = {
    type: 'serie',
    id: 1,
    title: 'Test Serie',
    synopsis: 'Test Synopsis',
    thumbnail: 'test.jpg',
    background: 'background.jpg',
    releaseYear: 2023,
    genres: ['Action'],
    episodes: [mockEpisode],
    ageGroup: '14+',
    rating: 4.5,
    duration: 45,
    numberOfSeasons: 1,
    status: 'Em andamento'
};

const defaultProps = {
    media: mockMovie,
    onClose: jest.fn()
};

const renderWithRouter = (ui: React.ReactElement) => {
    return render(ui, { wrapper: BrowserRouter });
};

describe('Player Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders without crashing', () => {
        renderWithRouter(<Player {...defaultProps} />);
        expect(screen.getByTestId('player-container')).toBeInTheDocument();
    });

    it('renders video player with correct source', () => {
        renderWithRouter(<Player {...defaultProps} />);
        const videoPlayer = screen.getByTestId('video-player');
        expect(videoPlayer).toHaveAttribute('src', mockMovie.videoUrl);
    });

    it('renders episode video when currentEpisode is provided', () => {
        renderWithRouter(<Player {...defaultProps} currentEpisode={mockEpisode} />);
        const videoPlayer = screen.getByTestId('video-player');
        expect(videoPlayer).toHaveAttribute('src', mockEpisode.videoUrl);
    });

    it('shows error message when there is an error', () => {
        const useVideoPlayer = jest.requireMock('../../hooks/ui/useVideoPlayer').useVideoPlayer;
        useVideoPlayer.mockReturnValueOnce({
            ...useVideoPlayer(),
            error: new Error('Test Error')
        });

        renderWithRouter(<Player {...defaultProps} />);
        expect(screen.getByText('Erro ao reproduzir vídeo')).toBeInTheDocument();
        expect(screen.getByText('Test Error')).toBeInTheDocument();
    });

    it('shows controls when mouse moves', () => {
        renderWithRouter(<Player {...defaultProps} />);
        const container = screen.getByTestId('player-container');
        fireEvent.mouseMove(container);
        expect(screen.getByTestId('play-button')).toBeInTheDocument();
    });

    it('handles progress bar click', () => {
        const useVideoPlayer = jest.requireMock('../../hooks/ui/useVideoPlayer').useVideoPlayer;
        const seekMock = jest.fn();
        useVideoPlayer.mockReturnValueOnce({
            ...useVideoPlayer(),
            seek: seekMock
        });

        renderWithRouter(<Player {...defaultProps} />);
        const progressBar = screen.getByTestId('progress-bar');
        fireEvent.click(progressBar);
        expect(seekMock).toHaveBeenCalled();
    });

    it('shows episode list for series', () => {
        const usePlayerUI = jest.requireMock('../../hooks/ui/usePlayerUI').usePlayerUI;
        usePlayerUI.mockReturnValueOnce({
            ...usePlayerUI(),
            showEpisodeList: true
        });

        const useEpisodes = jest.requireMock('../../hooks/api/useEpisodes').useEpisodes;
        useEpisodes.mockReturnValueOnce({
            ...useEpisodes(),
            episodes: mockSerie.episodes
        });

        renderWithRouter(<Player {...defaultProps} media={mockSerie} />);
        expect(screen.getByTestId('episode-list')).toBeInTheDocument();
    });

    it('handles episode selection', () => {
        const useEpisodes = jest.requireMock('../../hooks/api/useEpisodes').useEpisodes;
        const handleEpisodeSelectMock = jest.fn();
        useEpisodes.mockReturnValueOnce({
            ...useEpisodes(),
            episodes: mockSerie.episodes,
            handleEpisodeSelect: handleEpisodeSelectMock
        });

        const usePlayerUI = jest.requireMock('../../hooks/ui/usePlayerUI').usePlayerUI;
        usePlayerUI.mockReturnValueOnce({
            ...usePlayerUI(),
            showEpisodeList: true
        });

        renderWithRouter(<Player {...defaultProps} media={mockSerie} />);
        const episodeItem = screen.getByTestId(`episode-item-${mockEpisode.id}`);
        fireEvent.click(episodeItem);
        expect(handleEpisodeSelectMock).toHaveBeenCalledWith(mockEpisode);
    });
}); 