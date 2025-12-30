import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native'
import React from 'react'
import { COLORS } from '../constants/theme'

const Loader = (props) => {
    const { loaderVisible } = props
    return (
        (loaderVisible &&
                <View style={styles.wrapper}>
                    <ActivityIndicator color={COLORS.darkGreen} size={70} style={{ zIndex: 10 }} />
                </View>
        )
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex:1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.black,
        opacity: 0.85,
        zIndex: 10,
    }
})

export default Loader