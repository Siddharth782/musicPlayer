import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native'
import React, { useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, FONTS } from '../../constants/theme'
import { storage } from '../../store/store'

const Settings = (props) => {

    const [name, setName] = useState(storage.getString('Name'))
    const [email, setEmail] = useState(storage.getString('email'))

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("MusicArea")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Settings</Text>
            </View>
        )
    }


    return (
        <>
            {renderHeader()}
            <ScrollView style={{ backgroundColor: 'black', flex: 1, padding: 10 }}>

                <View style={{ marginVertical: 5 }}>
                    <Text style={styles.infoHeader}>Email</Text>
                    <Text style={styles.info}>{email}</Text>
                </View>


                <TouchableOpacity style={{ marginVertical: 5, }} onPress={() => props.navigation.navigate("AboutUs")}>
                    <Text style={styles.infoHeader}>About Us</Text>
                    <Text style={styles.info}>Something about App and it's Developer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 10, }} onPress={() => { props.navigation.navigate("Welcome"), storage.clearAll() }} >
                    <Text style={styles.infoHeader}>Log Out</Text>
                    <Text style={styles.info}>You are currently logged in as {name}</Text>
                </TouchableOpacity>

            </ScrollView>
        </>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 50,
        zIndex: 1,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%',
        flexDirection: 'row',
        backgroundColor: COLORS.gray
    },
    infoHeader: {
        color: 'white',
        ...FONTS.h3
    },
    info: {
        paddingVertical: 2
    }
})

export default Settings