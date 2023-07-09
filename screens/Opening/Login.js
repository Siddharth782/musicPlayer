import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useState } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS, SIZES } from '../../constants/theme'
import auth from '@react-native-firebase/auth';

const Login = (props) => {

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hidePassword, setHidePassword] = useState(true)

    const checkLength = () => {
        if (email.length > 3 && password.length > 3) {
            return false
        } else return true
    }

    const renderHeader = () => {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Welcome")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Login</Text>
            </View>
        )
    }

    const LoginUser = () => {

        try {
            auth()
                .signInWithEmailAndPassword(email, password)
                .then(() => {
                    ToastAndroid.show('Logged in successfully!', 4000);
                })
                .catch(error => {
                    if (error.code === 'auth/user-not-found') {
                        return ToastAndroid.show('No user with this account. Please Sign Up', 4000);
                    }
                    console.error(error);
                });
        } catch (error) {
            console.log(error)
        }
    }

    return (
        <View style={{ flex: 1 }}>
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
                    </View>

                </View>

                {/* Login Text */}
                <TouchableOpacity onPress={() => LoginUser()} disabled={checkLength()} style={{ alignItems: 'center' }}>
                    <Text style={[styles.loginButtonText, { backgroundColor: checkLength() ? COLORS.gray : COLORS.white, color: checkLength() ? COLORS.white : COLORS.gray }]}>Login</Text>
                </TouchableOpacity>

                {/* Forgot passowrd */}
                <TouchableOpacity style={{ alignItems: 'center', marginVertical: 5 }}>
                    <Text style={{ color: COLORS.white, fontSize: 15 }}>Forgot Password?</Text>
                </TouchableOpacity>

            </LinearGradient>
        </View >
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
        width: '100%',
        flexDirection: 'row',
    },
    inputBox: {
        marginVertical: 10
    },
    inputHolder: {
        borderWidth: 0.5,
        borderColor: COLORS.white,
        borderRadius: SIZES.radius,
        margin: 5,
        justifyContent: 'center',
        paddingHorizontal: 10,
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

export default Login