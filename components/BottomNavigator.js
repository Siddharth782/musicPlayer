import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import { COLORS } from '../constants/theme'
import React, { useContext } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { Player } from './CurrentStatus'

const BottomNavigator = () => {
    const { activeScreen, setActiveScreen } = useContext(Player)

    return (
        activeScreen && (<View style={styles.bottomStyle}>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { setActiveScreen("Dashboard") }}>
                <Icon name='home' color={COLORS.white} size={30} style={styles.iconStyle} />
                <Text style={{ color: 'green', textAlign: 'center' }}>Dashboard</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { setActiveScreen("Search") }}>
                <Icon name='magnify' color={COLORS.white} size={30} style={styles.iconStyle} />
                <Text style={{ color: 'green', textAlign: 'center' }}>Search</Text>
            </TouchableOpacity>
            <TouchableOpacity style={{ flex: 1 }} onPress={() => { setActiveScreen("Library") }}>
                <Icon name='book-multiple-outline' color={COLORS.white} size={30} style={styles.iconStyle} />
                <Text style={{ color: 'green', textAlign: 'center' }}>Library</Text>
            </TouchableOpacity>
        </View>)
    )
}

const styles = StyleSheet.create({
    bottomStyle: {
        height: 65,
        backgroundColor: COLORS.white,
        flexDirection: 'row',
        width: '100%',
        position: 'absolute',
        bottom: 0,
        paddingHorizontal: 10,
        alignItems: 'center',
        zIndex: 1
    },
    iconStyle: {
        backgroundColor: COLORS.purple,
        borderRadius: 12,
        paddingVertical: 3,
        paddingHorizontal: 15,
        alignSelf: 'center'
    }
})

export default BottomNavigator