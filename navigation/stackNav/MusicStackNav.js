import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import SongsTabNav from '../tabNav/SongsTabNav';
import Settings from '../../screens/songsArea/Settings';
import AboutUs from '../../screens/SettingScreens/AboutUs';
import EntryStackNav from './EntryStackNav';
import EditProfile from '../../screens/SettingScreens/EditProfile';
import Details from '../../screens/songsArea/Details';
import Welcome from '../../screens/Opening/Welcome';
const Stack = createNativeStackNavigator();

const MusicStackNav = () => {

    return (
        <Stack.Navigator initialRouteName='MusicArea'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="MusicArea" component={SongsTabNav} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Settings" component={Settings} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="EditProfile" component={EditProfile} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AboutUs" component={AboutUs} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Entry" component={Welcome} />
        </Stack.Navigator>
    )
}

export default MusicStackNav