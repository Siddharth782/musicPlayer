import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ToastAndroid, TextInput } from 'react-native'
import React, { useState } from 'react'
import { storage } from '../../store/store'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { API_BASE_URL } from '../../config/config'
const BASE_URL = API_BASE_URL

const AddPlaylist = (props) => {

    const [accessToken, setAccessToken] = useState(storage.getString("accessToken"))
    const [playlistName, setPlaylistName] = useState('')
    const [playlistDescription, setPlaylistDescription] = useState('')
    const [loaderVisible, setLoaderVisible] = useState(false)

    let userId = storage.getString("UserId")
    
    // for rendering header
    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Create your own Playlist</Text>
            </View>
        )
    }

    // parameters to be passed while creating playlist
    let dataParameters = {
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + accessToken
        },
        body: JSON.stringify({
            name: playlistName,
            description: playlistDescription
        })
    }

    async function createPlaylist() {
        setLoaderVisible(true)
        try {
            let newPlaylist = await fetch(`${BASE_URL}/users/${userId}/playlists`, dataParameters)
            newPlaylist = await newPlaylist.json()

            if (newPlaylist?.snapshot_id) {
                ToastAndroid.show("New Playlist is created", 3000)
                props.navigation.goBack()
            }

        } catch (error) {
            ToastAndroid.show("Error while creating playlist. Try again later", 3000)
        }
        setLoaderVisible(false)

    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: COLORS.black }}>

            {renderHeader()}

            <Loader loaderVisible={loaderVisible} />

            <View style={{ paddingHorizontal: 15 }}>

                <TextInput placeholder='Playlist Name' placeholderTextColor={COLORS.gray} value={playlistName} style={{ borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1, borderColor: COLORS.white, marginVertical: 15 }} onChangeText={(val) => setPlaylistName(val)} />

                <TextInput multiline={true} placeholder='Playlist Description' placeholderTextColor={COLORS.gray} value={playlistDescription} style={{ borderRadius: SIZES.radius, paddingHorizontal: 15, borderWidth: 1, borderColor: COLORS.white, marginVertical: 15 }} onChangeText={(val) => setPlaylistDescription(val)} />

                <TouchableOpacity onPress={() => createPlaylist()} style={{ ...FONTS.h3, backgroundColor: COLORS.white, borderRadius: SIZES.radius * 2, justifyContent: 'center', alignItems: 'center', width: '60%', alignSelf: 'center', marginVertical: 20 }}>
                    <Text style={{ ...FONTS.h2, color: COLORS.black }}>Create Playlist</Text>
                </TouchableOpacity>
            </View>

        </ScrollView>

    )
}

export default AddPlaylist

const styles = StyleSheet.create({
    header: {
        height: 50,
        zIndex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
        marginBottom: 20,
        backgroundColor: COLORS.gray
    }
})