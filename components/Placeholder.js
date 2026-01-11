import React, { useEffect, useRef } from 'react';
import { View, Animated, StyleSheet } from 'react-native';
import { COLORS, SIZES } from '../constants/theme';

const SkeletonSection = ({ layout }) => {
    const opacity = useRef(new Animated.Value(0.3)).current;

    useEffect(() => {
        Animated.loop(
            Animated.sequence([
                Animated.timing(opacity, { toValue: 1, duration: 800, useNativeDriver: true }),
                Animated.timing(opacity, { toValue: 0.3, duration: 800, useNativeDriver: true }),
            ])
        ).start();
    }, []);

    return (
        <View style={styles.container}>
            {/* Title Skeleton */}
            <Animated.View style={[styles.title, { opacity }]} />

            {/* Horizontal List Skeletons */}
            <View style={{ flexDirection: layout === "Horizontal" ? 'row' : 'column' }}>
                {[1, 2, 3, 4, 5].map((key) => (
                    <Animated.View key={key} style={[styles.card, { opacity }]} />
                ))}
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 25,
        paddingLeft: 10
    },
    title: {
        height: 20,
        width: 150,
        backgroundColor: COLORS.lightGray, // Use a grey color
        marginBottom: 15,
        borderRadius: 4,
    },
    card: {
        height: 140,
        width: 140,
        backgroundColor: COLORS.lightGray,
        marginHorizontal: 8,
        marginVertical: 4,
        borderRadius: SIZES.radius,
    }
});

export default SkeletonSection;