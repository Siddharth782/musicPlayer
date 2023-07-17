import { View, Text, findNodeHandle } from 'react-native'
import React from 'react'
import { COLORS } from '../../constants/theme'
import { storage } from '../../store/store'

const Dashboard = () => {
    const userName = storage.getString('Name')
    let firstName = userName.split(' ')[0]

    return (
        <View style={{ backgroundColor: COLORS.black, flex: 1 }}>
            <Text>Welcome {firstName}</Text>
        </View>
    )
}

export default Dashboard