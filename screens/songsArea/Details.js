import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { COLORS, FONTS } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Audio } from 'expo-av'
import { Player } from '../../components/CurrentStatus'
import { DisplayArtistsName } from '../../components/DisplayArtistName'

const Details = (props) => {

    const { id, description, coverImage, name, type } = props.route.params
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))

    const [tracks, setTracks] = useState([])

    const { currentSong, setCurrentSong, setCurrentTrack, currentTrack, setIsPlaying, setIsLoading } = useContext(Player)

    let dataParameters = {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        }
    }

    useEffect(() => {
        type === "playlist" && tracks.length === 0 && getPlaylistTracks()
        type === "album" && tracks.length === 0 && getAlbumTracks()
        type === "track" && tracks.length === 0 && getSingleTrack()
    }, [])

    function getPlaylistTracks() {
        fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, dataParameters)
            .then((res) => res.json())
            .then((res) => { setTracks(res?.items) })
        // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
    }

    function getSingleTrack() {
        fetch(`https://api.spotify.com/v1/tracks/${id}`, dataParameters)
            .then((res) => res.json())
            .then((res) => { setTracks(res) })
        // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
    }

    function getAlbumTracks() {
        fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, dataParameters)
            .then((res) => res.json())
            .then((res) => { setTracks(res?.items) })
        // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
    }

    // for rendering header
    function renderHeader() {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Dashboard")} style={{ position: 'absolute', left: 10, top: 15, zIndex: 1, backgroundColor: 'black', borderRadius: 16 }} color={'white'} size={32} />
                <Image source={{ uri: coverImage }} style={{ height: 300, width: '100%', marginVertical: 5 }} />
            </View>
        )
    }

    async function playTrack({ item }) {
        setCurrentTrack(item)
        setIsLoading(true)

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


    function DisplayTracks({ item }) {
        return (
            <TouchableOpacity onPress={() => { playTrack({ item }) }} style={{ flexDirection: 'row' }}>
                <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 60, width: 60, margin: 5 }} />
                <View style={{ justifyContent: 'center', marginLeft: 10, width: '70%' }}>
                    <Text numberOfLines={1} style={[styles.displayName, { color: (currentTrack?.id === item?.id ? COLORS.MidGreen : COLORS.white) }]}>{item?.name}</Text>
                    <Text numberOfLines={1}>{DisplayArtistsName({ names: item?.artists })}</Text>
                </View>
            </TouchableOpacity>
        )
    }

    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1 }}>
            {renderHeader()}

            <Text style={{ marginHorizontal: 15, ...FONTS.h2, color: 'white' }}>{name}</Text>
            <Text style={{ marginHorizontal: 15 }}>{description}</Text>

            <View style={{ marginHorizontal: 15, marginTop: 10, marginBottom: (currentTrack?58:18) }}>
                {type === "playlist" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item.track} key={index} />)}
                {type === "album" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item} key={index} />)}
                {type === "track" && <DisplayTracks item={tracks} />}
            </View>
        </ScrollView>

    )
}

export default Details

const styles = StyleSheet.create({
    displayName: {
        ...FONTS.h3
    },
})