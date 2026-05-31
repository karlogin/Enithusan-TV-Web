import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useKeyboardShortcuts(onSearchFocus?: () => void) {
  const navigate = useNavigate();

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      const typing = tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT';

      if (e.key === '/' && !typing) {
        e.preventDefault();
        onSearchFocus?.();
      }
      if (e.key === 'Escape') {
        (document.activeElement as HTMLElement)?.blur();
      }
      if (e.key === 'h' && !typing && e.altKey) {
        e.preventDefault();
        navigate('/');
      }
      if (e.key === 'b' && !typing && e.altKey) {
        e.preventDefault();
        navigate('/browse');
      }
      if (e.key === 'l' && !typing && e.altKey) {
        e.preventDefault();
        navigate('/my-list');
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [navigate, onSearchFocus]);
}
