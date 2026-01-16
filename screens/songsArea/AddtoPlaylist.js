import { StyleSheet, Text, View, TouchableOpacity, Image, ToastAndroid, FlatList, BackHandler } from 'react-native'
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { AuthContext } from '../../context/AuthContext';
import { PlayerContext } from '../../context/PlayerContext';
import { formatArtistName } from '../../components/DisplayFunctions'
import { fetchWithAuthRetry } from '../../components/APIService'
import SkeletonSection from '../../components/Placeholder'
import { storage } from '../../store/store';
import createBtn from '../../assets/createBtn.jpg';
import backupImage from '../../assets/backupImg.jpg';
import Loader from '../../components/Loader';

// For showing user playlists 
const DisplayLibrary = React.memo(({ item, onPress, disabled }) => {
    // console.log(item);
    const imgSource = item?.images?.length > 0 && item.images[0]?.url ? { uri: item.images[0].url } : backupImage;

    return (
        <TouchableOpacity disabled={disabled} onPress={onPress} style={[styles.itemStyle, disabled ? styles.disabledItem : null]}>
            <Image source={imgSource} style={styles.displayImage} />
            <View style={styles.textContainer}>
                <Text numberOfLines={1} style={styles.displaySongName}>{item?.name}</Text>
                {item?.type === "album" && <Text numberOfLines={1} style={styles.displayName}>Album ∙ {formatArtistName({ names: item?.artists })}</Text>}
                {item?.type === "playlist" && <Text numberOfLines={1} style={styles.displayName}>Playlist ∙ {item?.owner?.display_name}</Text>}
            </View>
        </TouchableOpacity>
    )
})

