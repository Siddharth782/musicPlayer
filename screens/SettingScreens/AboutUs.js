import { View, Text, StyleSheet } from 'react-native'
import React from 'react'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { COLORS } from '../../constants/theme'

const AboutUs = (props) => {
  const renderHeader = () => {
    return (
      <View style={styles.header}>
        <Icon name='arrow-left-thin' onPress={() => props.navigation.navigate("Settings")} style={{ position: 'absolute', left: 10 }} color={'white'} size={32} />
        <Text style={{ color: 'white', fontSize: 20 }}>App Theme</Text>
      </View>
    )
  }
  return (
    <View style={{ flex: 1, backgroundColor: 'black' }}>
      {renderHeader()}
      <Text>AboutUs</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    height: 50,
    zIndex: 1,
    top: 0,
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    flexDirection: 'row',
    backgroundColor: COLORS.gray
  },
})

export default AboutUs