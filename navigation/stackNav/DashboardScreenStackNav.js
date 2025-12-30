import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Dashboard from '../../screens/songsArea/Dashboard';
import Details from '../../screens/songsArea/Details';
const Stack = createNativeStackNavigator();

const DashboardScreenStackNav = () => {
    return (
        <Stack.Navigator initialRouteName='Dashboard'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Dashboard" component={Dashboard} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
        </Stack.Navigator>
    )
}

export default DashboardScreenStackNav