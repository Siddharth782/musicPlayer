import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Dashboard from '../../screens/songsArea/Dashboard';

const Tab = createMaterialBottomTabNavigator();

const SongsTabNav = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Dashboard" component={Dashboard} />
        </Tab.Navigator>
    )
}

export default SongsTabNav