import { useNavigate } from 'react-router-dom';
import { Movie } from '../../../types/Movie';
import { Serie } from '../../../types/Serie';
import styles from './Grid.module.scss';

interface GridProps {
    title: string;
    items: Movie[] | Serie[];
    type: 'movie' | 'serie';
}

export const Grid = ({ title, items, type }: GridProps) => {
    const navigate = useNavigate();

    const handleItemClick = (id: number) => {
        navigate(`/media/${type}/${id}`);
    };

    return (
        <div className={styles.gridContainer}>
            <h2 className={styles.title}>{title}</h2>
            <div className={styles.grid}>
                {items.map((item) => (
                    <div 
                        key={item.id} 
                        className={styles.gridItem}
                        onClick={() => handleItemClick(item.id)}
                    >
                        <div className={styles.thumbnail}>
                            <img src={item.thumbnail} alt={item.title} loading="lazy" />
                        </div>
                        <div className={styles.overlay}>
                            <div className={styles.info}>
                                <h3>{item.title}</h3>
                                <div className={styles.meta}>
                                    <span className={styles.rating}>
                                        <i className='bx bxs-star'></i>
                                        {item.rating}
                                    </span>
                                    <span>{item.releaseYear}</span>
                                </div>
                                <div className={styles.genres}>
                                    {item.genres.slice(0, 2).map((genre, index) => (
                                        <span key={index}>
                                            {genre}
                                            {index < Math.min(item.genres.length - 1, 1) && ' • '}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}; 