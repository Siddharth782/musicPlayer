import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native'
import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { storage } from '../../store/store'
import * as WebBrowser from 'expo-web-browser';
// const CLIENT_ID = 'be5a81d256794fdaa0fd2c789c428720', CLIENT_SECRET = '25b7aa32030b4b04a4975d83ae847f41'

const Welcome = (props) => {
    // console.log("Name", storage.getString('Name'))
    // console.log("UID", storage.getString('UID'))

    // for checking if the previous access token is still valid
    useEffect(() => {
        const currentTime = new Date().getTime()

        if ((currentTime - storage.getNumber('authTime')) / 1000 < 3600) {
            props.navigation.navigate("SongsArea")
        } else {
            storage.clearAll()
        }
    }, [])



    function handleKeyValues(hash) {
        const response = hash?.split("#")
        // console.log("the after hash", response[1])
        let paramsInUrl = response[1]?.split("&")
        let eachParam = paramsInUrl?.reduce((acc, currentValue) => {
            const [key, value] = currentValue?.split("=");
            acc[key] = value;
            return acc;
        }, {})

        return eachParam;
    }

    async function authentication() {


        const request = await WebBrowser.openAuthSessionAsync(`https://accounts.spotify.com/authorize?redirect_uri=app://open.my.app&response_type=token&client_id=be5a81d256794fdaa0fd2c789c428720&response_token=token&show_dialog=true&scope=user-read-private, user-read-email, user-library-read,user-read-recently-played,user-top-read,playlist-read-private,playlist-read-collaborative,playlist-modify-public`, "app://open.my.app")
        console.log(request)
        if (request.url.split("?")[1] === "error=access_denied") {
            console.log("Hello")
        }
        else if (request.type === "success") {
            let splitUpParamas = handleKeyValues(request.url);
            storage.set("accessToken", splitUpParamas?.access_token)
            storage.set("expiresIn", splitUpParamas?.expires_in)
            storage.set("tokenType", splitUpParamas?.token_type)
            storage.set("authTime", new Date().getTime())
            // console.log("the split up params", splitUpParamas)
            props.navigation.navigate("SongsArea")
        }
        else if (request.type === "cancelled") {
            ToastAndroid.show('Cancelled', 3000)
        }
        else if (request.type === "dismiss") {
            ToastAndroid.show("Failed Log In", 3000)
        }
        else {
            ToastAndroid.show("Please Enter Correct Credentials", 3000)
        }
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

                    <TouchableOpacity onPress={() => authentication()}>
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