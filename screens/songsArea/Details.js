import { View, Text, TouchableOpacity, StyleSheet, Image, ToastAndroid, FlatList } from 'react-native'
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { PlayerContext } from '../../context/PlayerContext'
import { DisplayArtistsName } from '../../components/DisplayArtistName'
import BottomUpModal from '../../components/BottomUpModal'
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { addToLikedSongs, fetchWithAuthRetry } from '../../components/APIService';
import SkeletonSection from '../../components/Placeholder';
import { DisplayTracks } from '../../components/DisplayFunctions'


const Details = (props) => {
    const isFocused = useIsFocused();
    const { id, description, coverImage, name, type } = props.route.params
    const { getAccessToken } = useContext(AuthContext);
    const { currentTrack, setIsLoading, setPlaylistName, manageQueue, playlist, playTrack } = useContext(PlayerContext)

    const [tracks, setTracks] = useState(null)
    const [artistAlbums, setArtistAlbums] = useState(null)
    const [playlistDetails, setPlaylistDetails] = useState(null)
    const [track, setTrack] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    const getParamConfig = () => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    });

    useEffect(() => {
        if (name === "Favorite") getSavedTracks();
        if (type === "album") getAlbumTracks();
        if (type === "track") getSingleTrack();
        if (type === "artist") getArtistsTracks();
    }, [type, name]);

    useEffect(() => {
        if (type === "playlist") {
            getPlaylistTracks()
            getPlaylist()
        }
    }, [isFocused]);

    useEffect(() => {
        if (name) {
            setPlaylistName(name);
        }
    }, [name, setPlaylistName]);

    // get tracks of a given playlist
    async function getPlaylistTracks() {
        try {
            const data = await fetchWithAuthRetry(`/playlists/${id}/tracks`, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');

            const extractedTracks = data?.items
                .map(item => item?.track)
                .filter(Boolean);

            setTracks(extractedTracks);
            manageQueue(extractedTracks, false);
            setLoaderVisible(false);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        }
    }

    // get the given playlist
    async function getPlaylist() {
        try {
            const data = await fetchWithAuthRetry(`/playlists/${id}`, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');

            setPlaylistDetails(data);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        }
    }

    // this is used for getting the user favorite tracks
    async function getSavedTracks() {
        try {
            const data = await fetchWithAuthRetry(`/me/tracks?limit=50`, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');

            setTracks(data?.items);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        } finally {
            setLoaderVisible(false);
        }
    }

    // this is used for getting tracks of selected artist
    async function getArtistsTracks() {
        try {
            const topData = await fetchWithAuthRetry(`/artists/${id}/top-tracks?country=IN&limit=15`, getParamConfig);
            const albumsData = await fetchWithAuthRetry(`/artists/${id}/albums?country=IN&limit=15`, getParamConfig);
            if (!topData && !albumsData) throw new Error('Failed to fetch user data');

            setTracks(topData?.tracks);
            manageQueue(topData?.tracks, false);
            setArtistAlbums(albumsData?.items);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        } finally {
            setLoaderVisible(false);
        }
    }

    // when only 1 track is selected
    async function getSingleTrack() {
        try {
            const data = await fetchWithAuthRetry(`/tracks/${id}`, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');
            setTrack(data);
            manageQueue(data, true);
            setLoaderVisible(false);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        }
    }

    // tracks of an album when an album is selected
    async function getAlbumTracks() {
        try {
            const data = await fetchWithAuthRetry(`/albums/${id}/tracks`, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');

            setTracks(data?.items);
            manageQueue(data?.items, false);
            setLoaderVisible(false);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        }
    }

    // for playing selected track
    async function playCurrentTrack({ item, id }) {

        const res = await playTrack({ item, id });

        if (!res.ok) {
            setIsLoading(false);
            ToastAndroid.show(res.error, 3000);
        }
    }

    const addInLikeSongs = async ({ songUri }) => {
        const res = await addToLikedSongs(songUri, getAccessToken);
        setModalVisible(false);
        ToastAndroid.show(res.msg, 3000);
    }

    // for rendering options box
    const renderOptions = useCallback(() => {
        if (!selectedSong) return null;
        let item = selectedSong;

        return (
            <View style={{ padding: 5, margin: 5, flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : item?.images?.[0].url) }} style={styles.displayImage} />
                    <Text numberOfLines={1} style={styles.displaySongName}>{item?.name}</Text>
                    <Text numberOfLines={1} style={{ marginVertical: 3, ...FONTS.h4 }}>{DisplayArtistsName({ names: item?.artists })}</Text>
                </View>

                <View>
                    <TouchableOpacity style={styles.Options} onPress={() => addInLikeSongs({ songUri: item?.id })}>
                        <Icon name="cards-heart-outline" size={20} color={COLORS.white} />

                        <Text style={styles.optionsText}> Like </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => props.navigation.navigate("AddtoPlaylist", { trackURI: item?.uri })}>
                        <Icon name="playlist-music" size={20} color={COLORS.white} />

                        <Text style={styles.optionsText}> Add to Playlist </Text>
                    </TouchableOpacity>
                </View>

            </View>
        )
    }, [selectedSong, props.navigation, addInLikeSongs])

    const goAddSong = useCallback(() => {
        props.navigation.navigate("AddSong", { playListId: id });
    }, [props.navigation, id]);

    // displaying when no track is present in a track
    const renderNoTracks = useCallback(() => {

        if (loaderVisible) {
            return <SkeletonSection layout={"Vertical"} />;
        }

        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ ...FONTS.h4 }}>Your playlist is empty.</Text>
                <TouchableOpacity onPress={goAddSong} style={styles.addSongBtn}>
                    <Text style={{ ...FONTS.h2, color: COLORS.black, }}>Add Songs</Text>
                </TouchableOpacity>
            </View>
        )
    }, [id, props.navigation, loaderVisible]);

    const playFirst = useCallback(() => {
        if (!playlist?.length) return;
        playCurrentTrack({ item: playlist[0], id: 0 });
    }, [playlist, playCurrentTrack]);

    // for rendering header at top of page
    const headerImage = useMemo(() => {
        return (
            <View >
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={styles.backIcon} color={'white'} size={32} />
                <Image source={{ uri: (coverImage ? coverImage : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png") }} style={{ height: 300, width: '100%', marginVertical: 5 }} />
            </View>
        )
    }, [coverImage, props.navigation])

    const computedTrackList = useMemo(() => {
        if (type === 'playlist') return tracks ?? [];
        if (type === 'album') return tracks ?? [];
        if (type === 'artist') return [...(tracks ?? []), ...(artistAlbums ?? [])];
        if (type === 'track') return track ? [track] : [];
        return [];
    }, [type, tracks, artistAlbums, track]);

    const header = useMemo(() => {
        return (
            <>
                {headerImage}

                {name?.length > 0 && (<Text style={styles.playlistName}>{name}</Text>)}

                {description?.length > 0 && (<Text numberOfLines={2} style={styles.descriptionText}>{description}</Text>)}

                {playlistDetails !== null && (
                    <Text style={styles.ownerName}>{playlistDetails?.owner?.display_name}</Text>
                )}

                {tracks !== null &&
                    (<View style={{ alignItems: 'center', marginHorizontal: 15, flexDirection: 'row', justifyContent: 'space-between' }}>
                        <Text style={{ ...FONTS.h4, color: COLORS.white }} > {tracks?.length} tracks</Text>
                        <Icon name="play" style={styles.playBtn} onPress={playFirst} size={40} />
                    </View>)
                }

                {
                    type === "playlist" && tracks?.length > 0 && (
                        <TouchableOpacity onPress={goAddSong} style={styles.addMoreSongBtn}>
                            <Text style={{ color: COLORS.white }}>Add More Songs</Text>
                        </TouchableOpacity>
                    )
                }

            </>
        );
    }, [headerImage, name, description, playlistDetails, type, tracks, playFirst, props.navigation, id]);

    const renderTracks = useCallback(({ item, index }) => (
        <DisplayTracks item={item} id={index} isActive={currentTrack?.id === item?.id} onTouch={playCurrentTrack} currentSong={setSelectedSong} modalVisible={setModalVisible} />
    ), [currentTrack, playCurrentTrack]);

    const EmptyComponent = useCallback(() => renderNoTracks(), [renderNoTracks]);

    return (
        <>
            <FlatList
                data={computedTrackList}
                keyExtractor={(item) =>
                    item?.id ??
                    item?.uri ??
                    `${type}-${JSON.stringify(item).slice(0, 20)}`
                }
                renderItem={renderTracks}
                ListHeaderComponent={header}
                ListEmptyComponent={EmptyComponent}
                contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.black, paddingTop: 10, paddingBottom: currentTrack ? 70 : 20 }}
                showsVerticalScrollIndicator={false}
            />

            <BottomUpModal
                isVisible={modalVisible}
                onClose={() => setModalVisible(false)}
                visibleHeight={350}
            >
                {renderOptions()}
            </BottomUpModal>
        </>
    )
}

