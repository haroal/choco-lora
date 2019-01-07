import React, { Component } from 'react'
import { Button, Text, ScrollView, View, FlatList } from 'react-native'
import connect from 'react-redux/es/connect/connect'
import { State as ControllerState } from 'react-native-ble-plx'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'
import MessagesActions, { MessagesSelectors, MessagesState } from '../Redux/MessagesRedux'
import Icon from 'react-native-vector-icons/FontAwesome'

// Styles
import styles from './Styles/LaunchScreenStyles'

class LaunchScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Choco-Lora',
      headerStyle: {
        backgroundColor: '#41c5e1',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
        <View style={{marginRight: 10}}><Icon.Button
          name={'bluetooth'}
          size={20}
          onPress={navigation.getParam('bluetoothState') === BluetoothState.Connected ? navigation.getParam('onDisconnectPressed') : navigation.getParam('onConnectPressed')}
          backgroundColor={navigation.getParam('bluetoothState') === BluetoothState.Connected ? "blue" : "grey"}
          iconStyle={styles.btButtonIconBluetooth}
        /></View>
      ),
    }
  }

  constructor (props) {
    super(props)

    this.onConnectPressed = this.onConnectPressed.bind(this)
    this.onDisconnectPressed = this.onDisconnectPressed.bind(this)
    this.newMessage = this.newMessage.bind(this)
    this.seeMessagesFromDestination = this.seeMessagesFromDestination.bind(this)

    this.props.navigation.setParams({
      bluetoothState: this.props.bluetoothState,
      onDisconnectPressed: this.onDisconnectPressed,
      onConnectPressed: this.onConnectPressed
    })
  }

  async onConnectPressed () {
    if (this.props.controllerState !== ControllerState.PoweredOn) {
      await this.props.bleManager.enable()
    }
    this.props.navigation.push('ConnectionScreen')
  }

  onDisconnectPressed () {
    this.props.disconnect()
  }

  newMessage(){
    this.props.addDestination()
    this.props.navigation.push('MessagesScreen')
  }

  seeMessagesFromDestination(index){
    console.log("seeMessagesFromDestination : "+index)
    this.props.navigation.push('MessagesScreen')
    this.props.selectDestination(index)
  }

  renderItem(index){
    console.log("renderItem : "+index)
    return(
      <View><Icon.Button
        name={'plus'}
        size={20}
        onPress={() => this.seeMessagesFromDestination(index)}
      >
        {this.props.destinations[index]}
      </Icon.Button>
      </View>
    )
  }

  render () {
    return (
      <ScrollView contentContainerStyle={styles.mainContainer}>
      <View
        style={styles.vMessages}>
        <Icon.Button
          name={'plus'}
          size={20}
          backgroundColor= '#00b779'
          iconStyle={styles.btButtonIconAddMessage}
          onPress={this.newMessage}
        >New message</Icon.Button>
        <FlatList
          data={this.props.destinations}
          keyExtractor={({index}) => (index)}
          renderItem={({index}) => this.renderItem(index)}
        />
      </View>
        <View>
          <Text style={styles.authors}> By Alexis A., Thomas L. and Chloé V. </Text>
        </View>
      </ScrollView>
    )
  }
}

const mapStateToProps = (state) => ({
  bleManager: BluetoothSelectors.getManager(state),
  controllerState: BluetoothSelectors.getControllerState(state),
  bluetoothState: BluetoothSelectors.getBluetoothState(state),
  connectedDevice: BluetoothSelectors.getConnectedDevice(state),
  destinations: MessagesSelectors.getDestinations(state)
})

const mapDispatchToProps = (dispatch) => ({
  disconnect: () => dispatch(BluetoothActions.disconnect()),
  addDestination: () => dispatch(MessagesActions.addDestinationAction()),
  selectDestination: (destination) => dispatch(MessagesActions.selectDestinationAction(destination))

})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
