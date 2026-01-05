import { StyleSheet, Text, View, TouchableOpacity, Image, ScrollView, ToastAndroid, Modal } from 'react-native'
import React, { useEffect, useState, useContext } from 'react'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
import { API_BASE_URL } from '../../config/config'
import { AuthContext } from '../../context/AuthContext';
const BASE_URL = API_BASE_URL

const AddtoPlaylist = (props) => {
    const { trackURI } = props.route.params

    const { getAccessToken } = useContext(AuthContext);

    const [loaderVisible, setLoaderVisible] = useState(true)
    const [userplaylists, setUserPlaylists] = useState([])

    useEffect(() => {
        getCurrentUserPlaylist()
    }, [])

    const getParamConfig = () => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    });

    function getCurrentUserPlaylist() {
        try {
            fetch(BASE_URL + '/me/playlists?limit=50', getParamConfig())
                .then((res) => res.json())
                .then((res) => { setUserPlaylists(res?.items), setLoaderVisible(false) })
        } catch (error) {
            console.log(error)
        }
    }

    async function addToPlaylist({ playlistId }) {
        // console.log("playlist id", playlistId)
        let accessToken = getAccessToken();

        try {
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

            setLoaderVisible(true)
            let res = await fetch(`${BASE_URL}/playlists/${playlistId}/tracks`, addParameters)
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
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Add To a Playlist</Text>
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