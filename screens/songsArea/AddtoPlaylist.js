import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ToastAndroid, Modal } from 'react-native'
import React, { useEffect, useState } from 'react'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
const base_URL = 'https://api.spotify.com/v1'

const AddtoPlaylist = (props) => {
    const { trackURI } = props.route.params

    const [accessToken, setAccessToken] = useState(storage.getString('accessToken'))
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [userplaylists, setUserPlaylists] = useState([])

    let playlistParameters = {
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        }
    }

    let addParameters = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            uris: [trackURI]
        })
    }

    useEffect(() => {
        getCurrentUserPlaylist()
    }, [])

    function getCurrentUserPlaylist() {
        try {
            fetch(base_URL + '/me/playlists?limit=50', playlistParameters)
                .then((res) => res.json())
                .then((res) => { setUserPlaylists(res?.items), setLoaderVisible(false) })
        } catch (error) {
            console.log(error)
        }
    }

    async function addToPlaylist({ playlistId }) {
        // console.log("playlist id", playlistId)

        try {

            setLoaderVisible(true)
            let res = await fetch(`https://api.spotify.com/v1/playlists/${playlistId}/tracks`, addParameters)
            res = await res.json()

            if (res.snapshot_id) {
                ToastAndroid.show("Song added successfully", 3000)
                props.navigation.goBack()
            }
            else {
                ToastAndroid.show("Please Try again", 3000)

            }
            setLoaderVisible(false)

        } catch (error) {
            ToastAndroid.show(error.message, 3000)
            setLoaderVisible(false)
        }

    }

    // For showing user playlists 
    function DisplayLibrary({ item }) {
        return (
            <TouchableOpacity onPress={() => { addToPlaylist({ playlistId: item?.id }) }} style={styles.itemStyle}>
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

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10, top: 15, zIndex: 1, backgroundColor: 'black', borderRadius: 16 }} color={'white'} size={32} />
                <Text style={styles.header}>Add To a Playlist</Text>
            </View>
        )
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.black }}>
            {renderHeader()}

            <Modal transparent={true} visible={loaderVisible}>
                <Loader loaderVisible={loaderVisible} />
            </Modal>

            {userplaylists?.length > 0 && userplaylists.map((item, index) => <DisplayLibrary item={item} key={index} />)}

        </ScrollView>
    )
}

export default AddtoPlaylist

const styles = StyleSheet.create({
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
    },
    header: {
        ...FONTS.h2,
        color: COLORS.white,
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent:'center',
        backgroundColor:COLORS.gray
    }
})