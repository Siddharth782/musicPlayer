import { View, StyleSheet, Modal, ActivityIndicator } from 'react-native'
import React from 'react'
import { COLORS } from '../constants/theme'

const Loader = (props) => {
    const {loaderVisible} = props
    return (
        <View>
            {loaderVisible ? <View style={{ width: '100%', height: '100%', position: 'absolute', backgroundColor: 'black' }}>
                <Modal transparent={true} visible={loaderVisible}>
                    <View style={styles.wrapper}>
                            <ActivityIndicator color={COLORS.darkGreen} size={70} style={{zIndex:10}} />
                    </View>
                </Modal>
            </View > : null}
        </View>
    )
}

const styles = StyleSheet.create({
    wrapper: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        opacity:0.65,
        zIndex: 1
    }
})

export default Loader