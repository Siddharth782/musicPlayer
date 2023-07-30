import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { COLORS, FONTS } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Audio } from 'expo-av'
import { Player } from '../../components/CurrentStatus'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import Loader from '../../components/Loader'

const Details = (props) => {

    const { id, description, coverImage, name, type } = props.route.params
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))

    const [tracks, setTracks] = useState([])
    const [track, setTrack] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)

    const { currentSong, setCurrentSong, setCurrentTrack, currentTrack, setIsPlaying, setIsLoading, setPlaylistName, setPlaylist, setCurrentIndex, playlist } = useContext(Player)
    setPlaylistName(name)
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

        try {
            fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setTracks(res?.items), setPlaylist(res?.items), setLoaderVisible(false) })
            // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }

    }

    function getSingleTrack() {
        try {
            fetch(`https://api.spotify.com/v1/tracks/${id}`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setTrack(res), setPlaylist([...playlist, res]); setLoaderVisible(false) })
            // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }
    }

    function getAlbumTracks() {
        try {
            fetch(`https://api.spotify.com/v1/albums/${id}/tracks`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setTracks(res?.items), setPlaylist(res?.items), setLoaderVisible(false) })
            // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }

    }

    // for rendering header
    function renderHeader() {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10, top: 15, zIndex: 1, backgroundColor: 'black', borderRadius: 16 }} color={'white'} size={32} />
                <Image source={{ uri: coverImage }} style={{ height: 300, width: '100%', marginVertical: 5 }} />
            </View>
        )
    }

    async function playTrack({ item, id }) {
        console.log("song index", id)
        setCurrentTrack(item)
        setCurrentIndex(id)
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


    function DisplayTracks({ item, id }) {
        // setLoaderVisible(false)
        return (
            <TouchableOpacity onPress={() => { playTrack({ item, id }) }} style={{ flexDirection: 'row' }}>
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


            <View style={{ marginHorizontal: 15, marginTop: 10, marginBottom: (currentTrack ? 58 : 18) }}>
                <Loader loaderVisible={loaderVisible} />
                {type === "playlist" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item.track} key={index} id={index} />)}
                {type === "album" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item} key={index} id={index} />)}
                {type === "track" && track && <DisplayTracks item={track} id={0} />}
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