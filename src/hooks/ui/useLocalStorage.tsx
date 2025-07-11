import { useState, useEffect, useCallback } from 'react';

export function useLocalStorage<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
    // Estado para armazenar o valor
    // Passa uma função para o useState para que o valor inicial
    // só seja calculado na primeira renderização
    const [storedValue, setStoredValue] = useState<T>(() => {
        try {
            const item = window.localStorage.getItem(key);
            // Retorna o item parseado se existir, senão retorna o initialValue
            return item ? JSON.parse(item) : initialValue;
        } catch (error) {
            console.error('Erro ao ler do localStorage:', error);
            return initialValue;
        }
    });

    // Função para atualizar tanto o estado quanto o localStorage
    const setValue = useCallback((value: T | ((val: T) => T)) => {
        try {
            // Permite que o valor seja uma função para ter a mesma API do useState
            const valueToStore = value instanceof Function ? value(storedValue) : value;
            
            // Salva o estado
            setStoredValue(valueToStore);
            
            // Salva no localStorage
            window.localStorage.setItem(key, JSON.stringify(valueToStore));
            
            // Dispara um evento customizado para sincronizar outras instâncias
            window.dispatchEvent(new StorageEvent('storage', {
                key: key,
                newValue: JSON.stringify(valueToStore),
                storageArea: localStorage
            }));
        } catch (error) {
            console.error('Erro ao salvar no localStorage:', error);
        }
    }, [key, storedValue]);

    // Escuta mudanças em outras abas/janelas
    useEffect(() => {
        const handleStorageChange = (e: StorageEvent) => {
            if (e.key === key && e.newValue !== null) {
                try {
                    setStoredValue(JSON.parse(e.newValue));
                } catch (error) {
                    console.error('Erro ao sincronizar com localStorage:', error);
                }
            }
        };

        window.addEventListener('storage', handleStorageChange);

        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, [key]);

    return [storedValue, setValue];
} 