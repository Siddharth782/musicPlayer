import { useState, useEffect, useRef, useCallback, useContext, useMemo } from 'react';
import { AuthContext } from '../context/AuthContext';
import { fetchWithAuthRetry } from '../components/APIService';

export function useDashboardData() {
    const { getAccessToken } = useContext(AuthContext);
    const isMounted = useRef(true);

    const [state, setState] = useState({
        dashboardData: {
            topTracks: [],
            artists: [],
            newReleases: [],
            userPlaylists: [],
            bollywood: [],
            workout: [],
            kPop: [],
            party: [],
            mood: [],
            user: null,
        },
        loading: true,
        error: null,
    });

    useEffect(() => {
        isMounted.current = true;
        return () => {
            isMounted.current = false;
        };
    }, []);

    const getAuthenticatedConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
        },
    }), [getAccessToken]);

    const normalizeError = (err) => {
        if (!err) return 'Unknown error';

        if (err === 'Session expired' || err?.status === 401) {
            return 'Session expired';
        }

        if (typeof err === 'string') return err;

        return err.message || 'Something went wrong';
    };

    const requests = useMemo(() => ([
        { key: 'topTracks', path: '/me/top/tracks?limit=20' },
        { key: 'artists', path: '/me/top/artists?limit=10' },
        { key: 'newReleases', path: '/browse/new-releases?country=IN&limit=10' },
        { key: 'userPlaylists', path: '/me/playlists?limit=10' },
        { key: 'bollywood', path: '/search?q=bollywood&type=playlist&limit=10' },
        { key: 'workout', path: '/search?q=workout&type=playlist&limit=10' },
        { key: 'kPop', path: '/search?q=k-pop&type=playlist&limit=10' },
        { key: 'party', path: '/search?q=party&type=playlist&limit=10' },
        { key: 'mood', path: '/search?q=mood&type=playlist&limit=10' },
    ]), []);


    const fetchAll = useCallback(async () => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            let userData;
            try {
                userData = await fetchWithAuthRetry('/me', getAuthenticatedConfig);
            } catch (err) {
                const normalizedErr = normalizeError(err);

                setState(prev => ({
                    ...prev,
                    loading: false,
                    error: normalizedErr,
                }));
                return;
            }

            const results = await Promise.allSettled(
                requests.map(r => fetchWithAuthRetry(r.path, getAuthenticatedConfig))
            );

            if (!isMounted.current) return;

            let newData = { user: userData };
            let successCount = 0;

            requests.forEach((req, index) => {
                const result = results[index];

                let items = [];

                if (result.status === 'fulfilled' && result.value) {
                    successCount++;
                    const val = result.value;
                    if (val.albums) items = val.albums.items;
                    else if (val.playlists) items = val.playlists.items;
                    else if (val.items) items = val.items;

                    if (req.key === 'userPlaylists' && userData?.id) {
                        items = items.filter(p => p?.owner?.id === userData.id);
                    }
                } else {
                    console.warn(`Failed to fetch ${req.key}:`, result.reason);
                }

                newData[req.key] = items || [];
            });

            if (successCount === 0) {
                setState(prev => ({
                    loading: false,
                    error: 'Failed to load dashboard',
                    dashboardData: prev.dashboardData,
                }));
                return;
            }


            setState({
                loading: false,
                error: null,
                dashboardData: newData,
            });

        } catch (err) {
            if (!isMounted.current) return;

            const normalized = normalizeError(err);

            setState(prev => ({
                ...prev,
                error: normalized,
                loading: false,
            }));

        }
    }, [getAccessToken, requests]);

    useEffect(() => {
        fetchAll();
    }, [fetchAll]);

    return {
        ...state,
        refetch: fetchAll,
    };
}