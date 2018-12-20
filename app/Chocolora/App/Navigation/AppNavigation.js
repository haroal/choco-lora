import { createStackNavigator, createAppContainer } from 'react-navigation'
import MessagesScreen from '../Containers/MessagesScreen'
import LaunchScreen from '../Containers/LaunchScreen'
import ConnectionScreen from '../Containers/ConnectionScreen'

import styles from './Styles/NavigationStyles'

// Manifest of possible screens
const PrimaryNav = createStackNavigator({
  MessagesScreen: { screen: MessagesScreen },
  ConnectionScreen: { screen: ConnectionScreen },
  LaunchScreen: { screen: LaunchScreen }
}, {
  // Default config for all screens
  headerMode: 'screen',
  initialRouteName: 'LaunchScreen',
  navigationOptions: {
    headerStyle: styles.header
  }
})

export default PrimaryNav
