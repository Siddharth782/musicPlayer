import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, ToastAndroid, ActivityIndicator } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Audio } from 'expo-av'
import { Player } from '../../components/CurrentStatus'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import Loader from '../../components/Loader'
import BottomUpModal from '../../components/BottomUpModal'

const Details = (props) => {

    const { id, description, coverImage, name, type } = props.route.params
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))

    const [totalTracks, setTotalTracks] = useState(null)
    const [tracks, setTracks] = useState([])
    const [artistTracks, setArtistTracks] = useState([])
    const [artistAlbums, setArtistAlbums] = useState([])
    const [track, setTrack] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)

    const [selectedSong, setSelectedSong] = useState(null)

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
        name === "Favorite" && tracks.length === 0 && getSavedTracks()
        type === "playlist" && tracks.length === 0 && getPlaylistTracks()
        type === "album" && tracks.length === 0 && getAlbumTracks()
        type === "track" && track?.length === 0 && getSingleTrack()
        type === "artist" && tracks.length === 0 && getArtistsTracks()
    }, [])

    function getPlaylistTracks() {

        try {
            fetch(`https://api.spotify.com/v1/playlists/${id}/tracks`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setTracks(res?.items), setPlaylist(res?.items), setLoaderVisible(false), setTotalTracks(res?.items?.length), console.log("playlist", res) })
            // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }

    }

    function getSavedTracks() {

        try {
            fetch(`https://api.spotify.com/v1/me/tracks?limit=50`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setTracks(res?.items), setTotalTracks(res?.total) })
            // .then((res) => {console.log("track response album",res?.items[0].track.album), console.log("track response artist",res?.items[0].track.artists)})
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }

    }

    function getArtistsTracks() {

        try {
            fetch(`https://api.spotify.com/v1/artists/${id}/top-tracks?country=IN&limit=15`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setArtistTracks(res?.tracks), setLoaderVisible(false) })
            fetch(`https://api.spotify.com/v1/artists/${id}/albums?country=IN&limit=15`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setArtistAlbums(res?.items), setLoaderVisible(false) })
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
                <Image source={{ uri: (coverImage ? coverImage : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 300, width: '100%', marginVertical: 5 }} />
            </View>
        )
    }

    async function playTrack({ item, id }) {
        // console.log("song index", id)
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

                <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : (item?.images?.[0].url ? item?.images?.[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png")) }} style={styles.displayImage} />

                <View style={{ alignItems: 'center', flexDirection: 'row', justifyContent: 'space-between', marginLeft: 10, flex: 1 }}>
                    <View style={{ flex: 1 }}>
                        <Text numberOfLines={1} style={[styles.displayName, { color: (currentTrack?.id === item?.id ? COLORS.MidGreen : COLORS.white) }]}>{item?.name}</Text>
                        {item?.type === "track" && <Text numberOfLines={1}>Track ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                        {item?.type === "album" && <Text numberOfLines={1}>Album ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                        {item?.type === "playlist" && <Text numberOfLines={1}>Playlist ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    </View>
                    {item?.type === "track" && <TouchableOpacity style={{ paddingHorizontal: 5 }} onPress={() => { setSelectedSong(item), setModalVisible(true) }} >
                        <Icon size={20} name="dots-vertical" color={COLORS.white} />
                    </TouchableOpacity>}
                </View>
            </TouchableOpacity>
        )
    }

    function renderOptions() {
        let item = selectedSong

        return (
            <View style={{ padding: 5, margin: 5, flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : item?.images?.[0].url) }} style={styles.displayImage} />
                    <Text numberOfLines={1} style={{marginVertical:3, ...FONTS.h2, color: COLORS.white }}>{item?.name}</Text>
                    <Text numberOfLines={1} style={{marginVertical:3, ...FONTS.h4 }}>{DisplayArtistsName({ names: item?.artists })}</Text>
                </View>

                <View>
                    <TouchableOpacity style={styles.Options}>
                        <Icon name="cards-heart-outline" size={20} color={COLORS.white} />
                        <Text style={{ color: COLORS.white, marginHorizontal: 10, fontSize: 18 }}>
                            Like
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => props.navigation.navigate("AddtoPlaylist", { trackURI: item?.uri })}>
                        <Icon name="playlist-music" size={20} color={COLORS.white} />
                        <Text style={{ color: COLORS.white, marginHorizontal: 10, fontSize: 18 }}>
                            Add to Playlist
                        </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options}>
                        <Icon name="disc" size={20} color={COLORS.white} />
                        <Text style={{ color: COLORS.white, marginHorizontal: 10, fontSize: 18 }}>
                            View Album
                        </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }

    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1 }} showsVerticalScrollIndicator={false}>
            {renderHeader()}

            <Text style={{ marginHorizontal: 15, ...FONTS.h2, color: 'white' }}>{name}</Text>
            <Text style={{ marginHorizontal: 15 }}>{description}</Text>
            {totalTracks && <View style={{ alignItems: 'center', margin: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                {totalTracks && <Text style={{ ...FONTS.h3, color: COLORS.white }} > {totalTracks} tracks</Text>}
                <Icon name="play" style={{ borderRadius: 20, backgroundColor: COLORS.MidGreen }} onPress={() => playTrack({ item: playlist?.[0]?.track, id: 0 })} size={40} />
            </View>}

            <View style={{ marginHorizontal: 15, marginTop: 10, marginBottom: (currentTrack ? 58 : 18) }}>
                <Loader loaderVisible={loaderVisible} />
                {type === "playlist" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item.track} key={index} id={index} />)}
                {type === "album" && tracks?.length > 0 && tracks.map((item, index) => <DisplayTracks item={item} key={index} id={index} />)}
                {type === "track" && track && <DisplayTracks item={track} id={0} />}
                {type === "artist" && artistTracks?.length > 0 && artistTracks.map((item, index) => <DisplayTracks item={item} key={index} id={index} />)}
                {type === "artist" && artistAlbums?.length > 0 && artistAlbums.map((item, index) => <DisplayTracks item={item} key={index} id={index} />)}
            </View>

            {modalVisible && (
                <BottomUpModal
                    isVisible={modalVisible}
                    onClose={() => {
                        setModalVisible(false);
                    }}
                    visibleHeight={350}>
                    {renderOptions()}
                </BottomUpModal>
            )}

        </ScrollView >

    )
}

export default Details

const styles = StyleSheet.create({
    displayName: {
        ...FONTS.h3
    },
    displayImage: {
        height: 100,
        width: 100,
        margin: 5,
        borderRadius: SIZES.radius
    },
    Options: {
        flexDirection: 'row', 
        alignItems: 'center', 
        marginHorizontal: 10,
        marginVertical:5
    }
})