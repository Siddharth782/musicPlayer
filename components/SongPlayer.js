import React, { useContext, useCallback, useMemo } from 'react';
import { View, Text, Image, ActivityIndicator, TouchableOpacity, ToastAndroid, StyleSheet, Dimensions } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import LinearGradient from 'react-native-linear-gradient';
import { PlayerContext } from '../context/PlayerContext';
import { COLORS } from '../constants/theme';
import { DisplayArtistsName } from './DisplayArtistName'; // Assuming this is a component or helper
import backupImg from '../assets/backupImg.jpg';
const { width } = Dimensions.get('window');

const FullPlayer = React.memo(({ track, isLoading, isPlaying, onClose, onPlayPause, playNext, playlistName }) => {

    const imageSource = useMemo(() => {
        return track?.album?.images?.[0]?.url ? { uri: track.album.images[0].url } : backupImg;
    }, [track]);

    return (
        <View style={styles.player}>
            <LinearGradient style={{ flex: 1 }} colors={['#2dbfc2', '#0b0d70', '#000008']} >
                <Icon name="chevron-down" color={COLORS.white} size={30} onPress={onClose} style={styles.closeIcon} />

                <View style={{ alignItems: 'center', marginTop: 40, marginBottom: 20, paddingHorizontal: 40 }}>
                    {playlistName && <Text style={styles.headerTitle}>Playing from your Playlist</Text>}
                    <Text numberOfLines={1} style={styles.playlistName}> {playlistName} </Text>
                </View>

                <View style={styles.artworkContainer}>
                    <Image source={imageSource} style={styles.artwork} resizeMode="cover" />
                </View>

                <View style={{ paddingHorizontal: 30, marginBottom: 20 }}>
                    <Text numberOfLines={2} style={styles.trackName}> {track?.name} </Text>
                    <Text numberOfLines={1} style={styles.artistName}> {DisplayArtistsName({ names: track?.artists })} </Text>
                </View>

                <View style={styles.controlsContainer}>
                    <TouchableOpacity onPress={() => playNext(false)} disabled={isLoading}>
                        <Icon name="skip-previous" size={50} color={isLoading ? COLORS.gray : COLORS.white} />
                    </TouchableOpacity>

                    <TouchableOpacity onPress={onPlayPause} disabled={isLoading}>
                        {isLoading ? (
                            <ActivityIndicator size={60} color={COLORS.white} />
                        ) : (
                            <Icon name={isPlaying ? 'pause-circle' : 'play-circle'} size={75} color={COLORS.white} />
                        )}
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => playNext(true)} disabled={isLoading}>
                        <Icon name="skip-next" size={50} color={isLoading ? COLORS.gray : COLORS.white} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>
        </View>
    );
});

const MiniPlayer = React.memo(({ track, isLoading, isPlaying, onExpand, onPlayPause }) => {

    const imageSource = useMemo(() => {
        return track?.album?.images?.[0]?.url ? { uri: track.album.images[0].url } : backupImg
    }, [track]);

    return (
        <View style={styles.miniPlayerContainer}>
            <TouchableOpacity onPress={onExpand} style={{ flexDirection: 'row', flex: 1 }}>

                <Image source={imageSource} style={{ height: width * 0.11, width: 45, borderRadius: 5, backgroundColor: '#333' }} />

                <View style={{ flex: 1, marginHorizontal: 12, justifyContent: 'center' }}>
                    <Text numberOfLines={1} style={{ color: COLORS.white, fontWeight: '600', fontSize: 14, marginBottom: 2 }}>
                        {track?.name}
                    </Text>
                    <Text numberOfLines={1} style={{ color: COLORS.gray, fontSize: 12 }}>
                        {DisplayArtistsName({ names: track?.artists })}
                    </Text>
                </View>
            </TouchableOpacity>

            <TouchableOpacity onPress={onPlayPause} style={{ padding: 5 }}>
                {isLoading ? (
                    <ActivityIndicator color={COLORS.white} size={30} />
                ) : (
                    <Icon name={isPlaying ? 'pause' : 'play'} color={COLORS.white} size={35} />
                )}
            </TouchableOpacity>
        </View>
    );
});

const SongPlayer = () => {
    const { currentTrack, isPlaying, togglePlayback, currentSound, isLoading, setIsPlayerVisible, isPlayerVisible, playlistName, playlist, setCurrentIndex, playTrack } = useContext(PlayerContext);


    const playNextTrack = useCallback(async (next) => {
        const index = playlist.findIndex(t => t.id === currentTrack.id);
        let nextIndex;

        if (next) {
            nextIndex = Number((index + 1) % playlist.length);
        } else {
            nextIndex = Number((index - 1 + playlist.length) % playlist.length);
        }
        let item = playlist[nextIndex];

        setCurrentIndex(nextIndex);

        try {
            const res = await playTrack({ item });

            if (!res.ok) {
                throw new Error(res.error);
            }
        } catch (error) {
            ToastAndroid.show(error, 3000);
        }
    }, [playlist, currentTrack, playTrack])

    return currentTrack && (isPlayerVisible ? (
        <FullPlayer
            track={currentTrack}
            isLoading={isLoading}
            isPlaying={isPlaying}
            playlistName={playlistName}
            onClose={() => setIsPlayerVisible(false)}
            onPlayPause={togglePlayback}
            playNext={playNextTrack}
        />
    ) : (
        <MiniPlayer
            track={currentTrack}
            isLoading={isLoading}
            isPlaying={isPlaying}
            onExpand={() => setIsPlayerVisible(true)}
            onPlayPause={togglePlayback}
        />
    ));
}

const styles = StyleSheet.create({
    player: {
        height: '100%',
        width: '100%',
        zIndex: 100,
    },
    closeIcon: {
        position: 'absolute',
        left: 20,
        top: 20,
        zIndex: 10,
    },
    headerTitle: {
        color: COLORS.white,
        fontSize: 17,
        fontWeight: '400'
    },
    playlistName: {
        color: COLORS.white,
        fontSize: 26,
        letterSpacing: 1,
        fontWeight: '700',
        marginTop: 5,
    },
    artworkContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        height: width * 0.90,
        marginVertical: 10,
    },
    artwork: {
        height: width * 0.85,
        width: width * 0.8,
        borderRadius: 15,
        backgroundColor: '#333'
    },
    trackName: {
        color: COLORS.white,
        fontSize: 22,
        fontWeight: 'bold',
        marginVertical: 10,
        textAlign: 'center'
    },
    artistName: {
        color: COLORS.gray,
        fontSize: 20,
        marginVertical: 5,
        textAlign: 'center'
    },
    controlsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        marginTop: 10,
        paddingHorizontal: 20,
    },
    miniPlayerContainer: {
        backgroundColor: '#0b0d70',
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 15,
        paddingVertical: 10,
        position: 'absolute',
        bottom: 65,
        width: '100%',
    }
});

export default SongPlayer;