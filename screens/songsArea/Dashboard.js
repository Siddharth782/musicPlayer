import { View, Text, ScrollView, TouchableOpacity, ImageBackground } from 'react-native'
import React, { useEffect } from 'react'
import { COLORS } from '../../constants/theme'
import { storage } from '../../store/store'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { flowers, original, rock, spring, trees } from '../../assets/images'
// import { doc, getDoc } from "firebase/firestore";

const Dashboard = (props) => {
    const userName = storage.getString('Name')
    let firstName = userName?.split(' ')[0]

    return (
        <ScrollView style={{ backgroundColor: COLORS.black, flex: 1, paddingVertical: 10 }}>
            <View style={{ padding: 15, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <Text style={{ color: 'white', fontSize: 20 }}>Welcome {firstName}</Text>
                <TouchableOpacity onPress={() => props.navigation.navigate("Settings")}>
                    <Icon name="cog" color={COLORS.white} size={20} />
                </TouchableOpacity>
            </View>
        </ScrollView>
    )
}

export default Dashboard