import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styles from './Navbar.module.scss';
import 'boxicons/css/boxicons.min.css';
import { Logo } from '../Logo/Logo';

export const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const location = useLocation();

  // Fecha o menu quando mudar de rota
  useEffect(() => {
    setShowMenu(false);
    setShowSearch(false);
  }, [location]);

  // Fecha o menu e busca ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      const menu = document.querySelector(`.${styles.menu}`);
      const menuButton = document.querySelector(`.${styles.menuToggle}`);
      const search = document.querySelector(`.${styles.search}`);
      const searchButton = document.querySelector(`.${styles.searchToggle}`);

      if (menu && !menu.contains(target) && menuButton && !menuButton.contains(target)) {
        setShowMenu(false);
      }

      if (search && !search.contains(target) && searchButton && !searchButton.contains(target)) {
        setShowSearch(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Controla o scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
      setIsScrolled(scrollTop > 20);
    };

    handleScroll();
    document.addEventListener('scroll', handleScroll, { passive: true });
    return () => document.removeEventListener('scroll', handleScroll);
  }, []);

  // Previne scroll quando menu mobile está aberto
  useEffect(() => {
    if (showMenu) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
  }, [showMenu]);

  const toggleMenu = useCallback(() => {
    setShowMenu(prev => !prev);
    setShowSearch(false);
  }, []);

  const toggleSearch = useCallback(() => {
    setShowSearch(prev => !prev);
    setShowMenu(false);
  }, []);

  const navLinks = [
    { path: '/', label: 'Início', icon: 'bx-home' },
    { path: '/filmes', label: 'Filmes', icon: 'bx-movie-play' },
    { path: '/series', label: 'Séries', icon: 'bx-tv' },
    { path: '/minha-lista', label: 'Minha Lista', icon: 'bx-list-ul' },
  ];

  return (
    <nav className={`${styles.navbar} ${isScrolled ? styles.scrolled : ''}`}>
      <div className={styles.left}>
        <Link to="/" className={styles.logo} aria-label="Ir para página inicial">
          <Logo />
        </Link>
        <button 
          className={`${styles.menuToggle} ${showMenu ? styles.active : ''}`}
          onClick={toggleMenu}
          aria-label={showMenu ? "Fechar menu" : "Abrir menu"}
          aria-expanded={showMenu}
        >
          <i className={`bx ${showMenu ? 'bx-x' : 'bx-menu'}`}></i>
        </button>
        <div 
          className={`${styles.menu} ${showMenu ? styles.show : ''}`}
          role="navigation"
          aria-label="Menu principal"
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`${styles.link} ${location.pathname === link.path ? styles.active : ''}`}
              aria-current={location.pathname === link.path ? 'page' : undefined}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className={styles.right}>
        <div className={`${styles.search} ${showSearch ? styles.active : ''}`}>
          <input
            type="text"
            placeholder="Títulos, pessoas, gêneros"
            className={styles.searchInput}
            aria-label="Buscar"
            aria-expanded={showSearch}
          />
          <button 
            onClick={toggleSearch}
            className={`${styles.searchToggle} ${showSearch ? styles.active : ''}`}
            aria-label={showSearch ? "Fechar busca" : "Abrir busca"}
          >
            <i className={`bx ${showSearch ? 'bx-x' : 'bx-search'}`}></i>
          </button>
        </div>
        <button 
          className={styles.notifications} 
          aria-label="Notificações"
        >
          <i className='bx bx-bell'></i>
        </button>
        <div 
          className={styles.profile}
          role="button"
          tabIndex={0}
          aria-label="Menu do perfil"
        >
          <img
            src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
            alt="Avatar do perfil"
            className={styles.avatar}
          />
          <i className='bx bx-chevron-down'></i>
        </div>
      </div>
    </nav>
  );
};

