import { createContext, useState, useMemo } from "react";

const PlayerContext = createContext();

const PlayerProvider = ({ children }) => {
    const [playlist, setPlaylist] = useState([])
    const [playlistName, setPlaylistName] = useState(null)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [currentSound, setCurrentSound] = useState(null)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [isPlayerVisible, setIsPlayerVisible] = useState(false)

    const value = useMemo(() => ({
        currentSound, setCurrentSound, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, isLoading, setIsLoading, isPlayerVisible,
        setIsPlayerVisible, playlistName, setPlaylistName, playlist, setPlaylist, currentIndex, setCurrentIndex
    }), [currentSound, currentTrack, isPlaying, isLoading, isPlayerVisible, playlistName, playlist, currentIndex
    ]);

    return (
        <PlayerContext.Provider value={value}>
            {children}
        </PlayerContext.Provider>
    )
}

export { PlayerContext, PlayerProvider }