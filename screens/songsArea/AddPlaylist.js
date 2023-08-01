import { StyleSheet, Text, View, ScrollView, Image, TouchableOpacity, ToastAndroid, TextInput } from 'react-native'
import React, { useState } from 'react'
import { storage } from '../../store/store'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const AddPlaylist = (props) => {

    const [accessToken, setAccessToken] = useState(storage.getString("accessToken"))
    const [playlistName, setPlaylistName] = useState('')
    const [playlistDescription, setPlaylistDescription] = useState('')
    const [loaderVisible, setLoaderVisible] = useState(false)

    let userId = storage.getString("UserId")
    console.log(userId)
    // for rendering header
    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={{ position: 'absolute', left: 10, top: 9, zIndex: 1, backgroundColor: 'black', borderRadius: 16 }} color={'white'} size={32} />
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

    function createPlaylist() {
        setLoaderVisible(true)
        try {
            fetch(`https://api.spotify.com/v1/users/${userId}/playlists`, dataParameters)
                .then((res) => res.json())
                .then((res) => { console.log("playlist ", res), setLoaderVisible(false) })
        } catch (error) {

        }
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