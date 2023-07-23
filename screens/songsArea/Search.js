import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ScrollView, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Loader from '../../components/Loader'
import { storage } from '../../store/store'

const Search = (props) => {
    // getting access Token from storage
    let accessToken = storage.getString("accessToken")

    // array for displaying search results
    const [allTracks, setAllTracks] = useState([])
    const [allAlbums, setAllAlbums] = useState([])
    const [allArtists, setAllArtists] = useState([])

    // loader Visibility & search vakue
    const [loaderVisible, setLoaderVisible] = useState(false)
    const [searchValue, setSearchValue] = useState('')

    // searching data from backend
    async function searchData() {
        setLoaderVisible(true)

        // parameters for passing to backend 
        let searchParameters = {
            method: 'GET',
            headers: {
                "Content-Type": 'application/json',
                "Authorization": 'Bearer ' + accessToken
            }
        }

        try {

            let res = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=track%2Calbum%2Cartist&limit=20`, searchParameters)
            let resArtist = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=artist&limit=5`, searchParameters)
            res = await res?.json()
            resArtist = await resArtist?.json()

            setAllTracks(res?.tracks?.items)
            setAllAlbums(res?.albums?.items)
            setAllArtists(resArtist?.artists?.items)


            console.log("all results", res)

            // let trackID = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=track`, searchParameters)

            // if (trackID) {

            // }
            // else {
            // let artistID = await fetch(`https://api.spotify.com/v1/search?q=${searchValue}&type=artist`, searchParameters)

            // artistID = await artistID?.json()
            // artistID = artistID?.artists?.items[0]?.id
            // console.log("artist ID", searchValue, artistID)

            // let artistAlbums = await fetch(`https://api.spotify.com/v1/artists/${artistID}/albums?include_groups=album&market=IN`, searchParameters)

            // let artistTracks = await fetch(`https://api.spotify.com/v1/artists/${artistID}/top-tracks?market=IN`, searchParameters)

            // artistAlbums = await artistAlbums?.json()

            // artistTracks = await artistTracks?.json()

            // artistAlbums = artistAlbums.items
            // artistTracks = artistTracks.tracks

            // setArtistAllAlbums(artistAlbums)
            // setArtistAllTracks(artistTracks)
            // }
            setLoaderVisible(false)
        } catch (error) {
            ToastAndroid.show(error.message, 2000)
            setLoaderVisible(false)
        }
    }


    // for displaying artists name
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

    // for displaying albums 
    function DisplayAlbums({ item }) {

        return (
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: item?.images[2]?.url }} style={{ height: item?.images[2]?.height, width: item?.images[2]?.width, marginHorizontal: 15 }} />

                <View style={{ width: '70%' }}>
                    <Text style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item?.type === "album" && "Album ∙ "}</Text>
                        <Text>{displayArtistsName({ names: item?.artists })}</Text>
                    </View>
                </View>

            </View>
        )
    }

    // for displaying tracks
    function DisplayTracks({ item }) {

        return (
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: item?.album?.images[2]?.url }} style={{ height: item?.album?.images[2]?.height, width: item?.album?.images[2]?.width, marginHorizontal: 15 }} />

                <View style={{ width: '70%' }}>
                    <Text style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <Text>{item?.type === "track" ? "Song ∙ " : null}</Text>
                        <Text>{displayArtistsName({ names: item?.artists })}</Text>
                    </View>
                </View>
            </View>
        )
    }

    // for displaying related artists
    function DisplayArtists({ item }) {
        return (
            <View style={{ flexDirection: 'row', marginVertical: 5 }}>
                <Image source={{ uri: (item?.images[2]?.url ? item?.images[2]?.url : 'https://developer.spotify.com/images/guidelines/design/icon1@2x.png') }} style={{ height: 64, width: 64, marginHorizontal: 15 }} />

                <View style={{ width: '70%' }}>
                    <Text style={{ ...FONTS.h4, color: COLORS.white, flexWrap: 'wrap' }}>{item?.name}</Text>
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

    return (
        <View style={{ flex: 1, backgroundColor: 'black', }}>
            {renderHeader()}

            {/* search bar */}
            <View style={{ flexDirection: 'row', marginHorizontal: 15, marginVertical: 5 }}>

                <TextInput placeholder='Search songs,artists and albums' placeholderTextColor={COLORS.gray} style={{ backgroundColor: COLORS.black, borderRadius: SIZES.radius, borderWidth: 1, borderColor: COLORS.white, margin: 5, flex: 1, height: 40 }} value={searchValue} onChangeText={(val) => setSearchValue(val)} />

                <TouchableOpacity style={{ backgroundColor: COLORS.black, marginVertical: 5, justifyContent: 'center', alignItems: 'center' }} onPress={() => searchData()}>
                    <Icon name='card-search' color={COLORS.white} size={40} />
                </TouchableOpacity>

            </View>
            <Loader loaderVisible={loaderVisible} />
            {(allAlbums?.length > 0 || allTracks?.length > 0 || allArtists.length > 0) && <Text style={{ ...FONTS.h2, color: COLORS.white, marginHorizontal: 15 }}>Top Results</Text>}

            {/* displaying results */}
            <ScrollView>
                <View style={{ margin: 5 }}>
                    {allTracks?.map((item, index) => <DisplayTracks item={item} key={index} />)}
                    {allAlbums?.map((item, index) => <DisplayAlbums item={item} key={index} />)}
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