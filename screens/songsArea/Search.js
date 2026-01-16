import { View, Text, TouchableOpacity, StyleSheet, TextInput, FlatList, Image, ToastAndroid, Keyboard } from 'react-native'
import React, { useState, useContext, useCallback, useMemo } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { PlayerContext } from '../../context/PlayerContext'
import { AuthContext } from '../../context/AuthContext';
import { addToLikedSongs, fetchWithAuthRetry } from '../../components/APIService';
import SkeletonSection from '../../components/Placeholder';
import { DisplayData, formatArtistName } from '../../components/DisplayFunctions';
import BottomUpModal from '../../components/BottomUpModal'


const Search = (props) => {
    const { getAccessToken } = useContext(AuthContext);

    const { currentTrack, setIsLoading, playTrack } = useContext(PlayerContext)

    // array for displaying search results
    const [tracks, setTracks] = useState([])
    const [playlists, setPlaylists] = useState([])
    const [albums, setAlbums] = useState([])
    const [artists, setArtists] = useState([])

    // loader Visibility & search vakue
    const [loaderVisible, setLoaderVisible] = useState(false);
    const [hasSearched, setHasSearched] = useState(false);
    const [searchValue, setSearchValue] = useState('')
    const [modalVisible, setModalVisible] = useState(false)
    const [selectedSong, setSelectedSong] = useState(null)

    // parameters for passing to backend 
    const getParamConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            "Content-Type": 'application/json',
            "Authorization": `Bearer ${getAccessToken()}`
        }
    }), [getAccessToken]);

    // searching data from backend
    async function searchData() {
        if (!searchValue) {
            ToastAndroid.show("Input some value", 2000);
            return;
        }
        setTracks([]);
        setPlaylists([]);
        setAlbums([]);
        setArtists([]);

        Keyboard.dismiss();
        setHasSearched(true);
        setLoaderVisible(true);
        try {

            let [resTracks, res, resArtist] = await Promise.all([
                fetchWithAuthRetry(`/search?q=${encodeURIComponent(searchValue)}&type=track&limit=20`, getParamConfig),
                fetchWithAuthRetry(`/search?q=${encodeURIComponent(searchValue)}&type=album,playlist&limit=10`, getParamConfig),
                fetchWithAuthRetry(`/search?q=${encodeURIComponent(searchValue)}&type=artist&limit=2`, getParamConfig),
            ]);

            setTracks(resTracks?.tracks?.items)
            setPlaylists(res?.playlists?.items)
            setAlbums(res?.albums?.items)
            setArtists(resArtist?.artists?.items)

            // console.log("all results", resTracks)
        } catch (error) {
            ToastAndroid.show(error.message, 2000)
        } finally {
            setLoaderVisible(false)
        }
    }

    const handleClick = useCallback(async ({ item }) => {

        if (item?.type === "track") {
            const res = await playTrack({ item });

            if (!res.ok) {
                setIsLoading(false);
                ToastAndroid.show(res.error, 3000);
            }
        } else {
            props.navigation.navigate("Details", { id: item?.id, coverImage: item?.images[0]?.url, name: item?.name, type: item?.type })
        }
    })

    const combinedResults = useMemo(() => [
        ...tracks.map(t => ({ ...t, _type: 'track' })),
        ...albums.map(a => ({ ...a, _type: 'album' })),
        ...playlists.map(p => ({ ...p, _type: 'playlist' })),
        ...artists.map(ar => ({ ...ar, _type: 'artist' })),
    ], [tracks, albums, playlists, artists]);

    const renderItem = useCallback(({ item }) => {
        if (item._type === 'track') {
            return <DisplayData item={item} isActive={currentTrack?.id === item?.id} onTouch={handleClick} currentSong={setSelectedSong} openModal={setModalVisible} design={styles} />;
        }
        if (item._type === 'album' || item._type === 'playlist') {
            return <DisplayData item={item} onTouch={handleClick} design={styles} />;
        }
        if (item._type === 'artist') {
            return <DisplayData item={item} onTouch={handleClick} design={styles} />;
        }
        return null;
    }, [handleClick, currentTrack?.id]);

    const ListEmptyComponent = useMemo(() => {
        if (loaderVisible) return <SkeletonSection layout={'Vertical'} />;
        if (!hasSearched) {
            return (
                <View style={styles.emptyContainer}>
                    <Text style={styles.emptyText}>Search for songs, artists, or playlists</Text>
                </View>
            );
        }
        return (
            <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No results found for "{searchValue}"</Text>
            </View>
        );
    }, [loaderVisible, searchValue, hasSearched]);

    const addInLikeSongs = async ({ songUri }) => {
        const res = await addToLikedSongs(songUri, getAccessToken);
        setModalVisible(false);
        ToastAndroid.show(res.msg, 3000);
    }

    const renderOptions = useCallback(() => {
        if (!selectedSong) return null;
        let item = selectedSong;
        let imgSource = item?.album?.images?.[0]?.url ? item?.album?.images?.[0]?.url : item?.images?.[0].url;
        if (!imgSource) {
            imgSource = playlistCover;
        } else {
            imgSource = { uri: imgSource };
        }

        return (
            <View style={{ padding: 5, margin: 5, flex: 1 }}>
                <View style={{ justifyContent: 'center', alignItems: 'center' }}>
                    <Image source={imgSource} style={styles.displayOptionsImage} />
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


    return (
        <View style={{ flex: 1, backgroundColor: 'black' }}>

            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Dashboard")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Search</Text>
            </View>

            {/* search bar */}
            <View style={styles.searchBar}>

                <View style={styles.searchBox} >
                    <TextInput
                        placeholder='Search songs,artists and playlists'
                        placeholderTextColor={COLORS.gray}
                        value={searchValue}
                        style={{ paddingLeft: 5 }}
                        onChangeText={(val) => setSearchValue(val)}
                        onSubmitEditing={searchData}
                        returnKeyType="search" />

                    <Icon name='close' size={20} color={COLORS.white} onPress={() => setSearchValue('')} style={{ position: 'absolute', right: 10, alignSelf: 'center' }} />
                </View>

                <TouchableOpacity style={styles.searchBtn} onPress={() => searchData()}>
                    <Icon name='card-search' color={COLORS.white} size={40} />
                </TouchableOpacity>

            </View>

            {(combinedResults.length > 0) && <Text style={styles.resultHeader}>Top Results</Text>}

            <FlatList
                data={combinedResults}
                keyExtractor={(item, index) => item.id ? `${item.id}-${index}` : index.toString()}
                renderItem={renderItem}
                ListEmptyComponent={ListEmptyComponent}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={{ flexGrow: 1, backgroundColor: COLORS.black, paddingTop: 10, paddingBottom: currentTrack ? 70 : 20 }}
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
    displayImage: {
        height: 64,
        width: 64,
        marginHorizontal: 15,
        borderRadius: 12
    },
    resultHeader: {
        ...FONTS.h2,
        color: COLORS.white,
        marginHorizontal: 15
    },
    searchBtn: {
        backgroundColor: COLORS.black,
        marginVertical: 5,
        justifyContent: 'center',
        alignItems: 'center'
    },
    searchBar: {
        flexDirection: 'row',
        marginHorizontal: 15,
        marginVertical: 5,
        alignItems: 'center'
    },
    searchBox: {
        backgroundColor: COLORS.black,
        borderRadius: SIZES.radius,
        borderWidth: 1,
        borderColor: COLORS.white,
        flex: 1,
        height: 40,
        justifyContent: 'center'
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        marginTop: 50
    },
    emptyText: {
        color: COLORS.gray,
        fontSize: 20
    },
    displaySong: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
        flex: 1,
    },
    displaySongName: {
        marginVertical: 3,
        ...FONTS.h2,
        color: COLORS.white
    },
    Options: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 10,
        marginVertical: 5
    },
    optionsText: {
        color: COLORS.white,
        marginHorizontal: 10,
        fontSize: 18
    },
    displayOptionsImage: {
        height: 100,
        width: 100,
        margin: 5,
        borderRadius: SIZES.radius
    },
    textContainer: {
        flex: 1,
        marginLeft: -7
    }
})

export default Search