const AddtoPlaylist = (props) => {
    const { trackURI } = props.route.params

    const { getAccessToken, clearAuth } = useContext(AuthContext);
    const { currentTrack } = useContext(PlayerContext);

    const [loadingPlaylists, setLoadingPlaylists] = useState(true);
    const [addingSong, setAddingSong] = useState(false);
    const [userPlaylists, setUserPlaylists] = useState(null);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        if (!addingSong) return;

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            () => true
        );

        return () => backHandler.remove();
    }, [addingSong]);


    const getParamConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    }), [getAccessToken]);

    const getAddConfig = useCallback((data) => ({
        method: 'POST',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": 'Bearer ' + getAccessToken()
        },
        body: JSON.stringify(data)
    }), [getAccessToken]);

    const playlistsWithCreate = useMemo(() => {
        if (!userPlaylists) return [];

        return [
            ...userPlaylists,
            { id: 'create-playlist', _type: 'create', name: 'Create Playlist' },
        ];
    }, [userPlaylists]);

    const getCurrentUserPlaylist = useCallback(async (currentOffset = 0) => {
        try {
            const userId = storage.getString("UserId");

            if (!userId) {
                ToastAndroid.show("Session expired. Please login again.", 3000);
                setLoadingPlaylists(false);
                clearAuth();
                return;
            }

            const response = await fetchWithAuthRetry(`/me/playlists?limit=50&offset=${currentOffset}`, getParamConfig);

            let retreivedPlaylists = response?.items?.filter(playlist => playlist?.owner?.id === userId) ?? [];
            setHasMore(response?.next !== null);

            setUserPlaylists(prev => currentOffset === 0 ? retreivedPlaylists : [...(prev ?? []), ...retreivedPlaylists]);

        } catch (error) {
            ToastAndroid.show(error.message || "Failed to load playlists", 3000);
            setUserPlaylists([]);
        } finally {
            setLoadingPlaylists(false);
        }
    }, [getParamConfig, clearAuth]);

    useEffect(() => {
        getCurrentUserPlaylist(0);
    }, []);

    const addToPlaylist = useCallback(async ({ playlistId }) => {
        if (addingSong) return;
        setAddingSong(true);

        if (!trackURI) {
            ToastAndroid.show("Invalid track", 3000);
            setAddingSong(false);
            return;
        }
        if (!playlistId) {
            ToastAndroid.show("Invalid playlist", 3000);
            setAddingSong(false);
            return;
        }


        try {
            const res = await fetchWithAuthRetry(`/playlists/${playlistId}/tracks`, () => getAddConfig({ uris: [trackURI] }));

            if (res?.snapshot_id) {
                ToastAndroid.show("Song added successfully", 3000)
            }
            else {
                ToastAndroid.show("Please Try again", 3000)
            }

        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        } finally {
            setAddingSong(false);
        }
    }, [trackURI, getAddConfig]);

    const renderHeader = useCallback(() => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => { if (!addingSong) props.navigation.goBack() }} style={styles.iconStyle} color={'white'} size={32} />
                <Text style={styles.headerFont}>Add To a Playlist</Text>
            </View>
        )
    }, [props?.navigation, addingSong]);

    const renderLibrary = useCallback(({ item }) => {
        if (item._type === 'create') {
            return (
                <TouchableOpacity disabled={addingSong} style={[styles.itemStyle, addingSong ? styles.disabledItem : null]}
                    onPress={() => {
                        if (addingSong) return;
                        props.navigation.navigate("AddPlaylist");
                    }}>
                    <Image source={createBtn} style={styles.displayImage} />
                    <Text style={styles.filterText}>Create a new Playlist</Text>
                </TouchableOpacity>
            );
        }

        return (
            <DisplayLibrary
                item={item}
                onPress={() => {
                    if (addingSong) return;
                    addToPlaylist({ playlistId: item?.id });
                }}
                disabled={addingSong}
            />
        );
    }, [addToPlaylist, addingSong, props.navigation]);

    const renderNoPlaylists = useCallback(() => {
        if (loadingPlaylists) {
            return <SkeletonSection layout={"Vertical"} />;
        }
        return (
            <>
                <View style={styles.noPlaylistContainer}>
                    <Text style={styles.noPlaylistText}>You don't have any playlist</Text>
                </View>
            </>
        )
    }, [loadingPlaylists]);

    const loadMore = () => {
        if (!hasMore || loadingPlaylists || addingSong) return;
        const nextOffset = (userPlaylists?.length ?? 0);
        getCurrentUserPlaylist(nextOffset);
    };

    return (
        <>
            {addingSong &&
                <View style={styles.loaderOverlay}>
                    <Loader loaderVisible={addingSong} />
                </View>
            }

            <FlatList
                data={playlistsWithCreate}
                keyExtractor={(item) => item._type === 'create' ? 'create-playlist' : `playlist-${item.id}`}
                renderItem={renderLibrary}
                ListHeaderComponent={renderHeader}
                onEndReached={loadMore}
                onEndReachedThreshold={0.5}
                ListEmptyComponent={renderNoPlaylists}
                contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.black, paddingTop: 10, paddingBottom: currentTrack ? 70 : 20 }}
                showsVerticalScrollIndicator={false}
            />
        </>
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
    disabledItem: {
        opacity: 0.5
    },
    displayImage: {
        height: 64,
        width: 64,
        marginRight: 15,
        marginLeft: 10,
        borderRadius: SIZES.radius
    },
    header: {
        ...FONTS.h2,
        backgroundColor: COLORS.gray,
        color: COLORS.white,
        marginBottom: 20,
        paddingVertical: 10,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    filterText: {
        color: COLORS.white,
        ...FONTS.h3
    },
    loaderOverlay: {
        zIndex: 2,
        position: 'absolute',
        width: '100%',
        justifyContent: 'center',
        alignSelf: 'center',
        height: '100%',
    },
    textContainer: {
        justifyContent: 'center'
    },
    displayName: {
        ...FONTS.h4,
        color: COLORS.gray,
        marginVertical: 2
    },
    displaySongName: {
        ...FONTS.h3,
        color: COLORS.white,
        marginVertical: 2
    },
    iconStyle: {
        position: 'absolute',
        left: 10
    },
    headerFont: {
        color: 'white',
        ...FONTS.h2
    },
    noPlaylistContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },
    noPlaylistText: {
        ...FONTS.h4,
        color: COLORS.white
    }

})