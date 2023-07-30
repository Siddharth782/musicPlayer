import React from 'react'
import { createMaterialBottomTabNavigator } from '@react-navigation/material-bottom-tabs';
import Dashboard from '../../screens/songsArea/Dashboard';
import { COLORS } from '../../constants/theme';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import MaterialIcon from 'react-native-vector-icons/MaterialIcons'
import DashboardScreenStackNav from '../stackNav/DashboardScreenStackNav';
import SearchScreenStackNav from '../stackNav/SearchScreenStackNav';
const Tab = createMaterialBottomTabNavigator();

const SongsTabNav = () => {
    return (
        <Tab.Navigator initialRouteName='DashboardScreen' barStyle={{ height: 65, backgroundColor: '#694fad' }} activeColor={COLORS.green} inactiveColor={COLORS.gray} shifting={true} labeled={true} >

            <Tab.Screen name="DashboardScreen" options={{tabBarLabel: 'Dashboard', tabBarIcon: ({ color }) => (
                    <Icon name="home" color={color} size={26} />
                ),
            }} component={DashboardScreenStackNav} />

            <Tab.Screen name="SearchScreen" options={{ tabBarLabel: 'Search',
                tabBarIcon: ({ color }) => (
                    <Icon name="magnify" color={color} size={26} />
                ),
            }} component={SearchScreenStackNav} />

            <Tab.Screen name="Library" options={{tabBarLabel: 'Library',
                tabBarIcon: ({ color }) => (
                    <MaterialIcon name="my-library-music" color={color} size={26} />
                ),
            }} component={Dashboard} />

        </Tab.Navigator>
    )
}

export default SongsTabNav