import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Search from '../../screens/songsArea/Search';
import Details from '../../screens/songsArea/Details';
const Stack = createNativeStackNavigator();

const SearchScreenStackNav = () => {
  return (
    <Stack.Navigator initialRouteName='Dashboard'>
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Search" component={Search} />
            <Stack.Screen options={{ gestureEnabled: false, headerShown: false, headerLeft: () => <></>, }} name="Details" component={Details} />
        </Stack.Navigator>
  )
}

export default SearchScreenStackNav