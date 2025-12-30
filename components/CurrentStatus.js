import { createContext, useState } from "react";

const Player = createContext();

const CurrentSong = ({ children }) => {
    const [playlist, setPlaylist] = useState([])
    const [playlistName, setPlaylistName] = useState(null)
    const [currentIndex, setCurrentIndex ] = useState(null)
    const [currentSong, setCurrentSong] = useState(null)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [isPlayerVisible, setIsPlayerVisible] = useState(false)

    return (
        <Player.Provider value={{ currentSong, setCurrentSong, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, isLoading, setIsLoading, isPlayerVisible, setIsPlayerVisible, playlistName, setPlaylistName, playlist, setPlaylist, currentIndex, setCurrentIndex }}>
            {children}
        </Player.Provider>
    )
}

export { Player, CurrentSong }