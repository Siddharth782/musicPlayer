import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, SIZES } from '../../constants/theme'
import auth from '@react-native-firebase/auth';
import { storage } from '../../store/store'
import Loader from '../../components/Loader'

const SignUp = (props) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hidePassword, setHidePassword] = useState(true)
    const [loaderVisible, setLoaderVisible] = useState(false)

    const checkLength = () => {
        return !(email.length > 3 && password.length >= 8)
    }

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Welcome")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 18 }}>Create Account</Text>
            </View>
        )
    }

    const CreateUser = () => {
        setLoaderVisible(true)
        try {
            auth()
                .createUserWithEmailAndPassword(email, password)
                .then((res) => {
                    if (res.user.uid) {
                        storage.set('UID', res.user.uid)
                        setTimeout(() => {
                            props.navigation.navigate("AddInfo")
                        }, 400);
                        ToastAndroid.show('User account created!', 2000);
                        setLoaderVisible(false)
                    }
                })
                .catch(error => {
                    if (error.code === 'auth/email-already-in-use') {
                        ToastAndroid.show('Email already in use! Please Login to your account', 2000);
                    }

                    else if (error.code === 'auth/invalid-email') {
                        ToastAndroid.show('Email address is invalid!', 2000);
                    }

                    else if (error.code === 'auth/network-request-failed') {
                        ToastAndroid.show('Please check your Internet connection!', 2000);
                    } 
                    else if (error.code === 'auth/unknown') {
                        ToastAndroid.show('Internal Error! Try again later', 2000);
                    } 

                    else ToastAndroid.show(error.code, 2000)
                    setLoaderVisible(false)
                });
        } catch (error) {
            ToastAndroid.show(error[0], 2000)
            setLoaderVisible(false)
        }
    }

    return (
        <View style={{ flex: 1 }}>
            <Loader loaderVisible={loaderVisible} />
            {renderHeader()}
            <LinearGradient style={{ zIndex: 0, flex: 1, paddingHorizontal: 15, paddingVertical: 58 }} colors={['#19D2C1', '#22E3AD']} >

                {/* For input of email and password */}
                <View style={{ marginVertical: 15 }}>

                    {/* For email */}
                    <View style={styles.inputBox}>
                        <Text style={styles.inputHeader}>What's your Email?</Text>
                        <TextInput style={styles.inputHolder} selectionColor={COLORS.white} onChangeText={(val) => setEmail(val)} value={email} />
                    </View>

                    {/* for password */}
                    <View style={styles.inputBox}>
                        <Text style={styles.inputHeader}>What's your Password?</Text>
                        <View style={styles.inputHolder}>
                            <TextInput secureTextEntry={hidePassword} selectionColor={COLORS.white} onChangeText={(val) => setPassword(val)} value={password} />
                            <Icon name={hidePassword ? "eye" : "eye-off"} color={COLORS.white} style={{ position: 'absolute', right: 20 }} size={20} onPress={() => setHidePassword(!hidePassword)} />
                        </View>
                        <Text style={{ fontSize: SIZES.body5, fontWeight: 300, color: COLORS.white, marginHorizontal: 10 }}> {password.length < 8 && "Use atleast 8 characters"}</Text>
                    </View>

                </View>

                {/* Login Text */}
                <TouchableOpacity onPress={() => CreateUser()} disabled={checkLength()} style={{ alignItems: 'center' }}>
                    <Text style={[styles.loginButtonText, { backgroundColor: checkLength() ? COLORS.gray : COLORS.white, color: checkLength() ? COLORS.white : COLORS.gray }]}>Sign Up</Text>
                </TouchableOpacity>

            </LinearGradient>
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        height: 50,
        position: 'absolute',
        zIndex: 1,
        top: 0,
        alignItems: 'center',
        justifyContent: 'center',
        width: '100%'
    },
    inputBox: {
        marginVertical: 10
    },
    inputHolder: {
        borderWidth: 0.5,
        borderColor: COLORS.white,
        borderRadius: SIZES.radius,
        margin: 5,
        paddingHorizontal: 10,
        justifyContent: 'center'
    },
    inputHeader: {
        fontSize: SIZES.h3,
        fontWeight: '500',
        color: COLORS.white
    },
    loginButtonText: {
        alignItems: 'center',
        borderRadius: SIZES.radius * 2,
        marginVertical: 5,
        paddingVertical: 5,
        paddingHorizontal: 25,
        fontSize: 20
    }
})

export default SignUp