import { View, Text, TouchableOpacity, StyleSheet, TextInput, Image, ToastAndroid, FlatList, Keyboard } from 'react-native'
import React, { useState, useEffect, useContext, useMemo, useCallback } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, SIZES, FONTS } from '../../constants/theme'
import { formatArtistName } from '../../components/DisplayFunctions'
import { AuthContext } from '../../context/AuthContext';
import backupImg from '../../assets/backupImg.jpg';
import SkeletonSection from '../../components/Placeholder'
import { PlayerContext } from '../../context/PlayerContext'
import { fetchWithAuthRetry } from '../../components/APIService'

const DisplayTracks = React.memo(({ item, onAdd, addingTrackUri }) => {
    const imageSource =
        item?.album?.images?.[0]?.url
            ? { uri: item.album.images[0].url }
            : backupImg;

    return (
        <TouchableOpacity disabled={addingTrackUri === item?.uri} onPress={onAdd} style={styles.trackContainer}>
            <Image source={imageSource} style={styles.displayImage} />

            <View style={styles.songBox}>
                <Text numberOfLines={1} style={styles.trackName}>{item?.name}</Text>
                <View style={styles.songText}>
                    <Text>{item?.type === "track" ? "Song ∙ " : null}</Text>
                    <Text numberOfLines={1}> {formatArtistName({ names: item?.artists })} </Text>
                </View>
            </View>
        </TouchableOpacity>
    )
});

const AddSong = (props) => {
    const { playListId } = props?.route?.params
    const { getAccessToken } = useContext(AuthContext);
    const { currentTrack } = useContext(PlayerContext);

    const [allTracks, setAllTracks] = useState([])
    const [recentlyPlayed, setRecentlyPlayed] = useState([])
    const [loaderVisible, setLoaderVisible] = useState(true)
    const [searchValue, setSearchValue] = useState('')
    const [hasSearched, setHasSearched] = useState(false);
    const [addingTrackUri, setAddingTrackUri] = useState(null);

    const getAuthConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
        },
    }), [getAccessToken]);

    const postAddTrackConfig = useCallback((body) => ({
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
        },
        body: JSON.stringify(body),
    }), [getAccessToken]);

    useEffect(() => {
        if (recentlyPlayed.length === 0) getRecentlyPlayed()
    }, [])

    async function getRecentlyPlayed() {
        setLoaderVisible(true);
        try {
            const data = await fetchWithAuthRetry("/me/player/recently-played", getAuthConfig);
            if (!data) throw new Error('Failed to fetch user data');

            let extractedData = data?.items
                ?.map(item => item?.track)
                ?.filter(Boolean);

            setRecentlyPlayed(extractedData);
        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        } finally {
            setLoaderVisible(false);
        }
    }

    // searching data through API
    async function searchData() {
        if (!searchValue.trim()) return;

        Keyboard.dismiss();
        setHasSearched(true);
        setLoaderVisible(true);

        try {
            const data = await fetchWithAuthRetry(`/search?q=${searchValue}&type=track&limit=10`, getAuthConfig);
            if (!data) throw new Error('Failed to fetch user data');

            setAllTracks(data?.tracks?.items ?? []);
        } catch (error) {
            ToastAndroid.show(error.message, 2000)
        } finally {
            setLoaderVisible(false);
        }
    }

    const addTrackToPlaylist = useCallback(async ({ songUri }) => {
        if (addingTrackUri === songUri) return;
        setAddingTrackUri(songUri);

        try {
            let response = await fetchWithAuthRetry(`/playlists/${playListId}/tracks`, () => postAddTrackConfig({ uris: [songUri] }));

            if (response.snapshot_id) {
                ToastAndroid.show("Song added Successfully", 500)
            }
            else {
                throw new Error("Please Try again");
            }

        } catch (error) {
            ToastAndroid.show(error.message, 3000)
        } finally {
            setAddingTrackUri(null);
        }

    }, [playListId, postAddTrackConfig]);

    const computedTrackList = useMemo(() => {
        if (!hasSearched) return recentlyPlayed;
        if (loaderVisible) return [];
        return allTracks;
    }, [hasSearched, loaderVisible, recentlyPlayed, allTracks]);

    const renderTracks = useCallback(({ item }) => {
        const onAdd = () => addTrackToPlaylist({ songUri: item.uri });
        return <DisplayTracks item={item} onAdd={onAdd} addingTrackUri={addingTrackUri} />;
    }, [addTrackToPlaylist]);


    const renderNoTracks = useCallback(() => {
        if (loaderVisible) return <SkeletonSection layout="Vertical" />;
        if (hasSearched) return <Text style={styles.emptyText}>No results found</Text>;
        return <Text style={styles.emptyText}>No recently played tracks</Text>;
    }, [hasSearched, loaderVisible]);

    return (
        <View style={styles.pageStyle}>

            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.goBack()} style={styles.iconDesign} color={'white'} size={32} />
                <Text style={styles.headerTitle}>Add Songs</Text>
            </View>

            {/* search bar */}
            <View style={styles.searchBox}>

                <View style={styles.searchBar} >
                    <TextInput placeholder='Search Songs' placeholderTextColor={COLORS.gray} value={searchValue} style={styles.searchText} onChangeText={(val) => setSearchValue(val)} />
                    <Icon name='close' size={20} color={COLORS.white} onPress={() => setSearchValue('')} style={styles.closeIcon} />
                </View>

                <TouchableOpacity style={styles.searchIcon} onPress={() => searchData()}>
                    <Icon name='card-search' color={COLORS.white} size={40} />
                </TouchableOpacity>

            </View>

            <FlatList
                data={computedTrackList}
                keyExtractor={(item, index) => {
                    if (item.played_at) {
                        return `recent-${item.id}-${item.played_at}`;
                    }
                    return `search-${item.id}-${index}`;
                }}
                renderItem={renderTracks}
                ListEmptyComponent={renderNoTracks}
                contentContainerStyle={{ ...styles.listContent, paddingBottom: currentTrack ? 70 : 20 }}
                showsVerticalScrollIndicator={false}
            />

        </View>
    )
}

export default AddSong

const styles = StyleSheet.create({
    listContent: {
        flexGrow: 1,
        backgroundColor: COLORS.black,
        paddingLeft: 5,
    },
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
    displayImage: {
        height: 64,
        width: 64,
        marginHorizontal: 15
    },
    sectionHeader: {
        color: COLORS.white,
        fontSize: 18,
        fontWeight: 'bold',
        marginTop: 10,
        marginBottom: 10
    },
    songText: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    trackContainer: {
        flexDirection: 'row',
        marginVertical: 5
    },
    trackName: {
        ...FONTS.h4,
        color: COLORS.white,
        flexWrap: 'wrap'
    },
    songBox: {
        width: '65%'
    },
    pageStyle: {
        flex: 1,
        backgroundColor: 'black'
    },
    iconDesign: {
        position: 'absolute',
        left: 10
    },
    searchBox: {
        flexDirection: 'row',
        margin: 10,
        alignItems: 'center'
    },
    searchBar: {
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.white,
        flex: 1,
        height: 40,
        justifyContent: 'center'
    },
    searchText: { paddingLeft: 5 },
    closeIcon: {
        position: 'absolute',
        right: 10,
        alignSelf: 'center'
    },
    searchIcon: {
        backgroundColor: COLORS.black,
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    placeHolder: { marginBottom: 10 },
    headerTitle: {
        color: 'white',
        fontSize: 20
    }
})