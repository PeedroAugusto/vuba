import { useState, useCallback, useEffect } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;

interface KeyboardOptions {
  target?: HTMLElement | null;
  preventDefault?: boolean;
  stopPropagation?: boolean;
  keydown?: boolean;
  keyup?: boolean;
  keypress?: boolean;
}

interface KeyState {
  key: string;
  code: string;
  altKey: boolean;
  ctrlKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  repeat: boolean;
}

interface KeyboardState {
  pressedKeys: Set<string>;
  lastKey: KeyState | null;
  isComposing: boolean;
}

export const useKeyboard = (options: KeyboardOptions = {}) => {
  const {
    target = null,
    preventDefault = false,
    stopPropagation = false,
    keydown = true,
    keyup = true,
    keypress = false,
  } = options;

  const [state, setState] = useState<KeyboardState>({
    pressedKeys: new Set(),
    lastKey: null,
    isComposing: false,
  });

  const [handlers] = useState(new Map<string, Set<KeyHandler>>());

  const updateState = useCallback((event: KeyboardEvent, pressed: boolean) => {
    setState(prev => {
      const newPressedKeys = new Set(prev.pressedKeys);
      
      if (pressed) {
        newPressedKeys.add(event.code);
      } else {
        newPressedKeys.delete(event.code);
      }

      const newLastKey = pressed ? {
        key: event.key,
        code: event.code,
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        shiftKey: event.shiftKey,
        metaKey: event.metaKey,
        repeat: event.repeat,
      } : prev.lastKey;

      return {
        pressedKeys: newPressedKeys,
        lastKey: newLastKey,
        isComposing: event.isComposing,
      };
    });
  }, []);

  const handleKeyEvent = useCallback(
    (event: KeyboardEvent) => {
      const isKeydown = event.type === 'keydown';

      if (preventDefault) {
        event.preventDefault();
      }

      if (stopPropagation) {
        event.stopPropagation();
      }

      updateState(event, isKeydown);

      // Executa os handlers registrados para a tecla
      const keyHandlers = handlers.get(event.code);
      if (keyHandlers) {
        keyHandlers.forEach(handler => handler(event));
      }

      // Executa os handlers registrados para combinações de teclas
      const pressedKeyCodes = Array.from(state.pressedKeys).sort().join('+');
      const comboHandlers = handlers.get(pressedKeyCodes);
      if (comboHandlers) {
        comboHandlers.forEach(handler => handler(event));
      }
    },
    [preventDefault, stopPropagation, handlers, state.pressedKeys, updateState]
  );

  const bind = useCallback(
    (key: string, handler: KeyHandler) => {
      if (!handlers.has(key)) {
        handlers.set(key, new Set());
      }
      handlers.get(key)?.add(handler);

      return () => {
        handlers.get(key)?.delete(handler);
        if (handlers.get(key)?.size === 0) {
          handlers.delete(key);
        }
      };
    },
    [handlers]
  );

  const unbind = useCallback(
    (key: string, handler: KeyHandler) => {
      handlers.get(key)?.delete(handler);
      if (handlers.get(key)?.size === 0) {
        handlers.delete(key);
      }
    },
    [handlers]
  );

  const isPressed = useCallback(
    (key: string) => state.pressedKeys.has(key),
    [state.pressedKeys]
  );

  const arePressed = useCallback(
    (keys: string[]) => keys.every(key => state.pressedKeys.has(key)),
    [state.pressedKeys]
  );

  useEffect(() => {
    const element = target || document;

    if (keydown) {
      element.addEventListener('keydown', handleKeyEvent as EventListener);
    }
    if (keyup) {
      element.addEventListener('keyup', handleKeyEvent as EventListener);
    }
    if (keypress) {
      element.addEventListener('keypress', handleKeyEvent as EventListener);
    }

    return () => {
      if (keydown) {
        element.removeEventListener('keydown', handleKeyEvent as EventListener);
      }
      if (keyup) {
        element.removeEventListener('keyup', handleKeyEvent as EventListener);
      }
      if (keypress) {
        element.removeEventListener('keypress', handleKeyEvent as EventListener);
      }
    };
  }, [target, keydown, keyup, keypress, handleKeyEvent]);

  return {
    ...state,
    bind,
    unbind,
    isPressed,
    arePressed,
  };
}; 