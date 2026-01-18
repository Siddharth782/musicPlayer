import { TouchableOpacity, View, Text, Image } from 'react-native';
import React, { memo } from 'react';
import { COLORS, FONTS, SIZES } from '../constants/theme';
import fallbackImage from '../assets/fallbackImage.png';
import backupImg from '../assets/backupImg.jpg';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'

const resolveImage = (url) => url ? { uri: url } : fallbackImage;

export const MusicCard = memo(({ item, onPress, imageUrl, subText, styles }) => {
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
            <View style={[styles.imageDisplay]}>
                <Image
                    source={resolveImage(imageUrl)}
                    style={styles.imageDisplay}
                    defaultSource={fallbackImage}
                    fadeDuration={300}
                />
            </View>
            <View>
                <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
                <Text numberOfLines={2} style={styles.subText}>{subText}</Text>
            </View>
        </TouchableOpacity>
    )
});

export const DisplayArtist = memo(({ item, onPress, styles }) => {
    if (!item) return null;
    const imageUrl = item?.images?.[0]?.url;

    return (
        <TouchableOpacity
            style={styles.itemStyle}
            onPress={() => onPress({ id: item?.id, name: item?.name, coverImage: imageUrl, type: item?.type })}
        >
            <Image
                source={resolveImage(imageUrl)}
                style={styles.artistImageDisplay}
                fadeDuration={300}
            />
            <View>
                <Text numberOfLines={1} style={styles.displayName}>{item?.name}</Text>
                <Text numberOfLines={1} style={{ color: COLORS.gray }}>Artist</Text>
            </View>
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
                    {item?.type === "track" && <Text numberOfLines={1}>Track ∙ {formatArtistName({ names: item?.artists })}</Text>}
                    {item?.type === "album" && <Text numberOfLines={1}>Album ∙ {formatArtistName({ names: item?.artists })}</Text>}
                    {item?.type === "playlist" && <Text numberOfLines={1}>Playlist ∙ {formatArtistName({ names: item?.artists })}  {item?.type} </Text>}
                    {item?.type === "artist" && <Text numberOfLines={1}>Artist ∙ {item?.name} </Text>}
                </View>

                {item?.type === "track" && (<TouchableOpacity style={{ paddingHorizontal: 5, marginHorizontal: 5 }} onPress={() => { currentSong(item), openModal(true) }} >
                    <Icon size={20} name="dots-vertical" color={COLORS.white} />
                </TouchableOpacity>)}
            </View>
        </TouchableOpacity>
    )
}

// for displaying Artist Name(s)
export function formatArtistName(props) {
    const { names } = props
    let artistName = ''

    for (let index = 0; index < names?.length; index++) {
        const element = names[index];
        artistName += element?.name
        artistName += ", "
    }

    return artistName.slice(0, artistName.length - 2)
}