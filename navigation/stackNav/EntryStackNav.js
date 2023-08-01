import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
const Stack = createNativeStackNavigator();
import Welcome from '../../screens/Opening/Welcome';
import SongsTabNav from '../tabNav/SongsTabNav';
import Details from '../../screens/songsArea/Details';
import AboutUs from '../../screens/SettingScreens/AboutUs';
import Settings from '../../screens/songsArea/Settings';
import AddtoPlaylist from '../../screens/songsArea/AddtoPlaylist';

const EntryStackNav = () => {
    return (
        <Stack.Navigator screenOptions={{ animationTypeForReplace: 'push' }} initialRouteName='Welcome'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Welcome" component={Welcome} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="MusicArea" component={SongsTabNav} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AddtoPlaylist" component={AddtoPlaylist} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Settings" component={Settings} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AboutUs" component={AboutUs} />
        </Stack.Navigator>
    )
}

export default EntryStackNav