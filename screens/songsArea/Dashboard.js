import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image, FlatList } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, FONTS } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const base_URL = 'https://api.spotify.com/v1'

const Dashboard = (props) => {
    // for getting access token
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))

    // arrays for storing data
    const [newReleases, setNewReleases] = useState([])
    const [bollywood, setBollywood] = useState([])
    const [workout, setWorkout] = useState([])
    const [kPop, setKPop] = useState([])
    const [party, setParty] = useState([])
    const [hipHop, setHipHop] = useState([])
    const [chill, setChill] = useState([])
    const [mood, setMood] = useState([])

    // Name variable
    const userName = storage.getString('Name')
    let firstName = userName?.split(' ')[0]

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
        getNewReleases()
        getBollywood()
        getKPop()
        getWorkOut()
        getMood()
        getChill()
        getParty()
        getHipHop()
    }, [])

    // new Released songs -> India
    async function getNewReleases() {
        fetch(base_URL + '/browse/new-releases?country=IN&limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("new Releases", res), setNewReleases(res?.albums?.items) })
    }

    // bollywood Playlists
    async function getBollywood() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFHCxg5H5PtqW/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("bollywood", res.playlists.items), setBollywood(res?.playlists?.items) })
    }

    // Workout playlist
    async function getWorkOut() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFAXlCG6QvYQ4/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("workout", res.playlists.items), setWorkout(res?.playlists?.items) })
    }

    // K-Pop Playlist
    async function getKPop() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFGvOw3O4nLAf/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("K Pop", res.playlists.items), setKPop(res?.playlists?.items) })
    }
    // party playlist
    async function getParty() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFA6SOHvT3gck/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("party", res.playlists.items), setParty(res?.playlists?.items) })
    }

    // hip hop playlist
    async function getHipHop() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFQ00XGBls6ym/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("HipHop", res.playlists.items), setHipHop(res?.playlists?.items) })
    }

    // chill playlist
    async function getChill() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFFzDl7qN9Apr/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("Chill", res.playlists.items), setChill(res?.playlists?.items) })
    }

    // moody songs playlist
    async function getMood() {
        fetch(base_URL + '/browse/categories/0JQ5DAqbMKFzHmL4tf05da/playlists?limit=10', dataParameters)
            .then((res) => res.json())
            .then((res) => { console.log("Mood", res.playlists.items), setMood(res?.playlists?.items) })
    }

    // for displaying Artist Name(s)
    function displayArtistsName({ names }) {
        let artistName = ''

        for (let index = 0; index < names?.length; index++) {
            const element = names[index];
            if (index === 0) {
                artistName += element.name
            }
            else { artistName += ", ", artistName += element.name }
        }

        artistName = artistName.length > 25 ? `${artistName.slice(0, 25)}...` : artistName
        return artistName
    }

    // Displaying New released Music
    function DisplayNewMusic({ item }) {

        return (
            <View style={styles.itemStyle}>
                <Image source={{ uri: item?.images[0]?.url }} style={{ height: 150, width: 150, marginVertical: 5 }} />
                <Text style={styles.displayName}>{item?.name}</Text>
                <Text style={{ flexWrap: 'wrap', width: '70%' }}>{displayArtistsName({ names: item?.artists })}</Text>
            </View>
        )
    }

    // For showing playlists -> Bollywood, Mood, Party, K-Pop, Chill, Workout, Hip-Hop 
    function DisplayOthers({ item }) {

        return (
            <View style={styles.itemStyle}>
                <Image source={{ uri: item?.images[0]?.url }} style={{ height: 150, width: 150, marginVertical: 5 }} />
                <Text style={styles.displayName}>{item?.name?.length > 20 ? `${item?.name.slice(0, 20)}...` : item?.name}</Text>
                <Text>{item?.description?.length > 30 ? `${item?.description?.slice(0, 30)}...` : item?.description}</Text>
            </View>
        )
    }


    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1, padding: 15 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 20 }}>Welcome {firstName}</Text>
                <TouchableOpacity onPress={() => props.navigation.navigate("Settings")}>
                    <Icon name="cog" color={COLORS.white} size={20} />
                </TouchableOpacity>
            </View>

            <View style={{ marginVertical: 20 }}>

                {newReleases.length > 0 && (<Text style={styles.header}>New Music</Text>)}
                {newReleases.length > 0 && <FlatList data={newReleases} renderItem={({ item }) => <DisplayNewMusic item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {bollywood.length > 0 && (<Text style={styles.header}>Bollywood Masti</Text>)}
                {bollywood.length > 0 && <FlatList data={bollywood} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {kPop.length > 0 && (<Text style={styles.header}>K Pop</Text>)}
                {kPop.length > 0 && <FlatList data={kPop} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {workout.length > 0 && (<Text style={styles.header}>Workout</Text>)}
                {workout.length > 0 && <FlatList data={workout} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {mood.length > 0 && (<Text style={styles.header}>Moody Beats</Text>)}
                {mood.length > 0 && <FlatList data={mood} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {chill.length > 0 && (<Text style={styles.header}>Chillinggg!</Text>)}
                {chill.length > 0 && <FlatList data={chill} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {party.length > 0 && (<Text style={styles.header}>Party is in Air</Text>)}
                {party.length > 0 && <FlatList data={party} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

                {hipHop.length > 0 && (<Text style={styles.header}>Hip Hop</Text>)}
                {hipHop.length > 0 && <FlatList data={hipHop} renderItem={({ item }) => <DisplayOthers item={item} />} keyExtractor={(item) => item.id} horizontal={true} />}

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
        marginVertical: 10,
        marginRight: 5,
        width: 160
    }
})

export default Dashboard