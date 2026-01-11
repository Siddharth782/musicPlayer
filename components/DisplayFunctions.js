import { TouchableOpacity, View, Text, Image } from 'react-native';
import React, { memo } from 'react';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import { DisplayArtistsName } from './DisplayArtistName';
import fallbackImage from '../assets/fallbackImage.png';
import backupImg from '../assets/backupImg.jpg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const resolveImage = (url) => url ? { uri: url } : fallbackImage;

const MusicCard = memo(({ item, onPress, imageUrl, subText, styles }) => {
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

export const DisplayNewMusic = memo(({ item, onPress, design }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.images?.[0]?.url}
        subText={DisplayArtistsName({ names: item?.artists })}
        styles={design}
    />
));

export const DisplayOtherPlaylists = memo(({ item, onPress, design }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.images?.[0]?.url}
        subText={item?.description}
        styles={design}
    />
));

export const DisplayFavoriteTracks = memo(({ item, onPress, design }) => (
    <MusicCard
        item={item}
        onPress={onPress}
        imageUrl={item?.album?.images?.[0]?.url}
        subText={DisplayArtistsName({ names: item?.artists })}
        styles={design}
    />
));

export const DisplayArtist = memo(({ item, onPress, design }) => {
    if (!item) return null;
    const imageUrl = item?.images?.[0]?.url;

    return (
        <TouchableOpacity
            style={design.itemStyle}
            onPress={() => onPress({ id: item?.id, name: item?.name, coverImage: imageUrl, type: item?.type })}
        >
            <Image
                source={resolveImage(imageUrl)}
                style={design.artistImageDisplay}
                fadeDuration={300}
            />
            <Text numberOfLines={1} style={design.displayName}>{item?.name}</Text>
            <Text numberOfLines={1} style={{ color: COLORS.gray }}>Artist</Text>
        </TouchableOpacity>
    );
});

export const DisplayData = ({ item, onTouch, isActive, currentSong, openModal, design }) => {
    if (!item) {
        console.log("This is null object");
        return null;
    }
    const imgUrl = item?.type === 'track'
        ? item?.album?.images?.[0]?.url
        : item?.images?.[0]?.url;

    return (
        <TouchableOpacity onPress={() => { onTouch({ item }) }} style={{ flexDirection: 'row', marginVertical: 5 }}>

            <Image source={resolveImage(imgUrl)} style={design.displayImage} />

            <View style={design.displaySong}>
                <View style={design.textContainer}>
                    <Text numberOfLines={1} style={{ ...FONTS.h3, color: (isActive ? COLORS.MidGreen : COLORS.white) }}>{item?.name}</Text>
                    {item?.type === "track" && <Text numberOfLines={1}>Track ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    {item?.type === "album" && <Text numberOfLines={1}>Album ∙ {DisplayArtistsName({ names: item?.artists })}</Text>}
                    {item?.type === "playlist" && <Text numberOfLines={1}>Playlist ∙ {DisplayArtistsName({ names: item?.artists })}  {item?.type} </Text>}
                    {item?.type === "artist" && <Text numberOfLines={1}>Artist ∙ {item?.name} </Text>}
                </View>

                {item?.type === "track" && (<TouchableOpacity style={{ paddingHorizontal: 5, marginHorizontal: 5 }} onPress={() => { currentSong(item), openModal(true) }} >
                    <Icon size={20} name="dots-vertical" color={COLORS.white} />
                </TouchableOpacity>)}
            </View>
        </TouchableOpacity>
    )
}