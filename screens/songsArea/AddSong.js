import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, ToastAndroid } from 'react-native'
import React, { useState, useEffect } from 'react'
import { storage } from '../../store/store'
import Loader from '../../components/Loader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, SIZES, FONTS } from '../../constants/theme'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import { API_BASE_URL } from '../../config/config'
const BASE_URL = API_BASE_URL;

const AddSong = (props) => {
    const { playListId } = props?.route?.params


    const [allTracks, setAllTracks] = useState([])
    const [recentlyPlayed, setRecentlyPlayed] = useState(null)
    const [recommendations, setRecommendations] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))
    const [searchValue, setSearchValue] = useState('')

    useEffect(() => {
        !recommendations && getRecommendations()
        !recentlyPlayed && getRecentlyPlayed()
    }, [])

    let dataParameters = {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        }
    }

    // when only 1 track is selected
    function getRecommendations() {
        try {
            fetch(`${BASE_URL}/recommendations?seed_genres=rock,mood,workout`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setLoaderVisible(false), setRecommendations(res?.tracks) })
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }
    }

    // when only 1 track is selected
    function getRecentlyPlayed() {
        try {
            fetch(`${BASE_URL}/me/player/recently-played`, dataParameters)
                .then((res) => res.json())
                .then((res) => { setLoaderVisible(false), setRecentlyPlayed(res?.items) })
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }
    }


    // searching data from backend
    async function searchData() {
        setLoaderVisible(true)
        setAllTracks([])

        // parameters for passing to backend 
        let searchParameters = {
            method: 'GET',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Bearer ' + accessToken
            }
        }

        try {

            let resTracks = await fetch(`${BASE_URL}/search?q=${searchValue}&type=track&limit=10`, searchParameters)
            resTracks = await resTracks?.json()

            setAllTracks(resTracks?.tracks?.items)

            setLoaderVisible(false)

        } catch (error) {
            ToastAndroid.show(error.message, 2000)
            setLoaderVisible(false)
        }
    }

    async function addTrackToPlaylist({ songUri }) {

        let addingParameters = {
            method: 'POST',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Bearer ' + accessToken
            },
            body: JSON.stringify({
                "uris": [songUri],
                "position": 0
            })
        }

        try {
            let addTrack = await fetch(`${BASE_URL}/playlists/${playListId}/tracks`, addingParameters)
            addTrack = await addTrack.json()
            console.log("adding res", addTrack)

            if (addTrack.snapshot_id) {
                ToastAndroid.show("Song added Successfully", 500)
            }
            else {
                ToastAndroid.show("Please Try again", 3000)
            }

        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        }

    }

    // for displaying tracks
    function DisplayTracks({ item }) {

        return (
            <TouchableOpacity onPress={() => { addTrackToPlaylist({ songUri: item?.uri }) }} style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 64, width: 64, marginHorizontal: 15 }} />

                <View style={{ width: '65%' }}>
                    <Text numberOfLines={1} style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item?.type === "track" ? "Song ∙ " : null}</Text>
                        <Text numberOfLines={1}>{DisplayArtistsName({ names: item?.artists })}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        )
    }

    // for rendering header
    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Add Songs</Text>
            </View>
        )
    }

    return (
        <View style={{ flex: 1, backgroundColor: 'black', }}>
            {renderHeader()}
            {/* search bar */}
            <View style={{ flexDirection: 'row', marginHorizontal: 10, marginVertical: 5, alignItems: 'center' }}>

                <View style={{ backgroundColor: COLORS.black, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.white, flex: 1, height: 40, justifyContent: 'center' }} >
                    <TextInput placeholder='Search Songs' placeholderTextColor={COLORS.gray} value={searchValue} style={{ paddingLeft: 5 }} onChangeText={(val) => setSearchValue(val)} />
                    <Icon name='close' size={20} color={COLORS.white} onPress={() => setSearchValue('')} style={{ position: 'absolute', right: 10, alignSelf: 'center' }} />
                </View>

                <TouchableOpacity style={{ backgroundColor: COLORS.black, marginVertical: 5, justifyContent: 'center', alignItems: 'center' }} onPress={() => searchData()}>
                    <Icon name='card-search' color={COLORS.white} size={40} />
                </TouchableOpacity>

            </View>

            <ScrollView>
                <Loader loaderVisible={loaderVisible} />
                <View style={{ marginHorizontal: 10 }}>
                    {allTracks?.map((item, index) => <DisplayTracks item={item} key={index} />)}

                    {recentlyPlayed !== null && <Text style={{ color: COLORS.white }}>Recently Played</Text>}
                    {recentlyPlayed?.map((item, index) => <DisplayTracks item={item?.track} key={index} />)}

                    {recommendations !== null && <Text style={{ color: COLORS.white }}>Recommendations</Text>}
                    {recommendations?.map((item, index) => <DisplayTracks item={item} key={index} />)}

                </View>
            </ScrollView>

        </View>
    )
}

export default AddSong

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