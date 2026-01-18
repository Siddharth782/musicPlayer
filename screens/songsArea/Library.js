import { StyleSheet, Text, View, TouchableOpacity, Image, FlatList, ToastAndroid } from 'react-native'
import React, { useState, useContext, useCallback, useMemo, useEffect, useRef } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { formatArtistName, DisplayArtist, MusicCard } from '../../components/DisplayFunctions'
import { PlayerContext } from '../../context/PlayerContext'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { useLibraryData } from '../../components/useLibraryData'
import profileImg from '../../assets/profile.jpg'
import SkeletonSection from '../../components/Placeholder';
import createBtn from '../../assets/createBtn.jpg'
import { AuthContext } from '../../context/AuthContext'

const Library = (props) => {

    const { clearAuth } = useContext(AuthContext);
    const { currentTrack } = useContext(PlayerContext);
    const [selected, setSelected] = useState(null)
    const retriedRef = useRef(false);

    const { user, libraryData, raw, loading, refetch, error } = useLibraryData();

    useEffect(() => {
        if (!error) return;

        if (error === 'Session expired') {
            ToastAndroid.show('Session expired. Login again', 3000);
            clearAuth();
            return;
        }

        if (error === 'Failed') {
            if (!retriedRef.current) {
                retriedRef.current = true;
                refetch();
            } else {
                ToastAndroid.show("Failed to load library. Try again", 3000);
            }
        }
    }, [error, refetch, clearAuth]);

    useEffect(() => {
        if (!error && !loading) {
            retriedRef.current = false;
        }
    }, [error, loading]);

    const navigateToDetails = useCallback((params) => {
        props.navigation.navigate('Details', params);
    }, [props.navigation]);

    const getSubText = useCallback((item) => {
        if (item?._entity === 'playlist') {
            return `Playlist ∙ ${item?.owner?.display_name}`;
        }
        if (item?._entity === 'album') {
            return `Album ∙ ${formatArtistName({ names: item?.artists })}`;
        }
        return '';
    }, []);

    const renderHeader = useMemo(() => {
        if (!user) return null;
        const avatarSource = user.images?.[0]?.url ? { uri: user.images[0].url } : profileImg;

        return (
            <>
                <View style={styles.header}>
                    <Image source={avatarSource} style={styles.avatar} />
                    <Text style={styles.headerText}>Your Library</Text>
                </View>

                {libraryData.length > 0 && (
                    <View style={styles.filter}>
                        {['Playlist', 'Album', 'Artist'].map((type) => (
                            <TouchableOpacity key={type} style={[styles.filterOption, selected === type && styles.filterOptionSelected]} onPress={() => setSelected(prev => prev === type ? null : type)}>
                                <Text style={[styles.filterText, selected === type && { color: COLORS.white }]}>
                                    {type}
                                </Text>
                            </TouchableOpacity>
                        ))}
                        {selected && <TouchableOpacity style={[styles.filterOption, { alignItems: 'center' }]} onPress={() => setSelected(null)}>
                            <Icon name="close" size={20} />
                        </TouchableOpacity>}
                    </View>
                )}
            </>
        );
    }, [user, libraryData, selected]);

    const renderItem = useCallback(({ item }) => {
        if (item._entity === 'artist') {
            return <DisplayArtist item={item} onPress={navigateToDetails} styles={styles} />;
        }

        return (
            <MusicCard item={item} onPress={navigateToDetails} styles={styles} subText={getSubText(item)} imageUrl={item?.images?.[0]?.url} />
        );
    }, [navigateToDetails, getSubText]);

    const renderFooter = useCallback(() => {
        if (loading || !user || error) return null;

        return (
            <TouchableOpacity style={styles.itemStyle} onPress={() => props.navigation.navigate("AddPlaylist")}>
                <Image source={createBtn} style={styles.imageDisplay} />
                <Text style={[styles.filterText, FONTS.h3]}>Create a new Playlist</Text>
            </TouchableOpacity>
        )
    }, [props.navigation, loading, error])

    const renderNoTracks = useCallback(() => {
        if (loading) {
            return <SkeletonSection layout={"Vertical"} />;
        }

        if (selected) {
            return (
                <Text style={styles.emptyText}>
                    No {selected.toLowerCase()}s found
                </Text>
            );
        }

        return (
            <View style={styles.emptyView}>
                <Text style={styles.emptyText}>
                    Your library is empty
                </Text>
            </View>
        );
    }, [loading, selected]);

    const displayData = useMemo(() => {
        if (selected === 'Playlist') return raw.playlists;
        if (selected === 'Album') return raw.albums;
        if (selected === 'Artist') return raw.artists;
        return libraryData;
    }, [selected, libraryData, raw]);

    return (
        <FlatList
            data={displayData}
            keyExtractor={(item) => item.id ? `${item._entity}-${item.id}` : `${item._entity}-${item.uri}`}
            style={styles.background}
            removeClippedSubviews={true}
            renderItem={renderItem}
            ListHeaderComponent={renderHeader}
            ListFooterComponent={renderFooter}
            ListEmptyComponent={renderNoTracks}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: currentTrack ? 70 : 20 }}
        />
    )
}

export default Library

const styles = StyleSheet.create({
    header: {
        marginVertical: 10,
        flexDirection: 'row',
        alignItems: 'center'
    },
    headerText: {
        ...FONTS.h2,
        color: COLORS.white,
        marginLeft: 15
    },
    displayName: {
        ...FONTS.h4,
        flexWrap: 'wrap',
        color: COLORS.white
    },
    filter: {
        flexDirection: 'row',
        marginVertical: 5
    },
    filterOption: {
        borderWidth: 1,
        borderRadius: SIZES.radius * 2,
        borderColor: COLORS.violet,
        marginHorizontal: 5,
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    filterText: {
        color: COLORS.white
    },
    filterOptionSelected: {
        borderWidth: 1,
        borderRadius: SIZES.radius * 2,
        borderColor: COLORS.green,
        elevation: 7,
        shadowColor: COLORS.darkGreen,
        backgroundColor: COLORS.violet,
    },
    itemStyle: {
        margin: 10,
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 10
    },
    imageDisplay: {
        height: 64,
        width: 64,
        marginRight: 15,
        borderRadius: SIZES.radius,
    },
    artistImageDisplay: {
        height: 64,
        width: 64,
        marginRight: 15,
        borderRadius: 32,
    },
    background: {
        backgroundColor: COLORS.black,
        flex: 1,
        padding: 5
    },
    emptyText: {
        ...FONTS.h4,
        color: COLORS.gray,
        textAlign: 'center',
        marginTop: 20
    },
    emptyView: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: 20
    },
    retryButton: {
        backgroundColor: COLORS.violet,
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: SIZES.radius,
        marginTop: 10
    },
    retryText: {
        color: COLORS.white,
        ...FONTS.h4
    }
})