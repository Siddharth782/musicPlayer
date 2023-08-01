import { StyleSheet, Text, View, ScrollView, TouchableOpacity, Image } from 'react-native'
import React, { useState, useEffect, useContext } from 'react'
import { storage } from '../../store/store'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import { Player } from '../../components/CurrentStatus'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
const base_URL = 'https://api.spotify.com/v1'

const Library = (props) => {

    // for getting access token
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))
    const { currentTrack } = useContext(Player)

    let emptyImageUrl = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F88%2F561%2Fpng-clipart-yellow-bottom-black-note-icon-music-player-music-player-interface.png&tbnid=qOlEHu-HU7dRxM&vet=12ahUKEwiMvIrI-K6AAxUp3DgGHVOkDm8QMyg-egUIARCGAQ..i&imgrefurl=https%3A%2F%2Fwww.pngegg.com%2Fen%2Fpng-dkvzj&docid=ngZOdOtUS1NxdM&w=900&h=908&q=music%20player%20symbols&ved=2ahUKEwiMvIrI-K6AAxUp3DgGHVOkDm8QMyg-egUIARCGAQ'

    // arrays for storing data
    const [user, setUser] = useState(null)
    const [userplaylists, setUserPlaylists] = useState([])
    const [userAlbums, setUserAlbums] = useState([])
    const [artists, setArtists] = useState([])
    const [selected, setSelected] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)

    // parameters to be passed while getting songs
    let dataParameters = {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        }
    }

    // fetching songs thru API
    useEffect(() => {
        getCurrentUser()
        userplaylists.length === 0 && getCurrentUserPlaylist()
        userAlbums.length === 0 && getCurrentUserAlbums()
        artists.length === 0 && getCurrentUserTopArtists()
    }, [])

    async function getCurrentUserPlaylist() {
        fetch(base_URL + '/me/playlists?limit=50', dataParameters)
            .then((res) => res.json())
            .then((res) => { setUserPlaylists(res?.items) })
        // .then((res) => { console.log("user Playlist", res?.items[1]), setUserPlaylists(res?.items) })
    }

    async function getCurrentUserAlbums() {
        fetch(base_URL + '/me/albums?limit=50', dataParameters)
            .then((res) => res.json())
            .then((res) => { setUserAlbums(res?.items) })
        // .then((res) => { console.log("user Playlist", res?.items[1]), setUserPlaylists(res?.items) })
    }

    async function getCurrentUserTopArtists() {
        fetch(base_URL + '/me/top/artists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setArtists(res?.items), setLoaderVisible(false) })
        // .then((res) => { console.log("top artists", res?.items), getTopArtistsTracks(res?.items), setArtists(res?.items) })
    }


    async function getCurrentUser() {
        fetch(base_URL + '/me', dataParameters)
            .then((res) => res.json())
            .then((res) => { setUser(res) })
        // .then((res) => { console.log(res), setFirstName(res.display_name.split(' ')[0]), storage.set('email', res.email), storage.set('Name', res.display_name) })
    }

    // For showing playlists -> Bollywood, Mood, Party, K-Pop, Chill, Workout
    function DisplayLibrary({ item }) {
        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[styles.imageDisplay]}>
                    <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : emptyImageUrl) }} style={styles.imageDisplay} />
                </View>
                <View style={{ justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={[styles.displayName, { color: COLORS.white }]}>{item?.name}</Text>
                    {item?.type === "album" && <Text numberOfLines={1} style={styles.displayName}>Album ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    {item?.type === "playlist" && <Text numberOfLines={1} style={styles.displayName}>Playlist ∙ {item?.owner?.display_name}</Text>}
                    {/* <Text numberOfLines={1} style={styles.displayName}>{ item?.type === "album" ? "Album" : "Playlist" } ∙ {DisplayArtistsName({ names: item?.artists })}</Text> */}
                </View>
            </TouchableOpacity>
        )
    }

    // For showing playlists -> Bollywood, Mood, Party, K-Pop, Chill, Workout
    function DisplayArtist({ item }) {

        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[styles.imageDisplay]}>
                    <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : item?.albums?.images[0]?.url) }} style={[styles.imageDisplay, { borderRadius: 42 }]} />
                </View>
                <View>

                    <Text numberOfLines={1} style={[styles.displayName, { color: COLORS.white }]}>{item?.name}</Text>
                    <Text numberOfLines={1} style={styles.displayName}>Artist</Text>
                </View>
            </TouchableOpacity>
        )
    }

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Image source={{ uri: user?.images?.[0]?.url }} style={{ height: 40, width: 40, borderRadius: 20, marginHorizontal: 10 }} />
                <Text style={styles.header}>Your Library</Text>
            </View>
        )
    }


    const filter = () => {
        return (
            <View style={styles.filter}>
                <TouchableOpacity style={[styles.filterOption, (selected === "Playlist" && styles.filterOptionSelected)]} onPress={() => setSelected("Playlist")}>
                    <Text style={styles.filterText}>Playlists</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, (selected === "Album" && styles.filterOptionSelected)]} onPress={() => setSelected("Album")}>
                    <Text style={styles.filterText}>Albums</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, (selected === "Artist" && styles.filterOptionSelected)]} onPress={() => setSelected("Artist")}>
                    <Text style={styles.filterText}>Artists</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.filterOption, { alignItems: 'center' }]} onPress={() => setSelected(null)}>
                    <Icon name="close" size={20} />
                </TouchableOpacity>
            </View>
        )
    }

    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1, padding: 5 }} showsVerticalScrollIndicator={false}>
            {user && renderHeader()}
            {filter()}
            <Loader loaderVisible={loaderVisible} />
            <View style={{ marginHorizontal: 5, marginTop: 10, marginBottom: (currentTrack ? 58 : 18) }}>
                {(!selected || selected === "Playlist") && userplaylists?.length > 0 && userplaylists.map((item, index) => <DisplayLibrary item={item} key={index} />)}
                {(!selected || selected === "Album") && userAlbums?.length > 0 && userAlbums.map((item, index) => <DisplayLibrary item={item?.album} key={index} />)}
                {(!selected || selected === "Artist") && artists?.length > 0 && artists.map((item, index) => <DisplayArtist item={item} key={index} />)}
                <TouchableOpacity style={styles.itemStyle} onPress={() => props.navigation.navigate("AddPlaylist")} >
                    <Image source={{ uri: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ86LSDwsXoZ75Vv_WovFUiowRTQO4a0HPFUw&usqp=CAU" }} style={[styles.imageDisplay, { height: 20, width: 20, marginLeft: 35, marginRight: 45 }]} />
                    <Text style={[styles.filterText, { ...FONTS.h3 }]}>Add Playlist</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

export default Library

const styles = StyleSheet.create({
    header: {
        ...FONTS.h2,
        color: COLORS.white,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    displayName: {
        ...FONTS.h4,
        flexWrap: 'wrap'
    },
    filter: {
        flexDirection: 'row',
        marginVertical: 5
    },
    filterOption: {
        borderWidth: 1,
        borderRadius: SIZES.radius * 2,
        borderColor: COLORS.violet,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    filterText: {
        color: COLORS.white
    },
    filterOptionSelected: {
        borderWidth: 1,
        borderRadius: SIZES.radius * 2,
        borderColor: COLORS.green,
        elevation: 7,
        shadowColor: COLORS.darkGreen,
        backgroundColor: COLORS.violet,
    },
    itemStyle: {
        margin: 10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center'
    },
    imageDisplay: {
        height: 84,
        width: 84,
        marginRight: 15,
        borderRadius: SIZES.radius
    }
})