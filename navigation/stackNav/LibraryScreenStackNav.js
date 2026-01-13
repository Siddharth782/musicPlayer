import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Details from '../../screens/songsArea/Details';
import Library from '../../screens/songsArea/Library';
import AddPlaylist from '../../screens/songsArea/AddPlaylist';
import AddtoPlaylist from '../../screens/songsArea/AddtoPlaylist';
import AddSong from '../../screens/songsArea/AddSong';
const Stack = createNativeStackNavigator();

const LibraryScreenStackNav = () => {
    return (
        <Stack.Navigator initialRouteName='Library'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Library" component={Library} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AddPlaylist" component={AddPlaylist} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AddtoPlaylist" component={AddtoPlaylist} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="AddSong" component={AddSong} />
        </Stack.Navigator>
    )
}

export default LibraryScreenStackNav