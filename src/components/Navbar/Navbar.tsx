import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss';
import 'boxicons/css/boxicons.min.css';
import { Logo } from '../Logo/Logo';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    // Verificar scroll inicial
    handleScroll();

    // Adicionar listener para scroll
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { path: '/', label: 'Início' },
    { path: '/filmes', label: 'Filmes' },
    { path: '/series', label: 'Séries' },
    { path: '/minha-lista', label: 'Minha Lista' },
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo}>
          <Logo />
        </Link>
        <div className={`${styles.menu} ${showMenu ? styles.show : ''}`}>
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.link} ${location.pathname === link.path ? styles.active : ''}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
        <button 
          className={styles.menuToggle}
          onClick={() => setShowMenu(!showMenu)}
          aria-label="Toggle menu"
        >
          <i className='bx bx-menu'></i>
        </button>
      </div>

      <div className={styles.right}>
        <div className={`${styles.search} ${showSearch ? styles.active : ''}`}>
          <input
            type="text"
            placeholder="Títulos, pessoas, gêneros"
            className={styles.searchInput}
          />
          <button 
            onClick={() => setShowSearch(!showSearch)}
            className={styles.searchToggle}
            aria-label="Toggle search"
          >
            <i className='bx bx-search'></i>
          </button>
        </div>
        <button className={styles.notifications} aria-label="Notifications">
          <i className='bx bx-bell'></i>
        </button>
        <div className={styles.profile}>
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Profile"
            className={styles.avatar}
          />
          <i className='bx bx-chevron-down'></i>
        </div>
      </div>
    </nav>
  );
};

