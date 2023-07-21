import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, ToastAndroid } from 'react-native'
import React, { useEffect, useState } from 'react'
import { storage } from '../../store/store'
import firestore from '@react-native-firebase/firestore';
import { COLORS, SIZES } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import Loader from '../../components/Loader';
import { firebase } from "@react-native-firebase/auth";


const EditProfile = (props) => {
    let uId = storage.getString('UID')

    const [disable, setDisable] = useState(true)
    const [name, setName] = useState('')
    const [age, setAge] = useState('')
    const [birthDate, setBirthDate] = useState()
    const [loaderVisible, setLoaderVisible] = useState(true)


    const getUserData = async () => {
        const user = await firestore().collection('Users').doc(uId).get();
        if (user) {
            setName(user?._data.name)
            setAge(user?._data.age)
            setBirthDate(user?._data.birthDate)
            setLoaderVisible(false)
        }
        else {
            ToastAndroid.show("No User Data Found", 3000)
        }
    }


    useEffect(() => {
        getUserData()
    }, [])

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

    function renderHeader() {
        return (
            <View style={styles.header}>
                <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Settings")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
                <Text style={{ color: 'white', fontSize: 20 }}>Edit Data</Text>
            </View>
        )
    }

    function UpdateData() {
        try {
            authStorage()
            setLoaderVisible(true)
            firestore()
                .collection('Users')
                .doc(uId)
                .update({
                    age,
                    name,
                    birthDate
                })
                .then(() => {
                    ToastAndroid.show('User Data Updated!', 3000);
                    setLoaderVisible(false)
                    storage.set('Name', name)
                    storage.set('Age', age)
                    storage.set('BirthDate', birthDate)
                }).catch((err) => {
                    setLoaderVisible(false)
                    let message = err.message.split(' ')
                    let showingMessage = ''
                    for (let index = 1; index < message.length; index++) {
                        showingMessage += message[index] += ' '
                    }
                    ToastAndroid.show(showingMessage, 3000)
                })
        } catch (error) {
            console.log(error)
            setLoaderVisible(false)
        }
    }

    return (
        <ScrollView style={{ flex: 1, backgroundColor: 'black' }}>
            <Loader loaderVisible={loaderVisible} />
            {renderHeader()}
            <View style={styles.dataBox}>
                <Text style={styles.inputHeader}>Name</Text>
                <TextInput value={name} style={styles.inputHolder} onChangeText={(val) => (setName(val), setDisable(false))} />
            </View>

            <View style={styles.dataBox}>
                <Text style={styles.inputHeader}>Age</Text>
                <TextInput value={age} style={styles.inputHolder} onChangeText={(val) => (setAge(val), setDisable(false))} />
            </View>

            <View style={styles.dataBox}>
                <Text style={styles.inputHeader}>Birth Date</Text>
                <TextInput value={birthDate} style={styles.inputHolder} onChangeText={(val) => (setBirthDate(val), setDisable(false))} />
            </View>

            <TouchableOpacity onPress={() => UpdateData()} style={{ marginTop: 20, backgroundColor: disable ? COLORS.gray : COLORS.green, borderRadius: SIZES.radius, height: 40, alignItems: 'center', justifyContent: 'center', width: '40%', alignSelf: 'center' }} disabled={disable}>
                <Text style={{ color: 'white', fontSize: 18 }}>Save</Text>
            </TouchableOpacity>


        </ScrollView >
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
        backgroundColor: COLORS.gray,
        marginBottom: 10
    },
    inputHolder: {
        borderBottomWidth: 0.5,
        borderColor: 'white',
        height: 40,
        paddingHorizontal: 5
    },
    inputHeader: {
        fontWeight: '500',
        color: 'white'
    },
    dataBox: {
        marginVertical: 10,
        paddingHorizontal: 10
    }
})

export default EditProfile