import { StyleSheet, Text, View, TouchableOpacity, ToastAndroid, TextInput, KeyboardAvoidingView, BackHandler } from 'react-native'
import React, { useState, useContext, useCallback, useEffect, useRef } from 'react'
import { storage } from '../../store/store'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Loader from '../../components/Loader'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AuthContext } from '../../context/AuthContext';
import { fetchWithAuthRetry } from '../../components/APIService'

const AddPlaylist = (props) => {

    const { getAccessToken, clearAuth } = useContext(AuthContext);
    const [playlistName, setPlaylistName] = useState('')
    const [playlistDescription, setPlaylistDescription] = useState('')
    const [loaderVisible, setLoaderVisible] = useState(false)
    const creatingRef = useRef(false);

    useEffect(() => {
        if (!loaderVisible) return;

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => true
        );

        return () => backHandler.remove();
    }, [loaderVisible]);

    const postAddPlaylistConfig = useCallback((data) => ({
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + getAccessToken()
        },
        body: JSON.stringify(data)
    }), [getAccessToken]);

    async function createPlaylist() {
        if (creatingRef.current) return;
        creatingRef.current = true;

        if (playlistName.length > 100 || playlistDescription.length > 300) {
            ToastAndroid.show("Text too long", 3000);
            creatingRef.current = false;
            return;
        }

        let userId = storage.getString("UserId");

        if (!userId) {
            ToastAndroid.show("User session expired. Please login again.", 3000);
            clearAuth();
            creatingRef.current = false;
            return;
        }

        if (!playlistName.trim()) {
            ToastAndroid.show("Playlist name is required", 3000);
            creatingRef.current = false;
            return;
        }

        setLoaderVisible(true)

        try {
            let newPlaylist = await fetchWithAuthRetry(`/users/${userId}/playlists`, () => postAddPlaylistConfig({ name: playlistName.trim(), description: playlistDescription.trim() }), getAccessToken, clearAuth);

            if (newPlaylist?.id) {
                ToastAndroid.show("New Playlist is created", 3000)
                props.navigation.navigate("AddSong", { playListId: newPlaylist?.id })
            } else {
                throw new Error("Playlist creation failed");
            }

        } catch (error) {
            ToastAndroid.show(error?.message || "Not able to create playlist", 3000)
        } finally {
            setLoaderVisible(false)
            creatingRef.current = false;
        }

    }

    return (
        <KeyboardAvoidingView style={styles.playlistScreen}>

            <View style={styles.header}>
                <Icon name='arrow-left-thin' disabled={loaderVisible || creatingRef.current} onPress={() => props.navigation.goBack()} style={styles.backBtn} color={'white'} size={32} />
                <Text style={styles.headerText}>Create your own Playlist</Text>
            </View>

            {loaderVisible &&
                <View style={styles.loaderOverlay}>
                    <Loader loaderVisible={loaderVisible} />
                </View>
            }

            <View style={styles.playlistView}>

                <TextInput editable={!loaderVisible} maxLength={100} placeholder='Playlist Name' placeholderTextColor={COLORS.gray} value={playlistName} style={styles.inputBox} onChangeText={(val) => setPlaylistName(val)} />
                <Text style={styles.charCount}>
                    {playlistName.length}/100
                </Text>

                <TextInput editable={!loaderVisible} multiline={true} maxLength={300} placeholder='Playlist Description (max. 300 characters)' placeholderTextColor={COLORS.gray} value={playlistDescription} style={styles.inputBox} onChangeText={(val) => setPlaylistDescription(val)} />
                <Text style={styles.charCount}>
                    {playlistDescription.length}/300
                </Text>

                <TouchableOpacity disabled={loaderVisible || creatingRef.current} onPress={() => createPlaylist()} style={[styles.createBtn, loaderVisible && styles.disabledBtn]}>
                    <Text style={styles.btnText}>Create Playlist</Text>
                </TouchableOpacity>
            </View>

        </KeyboardAvoidingView>

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
    },
    playlistView: {
        paddingHorizontal: 15
    },
    backBtn: {
        position: 'absolute',
        left: 10
    },
    headerText: {
        color: 'white',
        fontSize: 20
    },
    playlistScreen: {
        flex: 1,
        backgroundColor: COLORS.black
    },
    inputBox: {
        borderRadius: SIZES.radius,
        paddingHorizontal: 15,
        borderWidth: 1,
        borderColor: COLORS.white,
        marginVertical: 15,
        color: COLORS.white,
    },
    createBtn: {
        ...FONTS.h3,
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: '60%',
        alignSelf: 'center',
        marginVertical: 20,
        paddingVertical: 5
    },
    disabledBtn: {
        backgroundColor: COLORS.gray,
        opacity: 0.5
    },
    charCount: {
        color: COLORS.gray,
        textAlign: 'right'
    },
    loaderOverlay: {
        zIndex: 2,
        position: 'absolute',
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        height: '100%',
    },
    btnText: {
        ...FONTS.h2,
        color: COLORS.black
    }

})