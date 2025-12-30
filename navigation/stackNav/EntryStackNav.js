import React, { useContext } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Welcome from '../../screens/Opening/Welcome';
import SongsTabNav from '../tabNav/SongsTabNav';
import Details from '../../screens/songsArea/Details';
import AboutUs from '../../screens/SettingScreens/AboutUs';
import Settings from '../../screens/songsArea/Settings';
import AddtoPlaylist from '../../screens/songsArea/AddtoPlaylist';
import AddSong from '../../screens/songsArea/AddSong';

import { AuthContext } from '../../context/AuthContext';
import Loader from '../../components/Loader';

const Stack = createNativeStackNavigator();

const EntryStackNav = () => {
    const { isAuthenticated } = useContext(AuthContext);

    if (isAuthenticated === null) {
        return <Loader />;
    }

    return (

        <Stack.Navigator screenOptions={{ headerShown: false, animation: isAuthenticated ? 'default' : 'none' }}>
            {isAuthenticated ? (
                <>
                    <Stack.Screen name="MusicArea" options={{
                        animation: 'slide_from_right',
                    }} component={SongsTabNav} />
                    <Stack.Screen name="Details" options={{
                        animation: 'slide_from_right',
                    }} component={Details} />
                    <Stack.Screen name="AddtoPlaylist" options={{
                        animation: 'slide_from_bottom',
                    }} component={AddtoPlaylist} />
                    <Stack.Screen name="AddSong" options={{
                        animation: 'slide_from_bottom',
                    }} component={AddSong} />
                    <Stack.Screen name="Settings" options={{
                        animation: 'fade',
                    }} component={Settings} />
                    <Stack.Screen name="AboutUs" options={{
                        animation: 'fade',
                    }} component={AboutUs} />
                </>
            ) : (
                <Stack.Screen name="Welcome" component={Welcome} />
            )}
        </Stack.Navigator>
    );
}

export default EntryStackNav