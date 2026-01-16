import { View, Text, TouchableOpacity, StyleSheet, Image, ToastAndroid, FlatList, Dimensions } from 'react-native'
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { PlayerContext } from '../../context/PlayerContext'
import BottomUpModal from '../../components/BottomUpModal'
import { useIsFocused } from '@react-navigation/native';
import { AuthContext } from '../../context/AuthContext';
import { addToLikedSongs, fetchWithAuthRetry } from '../../components/APIService';
import SkeletonSection from '../../components/Placeholder';
import { DisplayData, formatArtistName } from '../../components/DisplayFunctions'
import playlistCover from '../../assets/backupImg.jpg';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

const Details = (props) => {
    const isFocused = useIsFocused();
    const { id, description, coverImage, name, type } = props.route.params
    const { getAccessToken } = useContext(AuthContext);
    const { currentTrack, setIsLoading, manageQueue, playlist, playTrack, setCurrentIndex } = useContext(PlayerContext)

    const [tracks, setTracks] = useState(null)
    const [track, setTrack] = useState(null)
    const [artistAlbums, setArtistAlbums] = useState(null)
    const [playlistDetails, setPlaylistDetails] = useState(null)
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    const [offset, setOffset] = useState(0);
    const [hasMore, setHasMore] = useState(true);

    const getParamConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    }), [getAccessToken]);

    useEffect(() => {
        setOffset(0);
        setHasMore(true);
        // setTracks([]);

        if (name === "Favorite") getTracks(`/me/tracks?limit=50`);
        if (type === "album") getTracks(`/albums/${id}/tracks`);
        if (type === "track") getTracks(`/tracks/${id}`);
        if (type === "artist") {
            getArtistsTracks();
            setHasMore(false);
        }
    }, [type, name, id]);

    useEffect(() => {
        if (type === "playlist") {
            getTracks(`/playlists/${id}/tracks`)
            getPlaylist()
        }
    }, [isFocused]);

    // get tracks of a given playlist
    const getTracks = useCallback(async (endpoint, isLoadMore = false) => {
        try {
            const data = await fetchWithAuthRetry(endpoint, getParamConfig);
            if (!data) throw new Error('Failed to fetch user data');

            let extractedTracks;

            if (type === "playlist") {
                extractedTracks = data?.items
                    .map(item => item?.track)
                    .filter(Boolean);

                if (extractedTracks.length < 50) setHasMore(false);

                if (isLoadMore) {
                    setTracks(prev => {
                        const existingIds = new Set(prev.map(t => t.id));
                        const newUniqueTracks = extractedTracks.filter(t => !existingIds.has(t.id));
                        return [...prev, ...newUniqueTracks];
                    });
                } else {
                    setTracks(extractedTracks);
                }
            } else if (type === "track") {
                extractedTracks = data;
                setTrack(extractedTracks);
            } else {
                extractedTracks = data?.items;

                if (extractedTracks.length < 50) setHasMore(false);

                if (isLoadMore) {
                    setTracks(prev => {
                        const existingIds = new Set(prev.map(t => t.id));
                        const newUniqueTracks = extractedTracks.filter(t => !existingIds.has(t.id));
                        return [...prev, ...newUniqueTracks];
                    });
                } else {
                    setTracks(extractedTracks);
                }
            }

            setLoaderVisible(false);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        }
    })

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

    // this is used for getting tracks of selected artist
    async function getArtistsTracks() {
        try {
            const [topTracks, albumsData] = await Promise.all([
                fetchWithAuthRetry(`/search?q=${name}&type=track&limit=20`, getParamConfig),
                fetchWithAuthRetry(`/artists/${id}/albums?country=IN&limit=5`, getParamConfig)
            ]);
            if (!topTracks && !albumsData) throw new Error('Failed to fetch user data');

            setTracks(topTracks?.tracks?.items);
            setArtistAlbums(albumsData?.items);
        } catch (error) {
            ToastAndroid.show(error.message, 3000);
        } finally {
            setLoaderVisible(false);
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
        let imgSource = item?.album?.images?.[0]?.url ? item?.album?.images?.[0]?.url : item?.images?.[0].url;
        if(!imgSource){
            imgSource = playlistCover;
        }else{
            imgSource = {uri: imgSource};
        }

        return (
            <View style={{ padding: 5, margin: 5, flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={imgSource} style={styles.displayImage} />
                    <Text numberOfLines={1} style={styles.displaySongName}>{item?.name}</Text>
                    <Text numberOfLines={1} style={{ marginVertical: 3, ...FONTS.h4 }}>{formatArtistName({ names: item?.artists })}</Text>
                </View>

                <View>
                    <TouchableOpacity style={styles.Options} onPress={() => addInLikeSongs({ songUri: item?.id })}>
                        <Icon name="cards-heart-outline" size={20} color={COLORS.white} />

                        <Text style={styles.optionsText}> Like </Text>
                    </TouchableOpacity>

                    <TouchableOpacity style={styles.Options} onPress={() => { props.navigation.navigate("AddtoPlaylist", { trackURI: item?.uri }), setModalVisible(false) }}>
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

    // for rendering header at top of page
    const headerImage = useMemo(() => {
        return (
            <View >
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={styles.backIcon} color={'white'} size={32} />
                <Image source={coverImage ? { uri: coverImage } : playlistCover} style={{ height: SCREEN_HEIGHT * 0.35, width: '100%', marginVertical: 5 }} />
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

    // for playing selected track
    const handleClick = useCallback(async ({ item }) => {

        if (item?.type === "track") {
            const index = playlist.findIndex(t => t.id === item.id);
            setCurrentIndex(index);

            const res = await playTrack({ item });

            manageQueue(computedTrackList, false, name);

            if (!res.ok) {
                setIsLoading(false);
                ToastAndroid.show(res.error, 3000);
            }
        } else {
            props.navigation.navigate("Details", { id: item?.id, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })
        }
    })

    const playFirst = useCallback(() => {
        if (!computedTrackList || computedTrackList.length === 0) {
            console.log("I am returned from here");
            return;
        }
        handleClick({ item: computedTrackList[0] });

    }, [computedTrackList, handleClick]);

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
    }, [headerImage, name, description, playlistDetails, type, tracks, playFirst, props.navigation, id, computedTrackList]);

    const renderTracks = useCallback(({ item }) => (
        <DisplayData item={item} isActive={currentTrack?.id === item?.id} onTouch={handleClick} currentSong={setSelectedSong} openModal={setModalVisible} design={styles} />
    ), [computedTrackList, currentTrack, handleClick]);

    const loadMore = () => {
        if (!hasMore || loaderVisible) return;
        const nextOffset = offset + 50;
        setOffset(nextOffset);
        getTracks(`/playlists/${id}/tracks?offset=${nextOffset}&limit=50`, true);
    };

    return (
        <>
            <FlatList
                data={computedTrackList}
                keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
                renderItem={renderTracks}
                ListHeaderComponent={header}
                ListEmptyComponent={renderNoTracks}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                removeClippedSubviews={true}
                contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.black, paddingTop: 10, paddingBottom: currentTrack ? 70 : 20 }}
                showsVerticalScrollIndicator={false}
                initialNumToRender={10}
                maxToRenderPerBatch={15}
                windowSize={10}
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
    displaySong: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 5,
        flex: 1,
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
        height: 64,
        width: 64,
        marginVertical: 5,
        marginRight: 5,
        marginLeft: 20,
        borderRadius: SIZES.radius
    },
    Options: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 5
    },
    textContainer: {
        flex: 1,
        marginLeft: 5
    }
})