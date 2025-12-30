import { createContext, useEffect, useRef, useState, useMemo } from 'react';
import { storage } from '../store/store';
import { refreshAccessToken } from '../utils/auth';

const AuthContext = createContext();

const AuthProvider = ({ children }) => {
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const refreshing = useRef(false);

    useEffect(() => {
        const accessToken = storage.getString('accessToken');
        const expiresAt = storage.getNumber('expiresAt');

        if (accessToken && expiresAt && expiresAt > Date.now()) {
            setIsAuthenticated(true);
        } else {
            setIsAuthenticated(false);
        }
    }, []);

    useEffect(() => {
        if (!isAuthenticated) return;

        const checkAndRefresh = async () => {
            if (refreshing.current) return;

            try {
                const expiresAt = storage.getNumber('expiresAt');
                if (!expiresAt) {
                    clearAuth();
                    return;
                }

                if (expiresAt - Date.now() < 120000) {
                    refreshing.current = true;
                    const refreshed = await refreshAccessToken();
                    refreshing.current = false;

                    if (!refreshed) {
                        clearAuth();
                    }
                }
            } catch (err) {
                refreshing.current = false;
                const expiresAt = storage.getNumber('expiresAt');
                if (!expiresAt || expiresAt <= Date.now()) {
                    clearAuth();
                }
            }
        };

        checkAndRefresh();
        const interval = setInterval(checkAndRefresh, 60000);

        return () => clearInterval(interval);
    }, [isAuthenticated]);

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
    }), [isAuthenticated]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};

export { AuthContext, AuthProvider };