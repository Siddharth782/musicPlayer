import { createContext, useState, useMemo, useRef, useCallback } from "react";
import { Audio } from 'expo-av';
import { fetchPreviewURL } from "../components/APIService";

const PlayerContext = createContext();

const PlayerProvider = ({ children }) => {
    const playingRef = useRef(false);

    const [playlist, setPlaylist] = useState([])
    const [playlistName, setPlaylistName] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentSound, setCurrentSound] = useState(null)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayerVisible, setIsPlayerVisible] = useState(false)

    // for playing selected track
    const playTrack = useCallback(async ({ item, id }) => {
        if (playingRef.current) return { ok: false, error: 'Playback busy' };
        playingRef.current = true;

        try {

            setIsLoading(true)

            // stop the playing song
            if (currentSound) {
                await currentSound.stopAsync();
                await currentSound.unloadAsync();
            }

            let song_url = await fetchPreviewURL(item);
            if (!song_url) {
                return { ok: false, error: 'Free Preview Not Available' };
            }

            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                playsInSilentModeIOS: true,
                shouldDuckAndroid: false,
            });


            const { sound, status } = await Audio.Sound.createAsync(
                {
                    uri: song_url
                }
            )

            sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.isLoaded) return;

                if (status.didJustFinish) {
                    setIsPlaying(false);
                    setCurrentSound(null);
                }
            });

            setCurrentTrack(item)
            setCurrentIndex(id)
            setIsPlaying(true)
            setCurrentSound(sound)
            setIsLoading(false)

            await sound?.playAsync()

            return { ok: true };
        } catch (error) {
            setIsLoading(false);
            return { ok: false, error: error.message };
        } finally {
            playingRef.current = false;
        }
    }, [currentSound]);

    const manageQueue = (data, add) => {
        if (add) {
            setPlaylist([...playlist, data]);
        } else {
            setPlaylist(data);
        }

    }

    const value = useMemo(() => ({
        currentSound, setCurrentSound, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, isLoading, setIsLoading, isPlayerVisible,
        setIsPlayerVisible, playlistName, setPlaylistName, playlist, manageQueue, currentIndex, setCurrentIndex, playTrack
    }), [currentSound, currentTrack, isPlaying, isLoading, isPlayerVisible, playlistName, playlist, currentIndex]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    )
}

export { PlayerContext, PlayerProvider }