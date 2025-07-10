import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home/Home';
import Login from '../pages/Login/Login';
import Media from '../pages/Media/Media';
import PlayerPage from '../pages/Player/PlayerPage';
import Movies from '../pages/Movies/Movies';
import Series from '../pages/Series/Series';

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/filmes" element={<Movies />} />
                <Route path="/series" element={<Series />} />
                <Route path="/media/:type/:id" element={<Media />} />
                <Route path="/player/:id/movie" element={<PlayerPage />} />
                <Route path="/player/:id/serie/:episodeId" element={<PlayerPage />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes; 