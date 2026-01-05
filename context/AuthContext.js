import { createContext, useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { storage } from '../store/store';
import { refreshAccessToken } from '../utils/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const refreshing = useRef(false);

    const getAccessToken = useCallback(() => {
        return storage.getString('accessToken');
    }, []);

    useEffect(() => {
        const checkAndRefresh = async () => {
            if (refreshing.current) return;

            const accessToken = getAccessToken();
            const expiresAt = storage.getNumber('expiresAt');

            if (!accessToken || !expiresAt) {
                setIsAuthenticated(false);
                return;
            }

            const isExpired = expiresAt <= Date.now();
            const isExpiringSoon = expiresAt - Date.now() < 120000;

            if (isExpired || isExpiringSoon) {
                refreshing.current = true;
                const refreshed = await refreshAccessToken();
                refreshing.current = false;

                if (refreshed) {
                    setIsAuthenticated(true);
                } else {
                    setIsAuthenticated(false);
                    clearAuth();
                }
            } else {
                setIsAuthenticated(true);
            }
        };

        checkAndRefresh();
        const interval = setInterval(checkAndRefresh, 60000);

        return () => clearInterval(interval);
    }, []);

    const clearAuth = () => {
        storage.clearAll();
        setIsAuthenticated(false);
    };

    const logout = () => {
        clearAuth();
    };

    const loginSuccess = () => setIsAuthenticated(true);

    const value = useMemo(() => ({
        isAuthenticated,
        loginSuccess,
        logout,
        clearAuth,
        getAccessToken
    }), [isAuthenticated, getAccessToken]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };