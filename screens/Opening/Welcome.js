import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { storage } from '../../store/store'

const Welcome = (props) => {
    console.log("Name",storage.getString('Name'))
    console.log("UID",storage.getString('UID'))

    if (storage.getString('UID')) {
        props.navigation.navigate("SongsArea")
    }
    
    return (
        <View style={{ flex: 1 }}>

            <LinearGradient style={{ flex: 1, paddingHorizontal: 15, paddingVertical: 8 }} colors={['#19D2C1', '#22E3AD']} >

                <View style={{ flex: 0.6, alignItems: 'center', justifyContent: 'center' }}>
                    <Icons name="music" color="black" size={60} />
                    <Text style={{ color: 'white', fontSize: 35, fontWeight: 'bold', textAlign: 'center' }}>Get Access to Millions of songs</Text>
                </View>

                <View style={{ flex: 0.4, justifyContent: 'center' }}>

                    <TouchableOpacity onPress={() => props.navigation.navigate("SignUp")}>
                        <LinearGradient style={styles.button} colors={["#40128B", "#DD58D6", "#DD58D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={styles.buttonText}>Sign Up</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <TouchableOpacity onPress={() => props.navigation.navigate("Login")}>
                        <LinearGradient style={styles.button} colors={["#40128B", "#DD58D6", "#DD58D6"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <Text style={styles.buttonText}>Log In</Text>
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.bottomLogo}>My Music</Text>

                </View>

            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    button: {
        borderRadius: 20,
        paddingVertical: 5,
        paddingHorizontal: 5,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 8
    },
    buttonText: {
        color: 'white',
        textAlign: 'center',
        textAlignVertical: 'center',
        fontSize: 20
    },
    bottomLogo: {
        position: "absolute",
        bottom: 20,
        textAlign: 'center',
        left: 0,
        right: 0,
        fontSize: 20,
        color: 'black'
    }
})
export default Welcome