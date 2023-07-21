import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Welcome from '../../screens/Opening/Welcome';
import SignUp from '../../screens/Opening/SignUp';
import Login from '../../screens/Opening/Login';
import Add_Info from '../../screens/Opening/Add_Info';
import MusicStackNav from './MusicStackNav';

const EntryStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{ animationTypeForReplace: 'push' }} initialRouteName='Welcome'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Welcome" component={Welcome} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="SignUp" component={SignUp} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Login" component={Login} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AddInfo" component={Add_Info} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="SongsArea" component={MusicStackNav} />
        </Stack.Navigator>
    )
}

export default EntryStackNav