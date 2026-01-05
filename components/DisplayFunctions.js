import { TouchableOpacity, View, Text, Image, StyleSheet } from 'react-native';
import React, { memo } from 'react';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { DisplayArtistsName } from './DisplayArtistName';
import fallbackImage from '../assets/fallbackImage.png';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const resolveImage = (url) => url ? { uri: url } : fallbackImage;

const MusicCard = memo(({ item, onPress, imageUrl, subText }) => {
    if (!item) return null;

    return (

        <TouchableOpacity
            style={styles.itemStyle}
            onPress={() => onPress({
                id: item?.id,
                description: item?.description,
                name: item?.name,
                coverImage: imageUrl,
                type: item?.type
            })}
        >
            <View style={[styles.imageDisplay, { backgroundColor: COLORS.MidGreen }]}>
                <Image
                    source={resolveImage(imageUrl)}
                    style={styles.imageDisplay}
                    defaultSource={fallbackImage}
                    fadeDuration={300}
                />
            </View>
            <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
            <Text numberOfLines={2} style={styles.subText}>{subText}</Text>
        </TouchableOpacity>
    )
});

export const DisplayNewMusic = memo(({ item, onPress }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.images?.[0]?.url}
        subText={DisplayArtistsName({ names: item?.artists })}
    />
));

export const DisplayOtherPlaylists = memo(({ item, onPress }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.images?.[0]?.url}
        subText={item?.description}
    />
));

export const DisplayFavoriteTracks = memo(({ item, onPress }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.album?.images?.[0]?.url}
        subText={DisplayArtistsName({ names: item?.artists })}
    />
));

export const DisplayArtist = memo(({ item, onPress }) => {
    if (!item) return null;
    const imageUrl = item?.images?.[0]?.url;

    return (
        <TouchableOpacity
            style={styles.itemStyle}
            onPress={() => onPress({ id: item?.id, name: item?.name, coverImage: imageUrl, type: item?.type })}
        >
            <Image
                source={resolveImage(imageUrl)}
                style={[styles.imageDisplay, { borderRadius: 75 }]}
                fadeDuration={300}
            />
            <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
            <Text numberOfLines={1} style={{ color: COLORS.gray }}>Artist</Text>
        </TouchableOpacity>
    );
});

export const DisplayTracks = ({ item, id, onTouch, isActive, currentSong, modalVisible }) => {
    return (
        <TouchableOpacity onPress={() => { onTouch({ item, id }) }} style={{ flexDirection: 'row' }}>

            <Image source={{ uri: (item?.album?.images[0]?.url ? item?.album?.images[0]?.url : (item?.images?.[0].url ? item?.images?.[0]?.url : "https://developer.spotify.com/images/guidelines/design/icon1@2x.png")) }} style={styles.displayImage} />

            <View style={styles.displaySong}>
                <View style={{ flex: 1 }}>
                    <Text numberOfLines={1} style={{ ...FONTS.h3, color: (isActive ? COLORS.MidGreen : COLORS.white) }}>{item?.name}</Text>
                    {item?.type === "track" && <Text numberOfLines={1}>Track ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    {item?.type === "album" && <Text numberOfLines={1}>Album ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    {item?.type === "playlist" && <Text numberOfLines={1}>Playlist ∙ {DisplayArtistsName({ names: item?.artists })}  {item?.type} </Text>}
                </View>

                {item?.type === "track" && (<TouchableOpacity style={{ paddingHorizontal: 5, marginHorizontal: 5 }} onPress={() => { currentSong(item), modalVisible(true) }} >
                    <Icon size={20} name="dots-vertical" color={COLORS.white} />
                </TouchableOpacity>)}
            </View>
        </TouchableOpacity>
    )
}

const styles = StyleSheet.create({
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
    displaySong: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginLeft: 10,
        flex: 1
    },
    displayImage: {
        height: 100,
        width: 100,
        margin: 5,
        borderRadius: SIZES.radius
    },
})