import React, { Suspense } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Loading } from '../components/Loading/Loading';
import { Error } from '../components/Error/Error';

// Lazy loading das páginas com tratamento de erro
const lazyLoad = async (importPromise: Promise<any>) => {
    try {
        return await importPromise;
    } catch (error) {
        return {
            default: () => <Error message={error instanceof Error ? error.toString() : 'Unknown error'} />
        };
    }
};

// Lazy loading das páginas
const Home = React.lazy(() => lazyLoad(import('../pages/Home/Home')));
const Login = React.lazy(() => lazyLoad(import('../pages/Login/Login')));
const Media = React.lazy(() => lazyLoad(import('../pages/Media/Media')));
const PlayerPage = React.lazy(() => lazyLoad(import('../pages/Player/PlayerPage')));
const Movies = React.lazy(() => lazyLoad(import('../pages/Movies/Movies')));
const Series = React.lazy(() => lazyLoad(import('../pages/Series/Series')));

const AppRoutes: React.FC = () => {
    return (
        <BrowserRouter>
            <Suspense fallback={<Loading />}>
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/login" element={<Login />} />
                    <Route path="/filmes" element={<Movies />} />
                    <Route path="/series" element={<Series />} />
                    <Route path="/media/:type/:id" element={<Media />} />
                    <Route path="/player/:id/movie" element={<PlayerPage />} />
                    <Route path="/player/:id/serie/:episodeId" element={<PlayerPage />} />
                </Routes>
            </Suspense>
        </BrowserRouter>
    );
};

export default AppRoutes; 