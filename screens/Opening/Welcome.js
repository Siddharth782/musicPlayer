import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid, Linking } from 'react-native'
import React, { useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { storage } from '../../store/store'
import { makeRedirectUri, useAuthRequest, AuthRequest } from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
const CLIENT_ID = 'be5a81d256794fdaa0fd2c789c428720', CLIENT_SECRET = '25b7aa32030b4b04a4975d83ae847f41'

const Welcome = (props) => {
    console.log("Name", storage.getString('Name'))
    console.log("UID", storage.getString('UID'))

    // for fetching access token and sending to other screen if logged in
    useEffect(() => {
        fetchToken()
        // if (storage.getString('UID')) {
        //     props.navigation.navigate("SongsArea")
        // }
    }, [])


    // const [request, response, promptAsync] = useAuthRequest(
    //     {
    //         clientId: CLIENT_ID,
    //         scopes: [
    //             "user-read-email",
    //             "user-library-read",
    //             "user-read-recently-played",
    //             "user-top-read",
    //             "playlist-read-private",
    //             "playlist-read-collaborative",
    //             "playlist-modify-public" // or "playlist-modify-private"
    //         ],
    //         usePKCE: false,
    //         redirectUri: makeRedirectUri({
    //             scheme: 'mycoolredirect'
    //         }),
    //     },
    //     discovery
    // );

    // useEffect(() => {
    //     console.log("this is overall response", response)
    //     if (response?.type === 'success') {
    //         const { code } = response.params;
    //         console.log("object response code", code)
    //     }
    //     else if (response?.type === 'dismiss') {
    //         ToastAndroid.show("Please Log In ", 3000)
    //     }
    // }, [response]);

    // const redirect_URI = makeRedirectUri({ scheme: "app://open.my.app" })

    const discovery = {
        authorizationEndpoint: 'https://accounts.spotify.com/authorize',
        tokenEndpoint: 'https://accounts.spotify.com/api/token',
    };

    function handleKeyValues(hash) {
        const response = hash.split("#")
        // console.log("the after hash", response[1])
        let paramsInUrl = response[1].split("&")
        let eachParam = paramsInUrl.reduce((acc, currentValue) => {
            const [key, value] = currentValue.split("=");
            acc[key] = value;
            return acc;
        }, {})

        return eachParam;
    }

    async function authentication() {
        // const request = new AuthRequest({ clientId: CLIENT_ID, scopes: ["user-read-email", "user-library-read", "playlist-read-private", "user-top-read"], redirectUri: "app://open.my.app://", URL: "https://accounts.spotify.com/authorize" });
        // console.log("object", request)
        // const result = await request.promptAsync(discovery);
        // console.log(result)
        // const url = await request.makeAuthUrlAsync(discovery);:
        
        // const request = await WebBrowser.openAuthSessionAsync(`https://accounts.spotify.com/authorize?redirect_uri=app://open.my.app&response_type=token&client_id=be5a81d256794fdaa0fd2c789c428720&response_token=token&show_dialog=true&scope=user-read-private`, "app://open.my.app")

        const request = await WebBrowser.openAuthSessionAsync(`https://accounts.spotify.com/authorize?redirect_uri=app://open.my.app&response_type=token&client_id=be5a81d256794fdaa0fd2c789c428720&response_token=token&show_dialog=true&scope=user-read-private, user-read-email, user-library-read,user-read-recently-played,user-top-read,playlist-read-private,playlist-read-collaborative,playlist-modify-public`, "app://open.my.app")
        console.log(request)
        let splitUpParamas = handleKeyValues(request.url);
        storage.set("accessToken", splitUpParamas.access_token)
        storage.set("expiresIn", splitUpParamas.expires_in)
        storage.set("tokenType", splitUpParamas.token_type)

        console.log("the split up params", splitUpParamas)
    }


    // async function authenticate() {
    //     const config = {
    //         URL: "https://accounts.spotify.com",
    //         clientId: CLIENT_ID,
    //         scopes: [
    //             "user-read-email",
    //             "user-library-read",
    //             "user-read-recently-played",
    //             "user-top-read",
    //             "playlist-read-private",
    //             "playlist-read-collaborative",
    //             "playlist-modify-public" // or "playlist-modify-private"
    //         ],
    //         redirectUrl: "app://open.my.app"
    //     }

    //     const result = await AuthSession?.AuthRequest(config);
    //     console.log("auth", result);
    //     if (result.accessToken) {
    //         const expirationDate = new Date(result.accessTokenExpirationDate).getTime();
    //         console.log("expiration date", expirationDate)
    //           AsyncStorage.setItem("token",result.accessToken);
    //           AsyncStorage.setItem("expirationDate",expirationDate.toString());
    //           navigation.navigate("Main")
    //     }
    // }

    // fetching token
    async function fetchToken() {
        try {
            fetch("https://accounts.spotify.com/api/token", {
                method: 'POST',
                headers: {
                    "Content-Type": 'application/x-www-form-urlencoded',
                },
                body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
            })
                .then((res) => res.json())
                .then((res) => { storage.set("accessToken", res.access_token), console.log("access token", res.access_token) })
                .catch((error) => {
                    ToastAndroid.show(error.message, 2000)
                })
        } catch {
            (error) => {
                ToastAndroid.show("Internal Error! Try Again later", 4000)
            }
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