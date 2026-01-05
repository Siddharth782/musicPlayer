import { refreshAccessToken } from '../utils/auth';
import { API_BASE_URL } from '../config/config';
import { RAPIDAPI } from '../config/config';

export const fetchWithAuthRetry = async (endpoint, getConfig) => {

    try {
        let response = await fetch(`${API_BASE_URL}${endpoint}`, getConfig());

        if (response.status === 401) {
            const refreshSuccess = await refreshAccessToken();

            if (!refreshSuccess) {
                throw new Error('Session expired');
            }

            await new Promise(r => setTimeout(r, 200));
            response = await fetch(`${API_BASE_URL}${endpoint}`, getConfig());
        }

        if (!response.ok) throw new Error(`API Error: ${response.status}`);
        return await response.json();
    } catch (error) {
        console.warn(`Fetch failed for ${endpoint}:`, error);
        return null;
    }
};

const config = {
    method: 'GET',
    headers: {
        'x-rapidapi-host': RAPIDAPI.HOST,
        'x-rapidapi-key': RAPIDAPI.KEY
    }
};

export const fetchPreviewURL = async (item) => {
    let song_url = item?.preview_url;

    if (!song_url) {
        try {
            const trackName = item?.name;
            const artistName = item?.artists[0].name;
            const query = encodeURIComponent(`track:"${trackName}" artist:"${artistName}"`);

            const url = `${RAPIDAPI.BASE_URL}/search?q=${query}`;

            const response = await fetch(url, config);
            const data = await response.json();

            if (data.data && data.data.length > 0) {
                song_url = data?.data[0]?.preview;
            }
        } catch (deezerError) {
            return null;
        }
    }

    return song_url;
};

export const addToLikedSongs = async ( songUri, getAccessToken ) => {

    const data = {
        "ids": [songUri]
    };

    try {

        let addToLiked = await fetch(`${API_BASE_URL}/me/tracks`, {
            method: 'PUT',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Bearer ' + getAccessToken()
            },
            body: JSON.stringify(data)
        })

        if (!addToLiked.ok) {
            return { ok: false, msg: "Failed to add Song to Liked Songs" };
        } else {
            // console.log("saved tracks response", addToLiked)
            return { ok: true, msg: "Song Added to Liked Songs" };
        }

    } catch (error) {
        return { ok: false, msg: "Failed to add Song to Liked Songs" };
    }

}