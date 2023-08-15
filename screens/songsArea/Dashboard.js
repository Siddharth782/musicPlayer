import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import Loader from '../../components/Loader'
const base_URL = 'https://api.spotify.com/v1'
import { useIsFocused } from '@react-navigation/native';

const Dashboard = (props) => {

    const isFocused = useIsFocused();

    // for getting access token
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))

    let emptyImageUrl = 'https://www.google.com/imgres?imgurl=https%3A%2F%2Fe7.pngegg.com%2Fpngimages%2F88%2F561%2Fpng-clipart-yellow-bottom-black-note-icon-music-player-music-player-interface.png&tbnid=qOlEHu-HU7dRxM&vet=12ahUKEwiMvIrI-K6AAxUp3DgGHVOkDm8QMyg-egUIARCGAQ..i&imgrefurl=https%3A%2F%2Fwww.pngegg.com%2Fen%2Fpng-dkvzj&docid=ngZOdOtUS1NxdM&w=900&h=908&q=music%20player%20symbols&ved=2ahUKEwiMvIrI-K6AAxUp3DgGHVOkDm8QMyg-egUIARCGAQ'

    // arrays for storing data
    const [userplaylists, setUserPlaylists] = useState([])
    const [newReleases, setNewReleases] = useState([])
    const [bollywood, setBollywood] = useState([])
    const [workout, setWorkout] = useState([])
    const [kPop, setKPop] = useState([])
    const [party, setParty] = useState([])
    const [mood, setMood] = useState([])
    const [TopTracks, setTopTracks] = useState([])
    const [artists, setArtists] = useState([])

    const [loaderVisible, setLoaderVisible] = useState(true)
    const [name, setName] = useState(storage.getString('Name'))

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
        !name && getCurrentUser()
        TopTracks.length === 0 && getCurrentUserTopTracks()
        artists.length === 0 && getCurrentUserTopArtists()
        newReleases.length === 0 && getNewReleases()
        bollywood.length === 0 && getBollywood()
        kPop.length === 0 && getKPop()
        workout.length === 0 && getWorkOut()
        mood.length === 0 && getMood()
        party.length === 0 && getParty()
    }, [])

    useEffect(() => {
        // console.log("Focused: ", isFocused); //called whenever isFocused changes
        getCurrentUserPlaylist()
    }, [isFocused]);

    async function getCurrentUserTopTracks() {
        fetch(base_URL + '/me/top/tracks?limit=20', dataParameters)
            .then((res) => res.json())
            .then((res) => { setTopTracks(res.items), setLoaderVisible(false) })
        // .then((res) => { console.log("top tracks", res.items), setTopTracks(res.items) })
    }

    async function getCurrentUserTopArtists() {
        fetch(base_URL + '/me/top/artists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setArtists(res?.items) })
        // .then((res) => { console.log("top artists", res?.items), getTopArtistsTracks(res?.items), setArtists(res?.items) })
    }

    async function getCurrentUserPlaylist() {
        fetch(base_URL + '/me/playlists', dataParameters)
            .then((res) => res.json())
            .then((res) => { setUserPlaylists(res?.items) })
        // .then((res) => { console.log("user Playlist", res?.items[1]), setUserPlaylists(res?.items) })
    }

    async function getCurrentUser() {
        fetch(base_URL + '/me', dataParameters)
            .then((res) => res.json())
            .then((res) => { setName(res?.display_name), storage.set('email', res?.email), storage.set('Name', res?.display_name), storage.set("UserId", res?.id) })
        // .then((res) => { console.log(res), setFirstName(res.display_name.split(' ')[0]), storage.set('email', res.email), storage.set('Name', res.display_name) })
    }

    // new Released songs -> India
    async function getNewReleases() {
        fetch(base_URL + '/browse/new-releases?country=IN&limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setNewReleases(res?.albums?.items) })
        // .then((res) => { console.log("new Releases", res), setNewReleases(res?.albums?.items) })

    }

    // bollywood Playlists
    async function getBollywood() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFHCxg5H5PtqW/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setBollywood(res?.playlists?.items) })
        // .then((res) => { console.log("bollywood", res?.playlists?.items), setBollywood(res?.playlists?.items) })
    }

    // Workout playlist
    async function getWorkOut() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFAXlCG6QvYQ4/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setWorkout(res?.playlists?.items) })
        // .then((res) => { console.log("workout", res?.playlists?.items), setWorkout(res?.playlists?.items) })
    }

    // K-Pop Playlist
    async function getKPop() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFGvOw3O4nLAf/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setKPop(res?.playlists?.items) })
        // .then((res) => { console.log("K Pop", res?.playlists?.items), setKPop(res?.playlists?.items) })
    }
    // party playlist
    async function getParty() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFA6SOHvT3gck/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setParty(res?.playlists?.items) })
        // .then((res) => { console.log("party", res?.playlists?.items), setParty(res?.playlists?.items) })
    }

    // moody songs playlist
    async function getMood() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFzHmL4tf05da/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { setMood(res?.playlists?.items) })
        // .then((res) => { console.log("Mood", res?.playlists?.items), setMood(res?.playlists?.items) })
    }

    // Displaying New released Music
    function DisplayNewMusic({ item }) {
        // console.log("favorite artists tracks",item)

        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, description: item?.description, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[{ backgroundColor: COLORS.MidGreen, justifyContent: 'center' }, styles.imageDisplay]}>
                    <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : emptyImageUrl) }} style={styles.imageDisplay} />
                </View>
                <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
                <Text numberOfLines={2} style={{ flexWrap: 'wrap', width: '70%' }}>{DisplayArtistsName({ names: item?.artists })}</Text>
            </TouchableOpacity>
        )
    }

    // For showing playlists -> Bollywood, Mood, Party, K-Pop, Workout
    function DisplayOtherPlaylists({ item }) {

        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, description: item?.description, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[{ backgroundColor: COLORS.MidGreen, justifyContent: 'center' }, styles.imageDisplay]}>
                    <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : emptyImageUrl) }} style={styles.imageDisplay} />
                </View>
                <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
                <Text numberOfLines={2}>{item?.description}</Text>
            </TouchableOpacity>
        )
    }

    // For showing Users Top Artists
    function DisplayArtist({ item }) {

        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[styles.imageDisplay]}>
                    <Image source={{ uri: (item?.images[0]?.url ? item?.images[0]?.url : item?.albums?.images[0]?.url) }} style={[styles.imageDisplay, { borderRadius: 75 }]} />
                </View>
                <View>
                    <Text numberOfLines={1} style={[styles.displayName, { color: COLORS.white }]}>{item?.name}</Text>
                    <Text numberOfLines={1} style={[styles.displayName, { color: COLORS.gray }]}>Artist</Text>
                </View>
            </TouchableOpacity>
        )
    }

    // For showing Users Top Tracks
    function DisplayFavoriteTracks({ item }) {

        return (
            <TouchableOpacity onPress={() => props.navigation.navigate("Details", { id: item?.id, coverImage: item?.album?.images[0]?.url, name: item?.name, type: item?.type })} style={styles.itemStyle}>
                <View style={[{ backgroundColor: COLORS.MidGreen, justifyContent: 'center' }, styles.imageDisplay]}>
                    <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : emptyImageUrl) }} style={styles.imageDisplay} />
                </View>
                <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
                <Text numberOfLines={2}>{DisplayArtistsName({ names: item?.artists })}</Text>
            </TouchableOpacity>
        )
    }

    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1, padding: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text numberOfLines={1} style={{ color: 'white', fontSize: 20 }}>{name ? `Welcome ${name?.split(' ')[0]}` : 'Welcome'}</Text>
                <TouchableOpacity onPress={() => props.navigation.navigate("Settings")}>
                    <Icon name="cog" color={COLORS.white} size={20} />
                </TouchableOpacity>
            </View>

            <Modal transparent={true} visible={loaderVisible}>
                <Loader loaderVisible={loaderVisible} />
            </Modal>

            <View style={{ marginVertical: 20 }}>

                {TopTracks?.length > 0 && (<Text style={styles.header}>Your Favorite</Text>)}
                {TopTracks?.length > 0 && <FlatList data={TopTracks} renderItem={({ item }) => <DisplayFavoriteTracks item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {userplaylists?.length > 0 && (<Text style={styles.header}>Your Playlist</Text>)}
                {userplaylists?.length > 0 && <FlatList data={userplaylists} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {artists?.length > 0 && (<Text style={styles.header}>Your Top Artists</Text>)}
                {artists?.length > 0 && <FlatList data={artists} renderItem={({ item }) => <DisplayArtist item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {newReleases?.length > 0 && (<Text style={styles.header}>New Music</Text>)}
                {newReleases?.length > 0 && <FlatList data={newReleases} renderItem={({ item }) => <DisplayNewMusic item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {bollywood?.length > 0 && (<Text style={styles.header}>Bollywood Masti</Text>)}
                {bollywood?.length > 0 && <FlatList data={bollywood} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {kPop?.length > 0 && (<Text style={styles.header}>K Pop</Text>)}
                {kPop?.length > 0 && <FlatList data={kPop} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {workout?.length > 0 && (<Text style={styles.header}>Workout</Text>)}
                {workout?.length > 0 && <FlatList data={workout} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {mood?.length > 0 && (<Text style={styles.header}>Moody Beats</Text>)}
                {mood?.length > 0 && <FlatList data={mood} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}

                {party?.length > 0 && (<Text style={styles.header}>Party is in Air</Text>)}
                {party?.length > 0 && <FlatList data={party} renderItem={({ item }) => <DisplayOtherPlaylists item={item} />} keyExtractor={(item) => item?.id} horizontal={true} />}


            </View>

        </ScrollView>
    )
}

const styles = StyleSheet.create({
    header: {
        ...FONTS.h3,
        color: COLORS.white,
        marginVertical: 5
    },
    displayName: {
        ...FONTS.h4,
        color: COLORS.white,
        flexWrap: 'wrap'
    },
    itemStyle: {
        margin: 10,
        width: 160
    },
    imageDisplay: {
        height: 150,
        width: 150,
        marginBottom: 5,
        borderRadius: SIZES.radius
    }
})

export default Dashboard