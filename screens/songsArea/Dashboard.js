import { View, Text, TouchableOpacity, StyleSheet, FlatList, ToastAndroid } from 'react-native'
import React, { useCallback, useMemo, useContext, useEffect, useRef } from 'react'
import { COLORS, FONTS, SIZES } from '../../constants/theme'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { DisplayArtist, MusicCard } from '../../components/DisplayFunctions';
import SkeletonSection from '../../components/Placeholder';
import { formatArtistName } from '../../components/DisplayFunctions';
import { useDashboardData } from '../../components/useDashboardData';
import { AuthContext } from '../../context/AuthContext';
import { storage } from '../../store/store';

const SectionItem = React.memo(({ item, section, styles, onPress }) => {
    const Renderer = section.renderItem;
    const subText = section.getSubText ? section.getSubText(item) : null;
    const imageUrl = section.imageUrl ? section.imageUrl(item) : null;

    return (
        <Renderer
            styles={styles}
            item={item}
            onPress={onPress}
            subText={subText}
            imageUrl={imageUrl}
        />
    );
});

const Dashboard = (props) => {
    const { clearAuth } = useContext(AuthContext);

    const { dashboardData, loading, error, refetch } = useDashboardData();
    const retriedRef = useRef(false);

    useEffect(() => {
        if (!error) return;

        if (error === 'Session expired' || error === 'Failed to load dashboard') {
            if (retriedRef.current) {
                clearAuth();
                ToastAndroid.show("Session expired. Please login again.", 3000);
            } else {
                retriedRef.current = true;
                refetch();
            }
        }
    }, [error, clearAuth, refetch]);

    useEffect(() => {
        if (!dashboardData?.user?.id) return;

        storage.set('UserId', String(dashboardData.user.id));
        storage.set('Name', dashboardData.user.display_name ?? '');
        storage.set('email', dashboardData.user.email ?? '');
    }, [dashboardData?.user?.id]);


    const navigateToDetails = useCallback((params) => {
        props.navigation.navigate('Details', params);
    }, [props.navigation]);

    const getArtistNames = useCallback((item) => formatArtistName({ names: item?.artists }), []);
    const getImageUrl = useCallback((item) => item?.album?.images?.[0]?.url || item?.images?.[0]?.url, []);
    const getDescription = useCallback((item) => item?.description, []);

    const sections = useMemo(() =>
        [
            { key: 'topTracks', title: 'Your Favorite', data: dashboardData?.topTracks, renderItem: MusicCard, getSubText: getArtistNames, imageUrl: getImageUrl },
            { key: 'userPlaylists', title: 'Your Playlist', data: dashboardData?.userPlaylists, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
            { key: 'artists', title: 'Your Top Artists', data: dashboardData?.artists, renderItem: DisplayArtist },
            { key: 'newReleases', title: 'New Music', data: dashboardData?.newReleases, renderItem: MusicCard, getSubText: getArtistNames, imageUrl: getImageUrl },
            { key: 'bollywood', title: 'Bollywood Masti', data: dashboardData?.bollywood, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
            { key: 'kPop', title: 'K-Pop', data: dashboardData?.kPop, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
            { key: 'workout', title: 'Workout', data: dashboardData?.workout, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
            { key: 'mood', title: 'Moody Beats', data: dashboardData?.mood, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
            { key: 'party', title: 'Party is in Air', data: dashboardData?.party, renderItem: MusicCard, getSubText: getDescription, imageUrl: getImageUrl },
        ], [dashboardData]);

    const ListHeader = useMemo(() => (
        <View style={styles.header}>
            <Text numberOfLines={1} style={{ color: COLORS.white, fontSize: SIZES.h2 }} >
                {dashboardData?.user ? `Welcome ${dashboardData.user?.display_name.split(' ')[0]}` : 'Welcome'}
            </Text>

            <TouchableOpacity onPress={() => props.navigation.navigate('Settings')} >
                <Icon name="cog" color={COLORS.white} size={20} />
            </TouchableOpacity>
        </View>
    ), [dashboardData?.user, props.navigation]);

    const renderSection = useCallback(({ item: section }) => {
        if (loading && section.data?.length === 0) {
            return <SkeletonSection layout={"Horizontal"} />;
        }

        if (!section.data || section.data.length === 0) return null;

        return (
            <View style={{ marginBottom: 20 }}>
                <Text style={styles.sectionHeader}>{section.title}</Text>

                <FlatList
                    horizontal
                    data={section.data}
                    keyExtractor={(row) => `${section.key}-${row?.id ?? row?.uri ?? Math.random()}`}
                    initialNumToRender={4}
                    maxToRenderPerBatch={6}
                    showsHorizontalScrollIndicator={false}
                    renderItem={({ item }) => {
                        return (
                            <SectionItem
                                item={item}
                                section={section}
                                styles={styles}
                                onPress={navigateToDetails}
                            />
                        );
                    }}
                />
            </View>
        );
    }, [loading, navigateToDetails]);

    return (
        <>
            <FlatList
                ListHeaderComponent={ListHeader}
                style={styles.backGround}
                data={sections}
                keyExtractor={(section) => section.key}
                showsVerticalScrollIndicator={false}
                renderItem={renderSection}
                ListEmptyComponent={() => {
                    if (!loading) return <Text style={styles.emptyText}>No content available</Text>;
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
    retryBtn: {
        backgroundColor: COLORS.white,
        borderRadius: SIZES.radius * 2,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
        marginVertical: 10
    },
    retryText: {
        ...FONTS.h2,
        color: COLORS.black,
    }
})

export default Dashboard