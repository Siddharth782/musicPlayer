import { useState, useEffect, useCallback, useRef, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchWithAuthRetry } from '../components/APIService';

export const useLibraryData = () => {
    const { getAccessToken } = useContext(AuthContext);
    const isMounted = useRef(true);

    const [state, setState] = useState({
        user: null,
        libraryData: [],
        raw: { playlists: [], albums: [], artists: [] },
        loading: true,
        error: null
    });

    const getParamConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    }), [getAccessToken]);

    const fetchData = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true }));

        try {
            const results = await Promise.allSettled([
                fetchWithAuthRetry('/me', getParamConfig),
                fetchWithAuthRetry('/me/playlists?limit=50', getParamConfig),
                fetchWithAuthRetry('/me/albums?limit=50', getParamConfig),
                fetchWithAuthRetry('/me/top/artists?limit=10', getParamConfig)
            ]);

            if (!isMounted.current) return;

            const authError = results.some(r => r.status === 'rejected' &&
                (r.reason === 'Session expired' || r.reason?.status === 401 || r.reason?.message?.includes('401')));

            if (authError) {
                setState(prev => ({ ...prev, loading: false, error: 'Session expired' }));
                return;
            }

            let successCount = results.filter(r => r.status === 'fulfilled').length;

            if (successCount === 0) {
                setState(prev => ({ ...prev, loading: false, error: 'Failed' }));
                return;
            }

            const getValue = (res) => (res.status === 'fulfilled' ? res.value : null);

            const user = getValue(results[0]);
            const playlists = getValue(results[1])?.items?.map(p => ({ ...p, _entity: 'playlist', name: p.name })) || [];

            // Normalize Albums (Flatten structure)
            const albums = getValue(results[2])?.items?.map(item => ({
                ...item.album,
                _entity: 'album',
                name: item.album.name
            })) || [];

            const artists = getValue(results[3])?.items?.map(a => ({ ...a, _entity: 'artist', name: a.name })) || [];

            const combined = [...playlists, ...albums, ...artists];

            setState({
                user,
                libraryData: combined,
                raw: { playlists, albums, artists },
                loading: false
            });

        } catch (error) {
            if (isMounted.current) {
                setState(prev => ({ ...prev, loading: false, error: 'Failed' }));
            }
        }
    }, [getParamConfig]);

    useEffect(() => {
        isMounted.current = true;
        fetchData();
        return () => { isMounted.current = false; };
    }, [fetchData]);

    return { ...state, refetch: fetchData };
};