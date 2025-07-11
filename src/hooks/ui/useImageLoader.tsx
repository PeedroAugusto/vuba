import { useState, useEffect, useCallback } from 'react';

interface ImageCache {
    [key: string]: {
        url: string;
        blob: Blob;
        timestamp: number;
    };
}

interface UseImageLoaderReturn {
    loading: boolean;
    error: Error | null;
    imageUrl: string | null;
    reload: () => void;
}

const imageCache: ImageCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutos

export function useImageLoader(url: string, options?: RequestInit): UseImageLoaderReturn {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);
    const [imageUrl, setImageUrl] = useState<string | null>(null);

    const loadImage = useCallback(async () => {
        if (!url) {
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            // Verifica se a imagem está em cache e ainda é válida
            const cachedImage = imageCache[url];
            if (cachedImage && Date.now() - cachedImage.timestamp < CACHE_DURATION) {
                setImageUrl(cachedImage.url);
                setLoading(false);
                return;
            }

            // Carrega a imagem
            const response = await fetch(url, options);
            if (!response.ok) {
                throw new Error(`Erro ao carregar imagem: ${response.statusText}`);
            }

            const blob = await response.blob();
            const objectUrl = URL.createObjectURL(blob);

            // Atualiza o cache
            imageCache[url] = {
                url: objectUrl,
                blob,
                timestamp: Date.now()
            };

            setImageUrl(objectUrl);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Erro desconhecido ao carregar imagem'));
            console.error('Erro ao carregar imagem:', err);
        } finally {
            setLoading(false);
        }
    }, [url, options]);

    useEffect(() => {
        loadImage();

        // Limpa a URL do objeto quando o componente é desmontado
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [loadImage, imageUrl]);

    // Função para forçar o recarregamento da imagem
    const reload = useCallback(() => {
        if (imageUrl) {
            URL.revokeObjectURL(imageUrl);
        }
        if (imageCache[url]) {
            delete imageCache[url];
        }
        loadImage();
    }, [url, imageUrl, loadImage]);

    return {
        loading,
        error,
        imageUrl,
        reload
    };
} 