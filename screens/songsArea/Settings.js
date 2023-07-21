import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, FONTS } from '../../constants/theme'
import { storage } from '../../store/store'
import auth, { firebase } from "@react-native-firebase/auth";
import Loader from '../../components/Loader'

const Settings = (props) => {

    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [emailVerified, setEmailVerified] = useState(false)
    const [loaderVisible, setLoaderVisible] = useState(true)

    const authStorage = async () => {
        const auth = firebase.auth().currentUser
        auth.emailVerified && setEmailVerified(true)
        console.log("in authentication", auth)
        setEmail(auth.email)
        setName(auth.displayName)
        setLoaderVisible(false)
    }


    useEffect(() => {
        authStorage()
    }, [])

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("MusicArea")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Settings</Text>
            </View>
        )
    }

    const verifyEmail = () => {
        const auth = firebase.auth().currentUser
        auth.sendEmailVerification()
    }

    const forgotPassword = async () => {
        try {
            auth()
                .sendPasswordResetEmail(email)
                .then(ToastAndroid.show("Password Reset email sent", 2000))
                .catch(error => {
                    if (error.code === 'auth/network-request-failed') {
                        ToastAndroid.show('Check your Internet Connection!', 2000);
                    }
                    else if (error.code === 'auth/unknown') {
                        ToastAndroid.show('Internal Error! Try again later', 2000);
                    }

                    else ToastAndroid.show(error.code, 2000)
                    setLoaderVisible(false)
                })
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <>
            {renderHeader()}
            <ScrollView style={{ backgroundColor: 'black', flex: 1, padding: 10 }}>
                <Loader loaderVisible={loaderVisible} />

                <View style={{ marginVertical: 5 }}>
                    <Text style={styles.infoHeader}>Email</Text>
                    <Text style={styles.info}>{email}</Text>
                </View>

                <TouchableOpacity style={{ marginVertical: 5 }} onPress={() => verifyEmail()} disabled={emailVerified}>
                    <Text style={styles.infoHeader}>Email Verification</Text>
                    <Text style={styles.info}>{emailVerified ? 'Your Email is verified' : 'Verify your Email'}</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 5 }} onPress={() => forgotPassword()}>
                    <Text style={styles.infoHeader}>Forgot Password</Text>
                    <Text style={styles.info}>Reset your password</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 5 }} onPress={() => props.navigation.navigate("EditProfile")}>
                    <Text style={styles.infoHeader}>Edit Profile</Text>
                    <Text style={styles.info}>Edit your information</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 5, }} onPress={() => props.navigation.navigate("AboutUs")}>
                    <Text style={styles.infoHeader}>About Us</Text>
                    <Text style={styles.info}>Something about App and it's Developer</Text>
                </TouchableOpacity>

                <TouchableOpacity style={{ marginVertical: 10, }} onPress={() => { props.navigation.navigate("Entry"), storage.clearAll() }} >
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