export default Details

const styles = StyleSheet.create({
    ownerName: {
        marginLeft: 15,
        marginVertical: 8,
        color: COLORS.white,
        ...FONTS.h3
    },
    displaySongName: {
        marginVertical: 3,
        ...FONTS.h2,
        color: COLORS.white
    },
    descriptionText: {
        marginLeft: 15,
        color: COLORS.darkGray,
        ...FONTS.h4
    },
    backIcon: {
        position: 'absolute',
        left: 10,
        top: 15,
        zIndex: 1,
        backgroundColor: 'black',
        borderRadius: 16
    },
    optionsText: {
        color: COLORS.white,
        marginHorizontal: 10,
        fontSize: 18
    },
    playlistName: {
        marginLeft: 10,
        marginVertical: 10,
        ...FONTS.h2,
        color: COLORS.white
    },
    playBtn: {
        borderRadius: 20,
        backgroundColor: COLORS.green
    },
    addSongBtn: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginVertical: 10
    },
    addMoreSongBtn: {
        width: '40%',
        alignSelf: 'center',
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius * 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 5,
        marginVertical: 5,
        borderWidth: 2,
        borderColor: COLORS.white
    },
    displayImage: {
        height: 100,
        width: 100,
        margin: 5,
        borderRadius: SIZES.radius
    },
    Options: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 5
    }
})