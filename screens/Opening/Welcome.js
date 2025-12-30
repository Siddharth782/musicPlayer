import { View, Text, TouchableOpacity, StyleSheet, ToastAndroid } from 'react-native'
import React, { useState, useContext } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icons from 'react-native-vector-icons/MaterialCommunityIcons'
import { storage } from '../../store/store'
import * as WebBrowser from 'expo-web-browser';
import * as Crypto from 'expo-crypto';
import base64js from 'base64-js';
import { getQueryParams } from '../../utils/queryParser'
import { AuthContext } from '../../context/AuthContext';
import { SPOTIFY_AUTH } from '../../config/config'

function base64UrlEncode(base64) {
    return base64
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');
}

async function generateCodeVerifier() {
    const randomBytes = await Crypto.getRandomBytesAsync(32); // Uint8Array
    const base64 = base64js.fromByteArray(randomBytes);
    return base64UrlEncode(base64);
}

async function generateCodeChallenge(verifier) {

    const digest = await Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        verifier,
        { encoding: Crypto.CryptoEncoding.BASE64 }
    );
    return base64UrlEncode(digest);
}

async function exchangeCodeForToken(code) {
    const verifier = storage.getString('pkce_verifier');

    if (!verifier) {
        throw new Error('Error while logging in. Please try again.');
    }

    const response = await fetch(
        SPOTIFY_AUTH.TOKEN_URL,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body:
                `client_id=${SPOTIFY_AUTH.CLIENT_ID}` +
                `&grant_type=authorization_code` +
                `&code=${encodeURIComponent(code)}` +
                `&redirect_uri=${encodeURIComponent(SPOTIFY_AUTH.REDIRECT_URI)}` +
                `&code_verifier=${encodeURIComponent(verifier)}`,
        }
    );

    if (!response.ok) {
        storage.delete('pkce_verifier');
        throw new Error('Error while logging in. Please try again.');
    }

    const data = await response.json();
    // console.log("This is the token response ", data)
    const expiresAt = Date.now() + data.expires_in * 1000;

    if (!data.access_token) {
        storage.delete('pkce_verifier');
        throw new Error('Error while logging in. Please try again.');
    }

    storage.set('accessToken', data.access_token);
    storage.set('expiresAt', expiresAt);

    if (data.refresh_token) {
        storage.set('refreshToken', data.refresh_token);
    }

    storage.delete('pkce_verifier');

}

const Welcome = (props) => {

    const { loginSuccess, clearAuth } = useContext(AuthContext);
    const [authInProgress, setAuthInProgress] = useState(false);


    async function authentication() {

        if (authInProgress) return;
        setAuthInProgress(true);

        try {
            const random = await Crypto.getRandomBytesAsync(16);
            const state = base64UrlEncode(base64js.fromByteArray(random));

            storage.set('oauth_state', state);

            const verifier = await generateCodeVerifier();
            const challenge = await generateCodeChallenge(verifier);

            storage.set('pkce_verifier', verifier);

            const authParams = new URLSearchParams({
                client_id: SPOTIFY_AUTH.CLIENT_ID,
                response_type: 'code',
                redirect_uri: SPOTIFY_AUTH.REDIRECT_URI,
                code_challenge_method: 'S256',
                code_challenge: challenge,
                scope: SPOTIFY_AUTH.SCOPES,
                show_dialog: 'true',
                state: state
            });

            const authUrl = `${SPOTIFY_AUTH.AUTH_URL}?${authParams.toString()}`;

            const request = await WebBrowser.openAuthSessionAsync(authUrl, SPOTIFY_AUTH.REDIRECT_URI);

            // console.log("This is the auth response ", request)

            if (request.type === "success") {
                const params = getQueryParams(request.url);

                if (params?.state !== storage.getString('oauth_state')) {
                    clearAuth();
                    ToastAndroid.show('Login failed. Please try again.', 3000);
                    return;
                }

                storage.delete('oauth_state');

                if (params.error === "access_denied") {
                    clearAuth();
                    ToastAndroid.show('Access denied. Try logging in again', 3000);
                    return;
                }
                if (!params.code) {
                    ToastAndroid.show('Error while logging in. Please try again.', 3000);
                    return;
                }

                try {
                    await exchangeCodeForToken(params.code);
                    loginSuccess();
                } catch {
                    clearAuth();
                    ToastAndroid.show('Error while logging in. Please try again.', 3000);
                }

            }
            else if (request.type === "cancelled") {
                ToastAndroid.show('Cancelled', 3000)
            }
            else if (request.type === "dismiss") {
                ToastAndroid.show("Failed Log In", 3000)
            }
            else {
                ToastAndroid.show("Please Try again", 3000)
            }
        } finally {
            setAuthInProgress(false);
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

                    <TouchableOpacity onPress={() => authentication()}>
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