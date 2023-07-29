import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Dashboard from '../../screens/songsArea/Dashboard';
import { COLORS } from '../../constants/theme';
import Search from '../../screens/songsArea/Search';
import FirstScreenStackNav from '../stackNav/FirstScreenStackNav';

const Tab = createMaterialBottomTabNavigator();

const SongsTabNav = () => {
    return (
        <Tab.Navigator initialRouteName='FirstScreen'  barStyle={{ height:70 }} shifting={true} activeColor={COLORS.green} inactiveColor={COLORS.blue} >
            <Tab.Screen name="FirstScreen" component={FirstScreenStackNav} />
            <Tab.Screen name="Search" component={Search} />
            <Tab.Screen name="Library" component={Dashboard} />
        </Tab.Navigator>
    )
}

export default SongsTabNav