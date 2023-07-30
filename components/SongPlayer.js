import { View, Text, StyleSheet, Image, ActivityIndicator, TouchableOpacity, ToastAndroid, Modal } from 'react-native'
import React, { useContext } from 'react'
import { Player } from './CurrentStatus'
import { COLORS, FONTS } from '../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DisplayArtistsName } from './DisplayArtistName'
import { Audio } from 'expo-av'
import LinearGradient from 'react-native-linear-gradient'

const SongPlayer = () => {
    const { currentTrack, isPlaying, setIsPlaying, currentSong, isLoading, setIsPlayerVisible, isPlayerVisible, playlistName, playlist, currentIndex, setCurrentIndex, setCurrentTrack, setCurrentSong, setIsLoading } = useContext(Player)

    console.log("current index", currentIndex)
    let nextSong = currentTrack
    console.log("playlist", playlist)
    console.log("playlist length", playlist.length)

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

    async function playAnotherTrack({ item }) {
        setIsLoading(true)
        nextSong = item
        setCurrentTrack(item)
        console.log("next song playing", item)

        await currentSong?.stopAsync()
        let song_url = item?.preview_url
        try {

            await Audio.setAudioModeAsync({
                staysActiveInBackground: true,
                shouldDuckAndroid: false
            })

            const { sound, status } = await Audio.Sound.createAsync(
                {
                    uri: song_url
                }
            )

            setIsPlaying(true)
            setCurrentSong(sound)
            setIsLoading(false)
            await sound?.playAsync()
        } catch (error) {
            setIsLoading(false)
            if (error.message === "Cannot load an AV asset from a null playback source") {
                ToastAndroid.show("Free Preview Not Available", 3000)
            }
            else ToastAndroid.show(error.message, 3000)
        }
    }

    function AudioPlayer() {
        return (
            (isLoading ? <View style={styles.player}><LinearGradient style={{ flex: 1, justifyContent:'center' }} colors={['#2dbfc2', '#0b0d70', '#000008']}><ActivityIndicator color={COLORS.green} size={75} /></LinearGradient></View> : (<View style={styles.player}>
                <LinearGradient style={{ flex: 1 }} colors={['#2dbfc2', '#0b0d70', '#000008']} >


                    <Icon name="chevron-down" color={COLORS.white} size={30} onPress={() => setIsPlayerVisible(false)} position="absolute" left={10} top={20} />
                    <View style={{ justifyContent: 'center', alignSelf: 'center', alignItems: 'center', marginVertical: 20, width: '70%' }}>
                        <Text style={{ color: COLORS.white, ...FONTS.h3, fontWeight: 400 }}>Playing from your Playlist</Text>
                        <Text style={{ textAlign: 'center', color: COLORS.white, ...FONTS.h4, fontWeight: 700, fontSize: 20 }}>{playlistName}</Text>
                    </View>

                    <View style={{ alignItems: 'center', height: '50%', width: '100%' }}>
                        <Image source={{ uri: (nextSong?.album?.images[0]?.url ? nextSong?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 400, width: "100%" }} />
                    </View>

                    <Text numberOfLines={2} style={{ textAlign: 'center', ...FONTS.h3, color: COLORS.white, width: '70%', alignSelf: 'center', marginVertical: 10 }}>{nextSong?.name}</Text>
                    <Text numberOfLines={1} style={{ textAlign: 'center', ...FONTS.h3, color: COLORS.gray, width: '70%', alignSelf: 'center', marginVertical: 10 }}>{DisplayArtistsName({ names: nextSong?.artists })}</Text>

                    <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-evenly', alignItems: 'center' }}>
                        <Icon name="skip-previous" size={60} color={COLORS.white} onPress={() => { setIsLoading(true), playAnotherTrack({ item: playlist[Number(currentIndex == 0 ? (playlist.length - 1) : (currentIndex - 1))]?.track }), setCurrentIndex(Number(currentIndex == 0 ? playlist.length - 1 : (currentIndex - 1))) }} />

                        <Icon name={isPlaying ? 'pause' : 'play'} size={60} color={COLORS.white} onPress={() => { setIsPlaying(!isPlaying), changeStatus() }} />

                        <Icon name="skip-next" size={60} color={COLORS.white} onPress={() => { setIsLoading(true), playAnotherTrack({ item: playlist[Number(currentIndex + 1 == playlist.length ? 0 : (currentIndex + 1))]?.track }), setCurrentIndex(Number(currentIndex + 1 == playlist.length ? 0 : (currentIndex + 1))) }} />

                    </View>
                </LinearGradient>
            </View>))
        )
    }

    function miniPlayer() {
        return (
            (isLoading ? (
                <View style={[styles.songDisplay, { justifyContent: 'center' }]}><ActivityIndicator color={COLORS.green} size={35} /></View>
            ) : (
                <TouchableOpacity onPress={() => setIsPlayerVisible(true)} style={styles.songDisplay}>
                    <Image source={{ uri: (currentTrack?.album?.images[0]?.url ? currentTrack?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 40, width: 40 }} />
                    <View style={{ width: '80%' }}>
                        <Text numberOfLines={1} style={{ color: COLORS.white, marginLeft: 10, fontWeight: '600' }}>{currentTrack?.name}</Text>
                        <Text numberOfLines={1} style={{ color: COLORS.white, marginLeft: 10 }}>{DisplayArtistsName({ names: currentTrack?.artists })} </Text>
                    </View>
                    <Icon name={isPlaying ? 'pause' : 'play'} color={COLORS.white} size={30} style={{ position: 'absolute', right: 10 }} onPress={() => changeStatus()} />
                </TouchableOpacity>
            ))
        )
    }

    return (

        currentTrack && (
            // { isPlayerVisible } ? (AudioPlayer()) : (miniPlayer())
            (isPlayerVisible ? AudioPlayer() : miniPlayer())
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
    },
    player: {
        height: '100%',
        width: '100%',
        zIndex: 100,
        backgroundColor: COLORS.lightBlue,
    }
})

export default SongPlayer