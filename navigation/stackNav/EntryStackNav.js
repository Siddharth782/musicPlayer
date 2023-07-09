import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Welcome from '../../screens/Opening/Welcome';
import SignUp from '../../screens/Opening/SignUp';
import Login from '../../screens/Opening/Login';

const EntryStackNav = () => {
    return (
        <Stack.Navigator>
            <Stack.Screen options={{gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Welcome" component={Welcome} />
            <Stack.Screen options={{gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="SignUp" component={SignUp} />
            <Stack.Screen options={{gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Login" component={Login} />
        </Stack.Navigator>
    )
}

export default EntryStackNav