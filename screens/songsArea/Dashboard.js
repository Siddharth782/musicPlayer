import { View, Text, TouchableOpacity, StyleSheet, FlatList, ToastAndroid } from 'react-native'
import React, { useEffect, useState, useContext, useCallback, useMemo } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { AuthContext } from '../../context/AuthContext';
import { DisplayFavoriteTracks, DisplayOtherPlaylists, DisplayArtist, DisplayNewMusic } from '../../components/DisplayFunctions';
import { fetchWithAuthRetry } from '../../components/APIService';
import SkeletonSection from '../../components/Placeholder';

const Dashboard = (props) => {

    const { clearAuth, getAccessToken } = useContext(AuthContext);

    const [dashboardData, setDashboardData] = useState({
        topTracks: null,
        artists: null,
        newReleases: null,
        userPlaylists: null,
        bollywood: null,
        workout: null,
        kPop: null,
        party: null,
        mood: null,
        userName: null
    });

    useEffect(() => {
        if (dashboardData.userName === null) getCurrentUser();
        if (dashboardData.topTracks === null) fetchData('/me/top/tracks?limit=20', 'topTracks');
        if (dashboardData.artists === null) fetchData('/me/top/artists?limit=10', 'artists');
        if (dashboardData.newReleases === null) fetchData('/browse/new-releases?country=IN&limit=10', 'newReleases', 'albums');
        if (dashboardData.userPlaylists === null) fetchData('/me/playlists', 'userPlaylists', 'playlists');

        if (dashboardData.bollywood === null) fetchData(`/search?q=bollywood&type=playlist&limit=10`, 'bollywood', 'playlists');
        if (dashboardData.workout === null) fetchData(`/search?q=workout&type=playlist&limit=10`, 'workout', 'playlists');
        if (dashboardData.kPop === null) fetchData(`/search?q=k-pop&type=playlist&limit=10`, 'kPop', 'playlists');
        if (dashboardData.party === null) fetchData(`/search?q=party&type=playlist&limit=10`, 'party', 'playlists');
        if (dashboardData.mood === null) fetchData(`/search?q=mood&type=playlist&limit=10`, 'mood', 'playlists');
    }, []);

    const navigateToDetails = useCallback((params) => {
        props.navigation.navigate('Details', params);
    }, [props.navigation]);

    const getAuthenticatedConfig = useCallback(() => ({
        method: 'GET',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${getAccessToken()}`,
        },
    }), [getAccessToken]);

    const fetchData = async (endpoint, key, type = 'items') => {
        try {
            const data = await fetchWithAuthRetry(endpoint, getAuthenticatedConfig);
            if (data) {
                let processedData = [];
                if (type === 'albums') processedData = data.albums?.items;
                else if (type === 'playlists') processedData = data.playlists?.items;
                else processedData = data.items;

                setDashboardData(prev => ({
                    ...prev,
                    [key]: processedData || []
                }));
            }
        } catch (error) {
            if (error === "Session expired") {
                clearAuth();
                ToastAndroid.show("Error fetching data. Please try again later.", 3000);
            }
            setDashboardData(prev => ({ ...prev, [key]: [] }));
        }
    };

    const getCurrentUser = async () => {
        try {
            const data = await fetchWithAuthRetry("/me", getAuthenticatedConfig);
            if (!data) throw new Error('Failed to fetch user data');

            setDashboardData(prev => ({
                ...prev,
                ['userName']: data?.display_name
            }));

            if (data?.email) {
                storage.set('email', data.email);
            }

            if (data?.display_name) {
                storage.set('Name', data.display_name);
            }

            if (data?.id) {
                storage.set('UserId', String(data.id)); // Ensure string for storage
            }

        } catch (error) {
            clearAuth();
            ToastAndroid.show("Error fetching user data. Please try again later.", 3000);
        }
    }

    const sections = useMemo(() => [
        { key: 'topTracks', title: 'Your Favorite', data: dashboardData.topTracks, renderItem: DisplayFavoriteTracks },
        { key: 'userPlaylists', title: 'Your Playlist', data: dashboardData.userPlaylists, renderItem: DisplayOtherPlaylists },
        { key: 'artists', title: 'Your Top Artists', data: dashboardData.artists, renderItem: DisplayArtist },
        { key: 'newReleases', title: 'New Music', data: dashboardData.newReleases, renderItem: DisplayNewMusic },
        { key: 'bollywood', title: 'Bollywood Masti', data: dashboardData.bollywood, renderItem: DisplayOtherPlaylists },
        { key: 'kPop', title: 'K-Pop', data: dashboardData.kPop, renderItem: DisplayOtherPlaylists },
        { key: 'workout', title: 'Workout', data: dashboardData.workout, renderItem: DisplayOtherPlaylists },
        { key: 'mood', title: 'Moody Beats', data: dashboardData.mood, renderItem: DisplayOtherPlaylists },
        { key: 'party', title: 'Party is in Air', data: dashboardData.party, renderItem: DisplayOtherPlaylists },
    ], [dashboardData]);

    const ListHeader = useMemo(() => (
        <View style={styles.header}>
            <Text numberOfLines={1} style={{ color: COLORS.white, fontSize: SIZES.h2 }} > {dashboardData.userName ? `Welcome ${dashboardData.userName.split(' ')[0]}` : 'Welcome'} </Text>

            <TouchableOpacity onPress={() => props.navigation.navigate('Settings')} >
                <Icon name="cog" color={COLORS.white} size={20} />
            </TouchableOpacity>
        </View>
    ), [dashboardData?.userName])

    return (
        <>
            <FlatList
                style={styles.backGround}
                ListHeaderComponent={ListHeader}
                data={sections}
                keyExtractor={(section) => section.key}
                showsVerticalScrollIndicator={false}
                renderItem={({ item: section }) => {
                    if (section.data === null) {
                        return <SkeletonSection layout={"Horizontal"} />;
                    }
                    if (!section.data?.length) return null;

                    return (
                        <View style={{ marginBottom: 20 }}>
                            <Text style={styles.sectionHeader}>{section.title}</Text>

                            <FlatList
                                horizontal
                                removeClippedSubviews
                                data={section.data}
                                keyExtractor={(row, index) => row?.id ?? `${section.key}-${index}`}
                                showsHorizontalScrollIndicator={false}
                                renderItem={({ item }) => {
                                    const Renderer = section.renderItem;
                                    return (
                                        <Renderer design={styles} item={item} onPress={navigateToDetails} />
                                    );
                                }}
                            />
                        </View>
                    );
                }}
                ListEmptyComponent={() => {
                    const isLoadingAny = Object.values(dashboardData).some(val => val === null);
                    if (!isLoadingAny) return <Text style={styles.emptyText}>No content available</Text>;
                    return null;
                }}
            />

        </>
    );
}

const styles = StyleSheet.create({
    backGround: {
        backgroundColor: COLORS.black,
        flex: 1,
        padding: 15
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
        marginHorizontal: 4
    },
    sectionHeader: {
        ...FONTS.h3,
        color: COLORS.white,
        marginVertical: 5
    },
    displayName: {
        ...FONTS.h4,
        color: COLORS.white,
        flexWrap: 'wrap'
    },
    itemStyle: {
        marginHorizontal: 10,
        marginVertical: 5,
        width: 160
    },
    imageDisplay: {
        height: 150,
        width: 150,
        marginBottom: 5,
        borderRadius: SIZES.radius
    },
    artistImageDisplay: {
        height: 150,
        width: 150,
        marginBottom: 5,
        borderRadius: 75
    },
    emptyText: {
        color: 'white',
        textAlign: 'center',
        marginTop: 50
    },
})

export default Dashboard