import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Details from '../../screens/songsArea/Details';
import Dashboard from '../../screens/songsArea/Dashboard';
const Stack = createNativeStackNavigator();

const FirstScreenStackNav = () => {
    return (
        <Stack.Navigator initialRouteName='Dashboard'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Dashboard" component={Dashboard} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
        </Stack.Navigator>
    )
}

export default FirstScreenStackNav