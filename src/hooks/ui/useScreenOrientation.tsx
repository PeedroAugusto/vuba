import { useEffect } from 'react';

export const useScreenOrientation = () => {
  useEffect(() => {
    const lockOrientation = async () => {
      try {
        // Verifica se é um dispositivo móvel
        const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
        
        if (isMobile && window.screen?.orientation) {
          // Tenta forçar a orientação landscape
          await (window.screen.orientation as any).lock('landscape');
        }
      } catch (error) {
        console.warn('Não foi possível forçar a orientação da tela:', error);
      }
    };

    const unlockOrientation = () => {
      try {
        if (window.screen?.orientation) {
          window.screen.orientation.unlock();
        }
      } catch (error) {
        console.warn('Erro ao desbloquear orientação:', error);
      }
    };

    lockOrientation();

    // Cleanup: desbloqueia a orientação quando o componente é desmontado
    return () => {
      unlockOrientation();
    };
  }, []);
}; 