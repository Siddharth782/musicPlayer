import { createContext, useState, useMemo, useRef, useEffect, useCallback } from "react";
import { Audio } from 'expo-av';
import { fetchPreviewURL } from "../components/APIService";

const PlayerContext = createContext();

const PlayerProvider = ({ children }) => {
    const playingRef = useRef(false);
    const currentSound = useRef(null);

    const [playlist, setPlaylist] = useState([])
    const [playlistName, setPlaylistName] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayerVisible, setIsPlayerVisible] = useState(false)

    useEffect(() => {
        async function setupAudio() {
            try {
                await Audio.setAudioModeAsync({
                    staysActiveInBackground: true,
                    playsInSilentModeIOS: true,
                    shouldDuckAndroid: true,
                    playThroughEarpieceAndroid: true
                });
            } catch (e) {
                console.warn("Audio setup failed", e);
            }
        }
        setupAudio();
    }, []);

    // for playing selected track
    const playTrack = useCallback(async ({ item }) => {
        if (playingRef.current) return { ok: false, error: 'Playback busy' };
        playingRef.current = true;

        try {

            setIsLoading(true)

            // stop the playing song
            if (currentSound.current) {
                await currentSound.current.stopAsync();
                await currentSound.current.unloadAsync();
            }

            let song_url = await fetchPreviewURL(item);
            if (!song_url) {
                return { ok: false, error: 'Free Preview Not Available' };
            }
            setCurrentTrack(item)

            const { sound } = await Audio.Sound.createAsync(
                {
                    uri: song_url
                }
            )

            sound.setOnPlaybackStatusUpdate((status) => {
                if (!status.isLoaded) return;

                if (status.didJustFinish) {
                    setIsPlaying(false);
                    currentSound.current = null;
                }
            });

            setIsPlaying(true)
            currentSound.current = sound

            await sound?.playAsync()

            return { ok: true };
        } catch (error) {
            return { ok: false, error: error.message };
        } finally {
            playingRef.current = false;
            setIsLoading(false);
        }
    }, [currentSound]);

    const manageQueue = (data, add, playlistName) => {
        setPlaylistName(playlistName);

        if (add) {
            setPlaylist([...playlist, data]);
        } else {
            setPlaylist(data);
        }

    }

    const togglePlayback = useCallback(async () => {
        setIsPlaying(!isPlaying);
        try {
            if (isPlaying) {
                await currentSound.current.pauseAsync();
            } else {
                await currentSound.current.playAsync();
            }
        } catch (error) {
            console.warn("Playback error", error);
        }
    }, [currentSound, isPlaying, setIsPlaying]);

    const value = useMemo(() => ({
        currentSound, currentTrack, isPlaying, togglePlayback, isLoading, setIsLoading, isPlayerVisible,
        setIsPlayerVisible, playlistName, setPlaylistName, playlist, manageQueue, currentIndex, setCurrentIndex, playTrack
    }), [currentSound, currentTrack, isPlaying, isLoading, isPlayerVisible, playlistName, playlist, currentIndex]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    )
}

export { PlayerContext, PlayerProvider }