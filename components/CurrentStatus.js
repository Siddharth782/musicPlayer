import { createContext, useState } from "react";

const Player = createContext();

const CurrentSong = ({ children }) => {
    const [currentSong, setCurrentSong] = useState(null)
    const [currentTrack, setCurrentTrack] = useState(null)
    const [isPlaying, setIsPlaying] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    return (
        <Player.Provider value={{ currentSong, setCurrentSong, currentTrack, setCurrentTrack, isPlaying, setIsPlaying, isLoading, setIsLoading}}>
            {children}
        </Player.Provider>
    )
}

export { Player, CurrentSong }