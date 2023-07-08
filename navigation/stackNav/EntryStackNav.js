import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Welcome from '../../screens/Opening/Welcome';

const EntryStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{headerShown:false}}>
            <Stack.Screen name="Welcome" component={Welcome} />
        </Stack.Navigator>
    )
}

export default EntryStackNav