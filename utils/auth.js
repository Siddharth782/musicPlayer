import { SPOTIFY_AUTH } from '../config/config';
import { storage } from '../store/store';

export async function refreshAccessToken() {
    const refreshToken = storage.getString('refreshToken');
    if (!refreshToken) return false;

    try {
        const refreshParams = new URLSearchParams({
            client_id: SPOTIFY_AUTH.CLIENT_ID,
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
        });

        const response = await fetch(
            SPOTIFY_AUTH.TOKEN_URL,
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: refreshParams.toString(),
            }
        );

        if (!response.ok) {
            return false;
        }

        const data = await response.json();

        if (!data.access_token) return false;

        if (!data.expires_in || typeof data.expires_in !== 'number') {
            return false;
        }

        const expiresAt = Date.now() + (data.expires_in - 45) * 1000;

        storage.set('accessToken', data.access_token);
        storage.set('expiresAt', expiresAt);

        if (data.refresh_token) {
            storage.set('refreshToken', data.refresh_token);
        }

        return true;
    } catch {
        return false;
    }
}
