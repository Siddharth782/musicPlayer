import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, ToastAndroid } from 'react-native'
import React, { useState, useContext } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Loader from '../../components/Loader'
import { storage } from '../../store/store'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import { Player } from '../../components/CurrentStatus'
import { Audio } from 'expo-av'

const Search = (props) => {
    // getting access Token from storage
    let accessToken = storage.getString("accessToken")

    const { currentSong, setCurrentSong, setCurrentTrack, currentTrack, setIsPlaying, setIsLoading } = useContext(Player)

    // array for displaying search results
    const [allTracks, setAllTracks] = useState([])
    const [allPlaylist, setAllPlaylist] = useState([])
    const [allAlbum, setAllAlbum] = useState([])
    const [allArtists, setAllArtists] = useState([])

    // loader Visibility & search vakue
    const [loaderVisible, setLoaderVisible] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    // searching data from backend
    async function searchData() {
        setLoaderVisible(true)
        setAllAlbum([])
        setAllTracks([])
        setAllArtists([])
        setAllPlaylist([])

        // parameters for passing to backend 
        let searchParameters = {
            method: 'GET',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Bearer ' + accessToken
            }
        }

        try {

            let resTracks = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=track&limit=20`, searchParameters)
            let res = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=album%2Cplaylist&limit=10`, searchParameters)
            let resArtist = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=artist&limit=5`, searchParameters)
            res = await res?.json()
            resTracks = await resTracks?.json()
            resArtist = await resArtist?.json()

            setAllTracks(resTracks?.tracks?.items)
            setAllPlaylist(res?.playlists?.items)
            setAllAlbum(res?.albums?.items)
            setAllArtists(resArtist?.artists?.items)


            // console.log("all results", resTracks)

            setLoaderVisible(false)
        } catch (error) {
            ToastAndroid.show(error.message, 2000)
            setLoaderVisible(false)
        }
    }

    // for displaying playlist 
    function DisplayPlaylistsandAlbums({ item }) {
        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, description: item?.description, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 64, width: 64, marginHorizontal: 15 }} />

                <View style={{ width: '65%' }}>
                    <Text numberOfLines={1} style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item?.type === "playlist" && "Playlist"}</Text>
                        <Text>{item?.type === "album" && "Album ∙ "}</Text>
                        <Text numberOfLines={1}>{DisplayArtistsName({ names: item?.artists })}</Text>
                    </View>
                </View>

            </TouchableOpacity>
        )
    }

    // for displaying tracks
    function DisplayTracks({ item }) {

        return (
            <TouchableOpacity onPress={() => { playTrack({ item }) }} style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 64, width: 64, marginHorizontal: 15 }} />

                <View style={{ width: '65%' }}>
                    <Text numberOfLines={1} style={{ ...FONTS.h4, color: (currentTrack?.id === item?.id ? COLORS.MidGreen : COLORS.white), flexWrap: 'wrap' }}>{item?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item?.type === "track" ? "Song ∙ " : null}</Text>
                        <Text numberOfLines={1}>{DisplayArtistsName({ names: item?.artists })}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    // for displaying related artists
    function DisplayArtists({ item }) {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png') }} style={{ height: 64, width: 64, marginHorizontal: 15 }} />

                <View style={{ width: '70%' }}>
                    <Text numberOfLines={1} style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
                    <Text>{item?.type === "artist" ? "Artist" : null}</Text>
                </View>
            </View>
        )
    }

    // for rendering header
    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Dashboard")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Search</Text>
            </View>
        )
    }

    // For playing selected track
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

            const { sound } = await Audio.Sound.createAsync(
                {
                    uri: song_url
                }
            )

            setCurrentSong(sound)
            setIsPlaying(true)
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

    return (
        <View style={{ flex: 1, backgroundColor: 'black', }}>
            {renderHeader()}

            {/* search bar */}
            <View style={{ flexDirection: 'row', marginHorizontal: 15, marginVertical: 5, alignItems:'center' }}>

                <View style={{ backgroundColor: COLORS.black, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.white,flex: 1, height: 40, justifyContent:'center' }} >
                    <TextInput placeholder='Search songs,artists and playlists' placeholderTextColor={COLORS.gray} value={searchValue} style={{paddingLeft:5}} onChangeText={(val) => setSearchValue(val)} />
                    <Icon name='close' size={20} color={COLORS.white} onPress={() => setSearchValue('')} style={{position:'absolute', right:10, alignSelf:'center'}} />
                </View>

                <TouchableOpacity style={{ backgroundColor: COLORS.black, marginVertical: 5, justifyContent: 'center', alignItems: 'center' }} onPress={() => searchData()}>
                    <Icon name='card-search' color={COLORS.white} size={40} />
                </TouchableOpacity>

            </View>

            {(allPlaylist?.length > 0 || allTracks?.length > 0 || allArtists?.length > 0) && <Text style={{ ...FONTS.h2, color: COLORS.white, marginHorizontal: 15 }}>Top Results</Text>}
            {/* displaying results */}
            <ScrollView>
                <Loader loaderVisible={loaderVisible} />
                <View style={{ marginBottom: 50, marginHorizontal: 5 }}>
                    {allTracks?.map((item, index) => <DisplayTracks item={item} key={index} />)}
                    {allAlbum?.map((item, index) => <DisplayPlaylistsandAlbums item={item} key={index} />)}
                    {allPlaylist?.map((item, index) => <DisplayPlaylistsandAlbums item={item} key={index} />)}
                    {allArtists?.map((item, index) => <DisplayArtists item={item} key={index} />)}
                </View>
            </ScrollView>

        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 50,
        zIndex: 1,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.gray
    },
})

export default Search