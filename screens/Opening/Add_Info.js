import { View, Text, StyleSheet, TextInput, TouchableOpacity, ToastAndroid, Modal } from 'react-native'
import React, { useState, useEffect } from 'react'
import LinearGradient from 'react-native-linear-gradient'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import firestore from '@react-native-firebase/firestore';
import { COLORS, SIZES } from '../../constants/theme'
import DatePicker from 'react-native-date-picker'
import Loader from '../../components/Loader'
import { firebase } from "@react-native-firebase/auth";

const Add_Info = (props) => {
    const uId = storage.getString('UID')
    // console.warn(uId);
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [gender, setGender] = useState('')
    const [calendarOpen, setCalendarOpen] = useState(false)
    const [selectedDate, setSelectedDate] = useState('')
    const [date, setDate] = useState(new Date())
    const [loaderVisible, setLoaderVisible] = useState(false)

    const authStorage = async () => {
        const auth = firebase.auth().currentUser
        console.log("in authentication", auth)

        try {
            await auth.updateProfile({
                displayName: name
            })
        } catch {
            (error) => {
                console.log(error)
            }
        };
    }
  
    const SaveUserDetails = () => {
        setLoaderVisible(true)
        storage.set('Name', name)
        storage.set('Age', age)
        storage.set('Gender', gender)
        storage.set('BirthDate', selectedDate)

        try {
            (authStorage(),
                firestore()
                    .collection('Users')
                    .doc(uId)
                    .set({
                        name,
                        age,
                        gender,
                        birthDate: selectedDate
                    })
                    .then(() => {
                        ToastAndroid.show("Saved user details", 2000)
                        setTimeout(() => {
                            props.navigation.navigate("SongsArea")
                        }, 750);
                        setLoaderVisible(false)
                    }).catch(error => {
                        if (error.code === 'auth/network-request-failed') {
                            ToastAndroid.show('Check your Internet Connection!', 2000);
                        }
                        else if (error.code === 'auth/unknown') {
                            ToastAndroid.show('Internal Error! Try again later', 2000);
                        }

                        else ToastAndroid.show(error.code, 2000)
                        setLoaderVisible(false)
                    }));
        } catch (err) {
            ToastAndroid.show(err[0], 2000)
            setLoaderVisible(false)
        }

    }

    const checkLength = () => {
        return !(name.length > 0 && age.length > 0 && gender.length > 0 && selectedDate.length > 0)
    }

    function renderHeader() {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Welcome")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 18 }}>User Details</Text>
            </View>
        )
    }

    function selectingDate(date) {
        setCalendarOpen(false)
        setDate(date)
        let newDate = date.toDateString().split(' ')
        newDate = newDate[2] + '-' + newDate[1] + '-' + newDate[3]
        setSelectedDate(newDate);
        console.log(newDate);
    }

    return (
        <View style={{ flex: 1 }}>
            <Loader loaderVisible={loaderVisible} />
            {renderHeader()}
            <LinearGradient style={{ zIndex: 0, flex: 1, paddingVertical: 58 }} colors={['#22E3AD', '#19D2C1']}>
                {/* For name */}
                <View style={styles.inputBox}>
                    <Text style={styles.inputHeader}>What's your Name?</Text>
                    <TextInput style={styles.inputHolder} selectionColor={COLORS.white} onChangeText={(val) => setName(val)} value={name} />
                </View>

                {/* For age */}
                <View style={styles.inputBox}>
                    <Text style={styles.inputHeader}>What's your Age?</Text>
                    <TextInput style={styles.inputHolder} selectionColor={COLORS.white} onChangeText={(val) => setAge(val)} value={age} keyboardType='numeric' />
                </View>


                {/* For gender */}
                <View style={styles.inputBox}>
                    <Text style={styles.inputHeader}>What's your Gender?</Text>
                    <TextInput style={styles.inputHolder} selectionColor={COLORS.white} onChangeText={(val) => setGender(val)} value={gender} />
                </View>

                {/* date selector */}
                <View style={styles.inputBox}>
                    <Text style={styles.inputHeader}>What's your Birth Date?</Text>
                    <TouchableOpacity style={styles.inputHolder} onPress={() => setCalendarOpen(true)}>
                        <Text style={{ color: 'white' }}>{selectedDate}</Text>
                    </TouchableOpacity>

                    <DatePicker modal={true} mode='date' theme='dark' open={calendarOpen} date={date}
                        onConfirm={(date) => {
                            selectingDate(date)
                        }}
                        onCancel={() => {
                            setCalendarOpen(false)
                        }}
                        textColor={COLORS.MidGreen}
                        title="Select your Birth Date"
                        cancelText='Close'
                    />

                </View>

                {/* Login Text */}
                <TouchableOpacity onPress={() => SaveUserDetails()} disabled={checkLength()} style={{ alignItems: 'center' }}>
                    <Text style={[styles.loginButtonText, { backgroundColor: checkLength() ? COLORS.gray : COLORS.white, color: checkLength() ? COLORS.white : COLORS.gray }]}>Save Details</Text>
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
        marginVertical: 10,
        paddingHorizontal: 15
    },
    inputHolder: {
        borderWidth: 0.5,
        borderColor: COLORS.white,
        borderRadius: SIZES.radius,
        margin: 5,
        paddingHorizontal: 10,
        justifyContent: 'center',
        height: 40,
        fontWeight: '600'
    },
    inputHeader: {
        fontSize: SIZES.h3,
        fontWeight: '400',
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


export default Add_Info