import { View, Text, StyleSheet, Image, ActivityIndicator } from 'react-native'
import React, { useContext } from 'react'
import { Player } from './CurrentStatus'
import { COLORS } from '../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DisplayArtistsName } from './DisplayArtistName'

const SongPlayer = () => {
    const { currentTrack, isPlaying, setIsPlaying, currentSong, isLoading, setIsLoading } = useContext(Player)

    async function changeStatus() {
        // console.log("current song", currentTrack)
        if (isPlaying) {
            await currentSong?.pauseAsync()
            setIsPlaying(!isPlaying)
        } else {
            await currentSong?.playAsync()
            setIsPlaying(!isPlaying)
        }

    }

    return (

        currentTrack && (
            isLoading ? (
                <View style={[styles.songDisplay,{justifyContent:'center'}]}><ActivityIndicator color={COLORS.green} size={35} /></View>
            ) : (
                <View style={styles.songDisplay}>
                    <Image source={{ uri: (currentTrack?.album?.images[0]?.url ? currentTrack?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 40, width: 40 }} />
                    <View style={{ width: '80%' }}>
                        <Text numberOfLines={1} style={{ color: COLORS.white, marginLeft: 10, fontWeight: '600' }}>{currentTrack?.name}</Text>
                        <Text numberOfLines={1} style={{ color: COLORS.white, marginLeft: 10 }}>{DisplayArtistsName({ names: currentTrack?.artists })} </Text>
                    </View>
                    <Icon name={isPlaying ? 'pause' : 'play'} color={COLORS.white} size={30} style={{ position: 'absolute', right: 10 }} onPress={() => changeStatus()} />
                </View>
            )
        )

    )
}

const styles = StyleSheet.create({
    songDisplay: {
        zIndex: 1,
        bottom: 67,
        width: '100%',
        position: 'absolute',
        flexDirection: 'row',
        backgroundColor: COLORS.lightBlue,
        height: 50,
        alignSelf: 'center',
        alignItems: 'center',
        paddingHorizontal: 10
    }
})

export default SongPlayer