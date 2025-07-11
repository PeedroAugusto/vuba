import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Carousel.module.scss';
import { Movie } from '../../../types/Movie';
import { Serie } from '../../../types/Serie';
import 'boxicons/css/boxicons.min.css';

interface CarouselProps {
    title: string;
    items: Movie[] | Serie[];
    type?: 'movie' | 'serie';  // Novo prop opcional para especificar o tipo
}

export const Carousel = ({ title, items, type }: CarouselProps) => {
    const navigate = useNavigate();
    const [currentPage, setCurrentPage] = useState(0);
    const [totalPages, setTotalPages] = useState(0);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const trackRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startX, setStartX] = useState(0);
    const [scrollLeft, setScrollLeft] = useState(0);
    const [dragDistance, setDragDistance] = useState(0);
    const clickTimeoutRef = useRef<number | null>(null);

    const updateItemsPerPage = useCallback(() => {
        if (window.innerWidth > 1400) setItemsPerPage(6);
        else if (window.innerWidth > 1200) setItemsPerPage(5);
        else if (window.innerWidth > 900) setItemsPerPage(4);
        else if (window.innerWidth > 600) setItemsPerPage(3);
        else setItemsPerPage(2);
    }, []);

    useEffect(() => {
        updateItemsPerPage();
        const handleResize = () => {
            updateItemsPerPage();
            if (trackRef.current) {
                const newTotalPages = Math.ceil(items.length / itemsPerPage);
                setTotalPages(newTotalPages);
                setCurrentPage(prev => Math.min(prev, newTotalPages - 1));
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [items.length, itemsPerPage, updateItemsPerPage]);

    useEffect(() => {
        setTotalPages(Math.ceil(items.length / itemsPerPage));
    }, [items.length, itemsPerPage]);

    const handleMouseDown = (e: React.MouseEvent | React.TouchEvent) => {
        if (!trackRef.current) return;
        
        if ('touches' in e) {
            // Para touch, não fazemos nada especial
            return;
        }

        // Apenas para mouse
        setIsDragging(true);
        const pageX = (e as React.MouseEvent).pageX;
        setStartX(pageX - trackRef.current.offsetLeft);
        setScrollLeft(trackRef.current.scrollLeft);
        setDragDistance(0);
    };

    const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
        if (!isDragging || !trackRef.current || 'touches' in e) return;

        // Apenas para mouse
        const pageX = (e as React.MouseEvent).pageX;
        const x = pageX - trackRef.current.offsetLeft;
        const walk = (x - startX);
        trackRef.current.scrollLeft = scrollLeft - walk;
        setDragDistance(Math.abs(walk));
    };

    const handleMouseUp = () => {
        setIsDragging(false);
        if (clickTimeoutRef.current) {
            window.clearTimeout(clickTimeoutRef.current);
        }
        
        clickTimeoutRef.current = window.setTimeout(() => {
            setDragDistance(0);
        }, 100);
    };

    const handleNavigation = (direction: 'prev' | 'next') => {
        if (isDragging) return;
        const newPage = direction === 'next' ? currentPage + 1 : currentPage - 1;
        if (newPage >= 0 && newPage < totalPages) {
            setCurrentPage(newPage);
            if (trackRef.current) {
                trackRef.current.scrollLeft = newPage * trackRef.current.offsetWidth;
            }
        }
    };

    const handleDotClick = (pageIndex: number) => {
        setCurrentPage(pageIndex);
        if (trackRef.current) {
            trackRef.current.scrollLeft = pageIndex * trackRef.current.offsetWidth;
        }
    };

    const handleItemClick = (mediaId: number) => {
        if (!isDragging && dragDistance < 5) {
            // Se o tipo não foi especificado via props, assume que é filme
            const mediaType = type || 'movie';
            navigate(`/media/${mediaType}/${mediaId}`);
        }
    };

    const formatDuration = (minutes: number) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}h ${mins}min` : `${mins}min`;
    };

    return (
        <div className={styles.carousel}>
            <div className={styles['carousel-header']}>
                <h2 className={styles['genre-title']}>{title}</h2>
                <div className={styles.navigation}>
                    <div className={styles.dots}>
                        {Array.from({ length: totalPages }, (_, i) => (
                            <button
                                key={i}
                                className={`${styles.dot} ${currentPage === i ? styles.active : ''}`}
                                onClick={() => handleDotClick(i)}
                                aria-label={`Go to page ${i + 1}`}
                            />
                        ))}
                    </div>
                    <a href="#" className={styles['see-more']}>
                        Ver mais <i className='bx bx-chevron-right'></i>
                    </a>
                </div>
            </div>

            <div className={styles['carousel-wrapper']}>
                <button
                    className={`${styles['btn-nav']} ${currentPage === 0 ? styles.disabled : ''}`}
                    onClick={() => handleNavigation('prev')}
                    disabled={currentPage === 0}
                    aria-label="Previous items"
                >
                    <i className='bx bx-chevron-left'></i>
                </button>

                <div
                    ref={trackRef}
                    className={styles['carousel-track']}
                    onMouseDown={handleMouseDown}
                    onMouseMove={handleMouseMove}
                    onMouseUp={handleMouseUp}
                    onMouseLeave={handleMouseUp}
                    style={{ cursor: isDragging ? 'grabbing' : 'grab' }}
                >
                    {items.map((media, index) => (
                        <div 
                            key={index} 
                            className={styles.item}
                            onClick={() => !isDragging && handleItemClick(media.id)}
                            role="button"
                            tabIndex={0}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    handleItemClick(media.id);
                                }
                            }}
                        >
                            <img src={media.thumbnail} alt={media.title} />
                            <div className={styles['item-overlay']}>
                                <div className={styles['item-info']}>
                                    <h3 className={styles['item-title']}>{media.title}</h3>
                                    <div className={styles['item-meta']}>
                                        <span>{media.releaseYear}</span>
                                        <span>{formatDuration(media.duration)}</span>
                                        <span className={styles['item-rating']}>
                                            <i className='bx bxs-star'></i>
                                            {media.rating}
                                        </span>
                                    </div>
                                    <div className={styles['item-genres']}>
                                        {media.genres.slice(0, 2).join(' • ')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <button
                    className={`${styles['btn-nav']} ${
                        currentPage === totalPages - 1 ? styles.disabled : ''
                    }`}
                    onClick={() => handleNavigation('next')}
                    disabled={currentPage === totalPages - 1}
                    aria-label="Next items"
                >
                    <i className='bx bx-chevron-right'></i>
                </button>
            </div>
        </div>
    );
};
