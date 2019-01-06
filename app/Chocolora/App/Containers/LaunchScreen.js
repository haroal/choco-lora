import React, { Component } from 'react'
import { Text, ScrollView, View } from 'react-native'
import { connect } from 'react-redux'
import { State as ControllerState } from 'react-native-ble-plx'
import RNAndroidLocationEnabler from 'react-native-android-location-enabler';
import Icon from 'react-native-vector-icons/FontAwesome'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'

// Styles
import styles from './Styles/LaunchScreenStyles'
import MessagesActions from '../Redux/MessagesRedux';

class LaunchScreen extends Component {
  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Choco-Lora',
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
        <Icon.Button
          name={'bluetooth'}
          size={20}
          onPress={navigation.getParam('bluetoothState') === BluetoothState.Connected ? navigation.getParam('onDisconnectPressed') : navigation.getParam('onConnectPressed')}
          backgroundColor={navigation.getParam('bluetoothState') === BluetoothState.Connected ? "blue" : "grey"}
          iconStyle={styles.btButtonIconBluetooth}
        />
      ),
    }
  }

  constructor (props) {
    super(props)

    this.displayConnectionButton = this.displayConnectionButton.bind(this)
    this.onConnectPressed = this.onConnectPressed.bind(this)
    this.onDisconnectPressed = this.onDisconnectPressed.bind(this)
    this.newMessage = this.newMessage.bind(this)

    this.props.navigation.setParams({
      bluetoothState: this.props.bluetoothState,
      onDisconnectPressed: this.onDisconnectPressed,
      onConnectPressed: this.onConnectPressed
    })
  }

  componentDidUpdate (prevProps) {
    if (prevProps.bluetoothState !== this.props.bluetoothState) {
      this.props.navigation.setParams({
        bluetoothState: this.props.bluetoothState
      })
    }
  }

  async onConnectPressed () {
    try {
      await RNAndroidLocationEnabler.promptForEnableLocationIfNeeded({ interval: 10000, fastInterval: 5000 })

      if (this.props.controllerState !== ControllerState.PoweredOn) {
        await this.props.bleManager.enable()
      }
      this.props.navigation.push('ConnectionScreen')
    } catch (err) {
      this.props.onError(err)
    }
  }

  onDisconnectPressed () {
    this.props.disconnect()
  }

  displayConnectionButton () {
    if (this.props.bluetoothState === BluetoothState.Connected) {
      return (
        <View style={{alignItems: 'center'}}>
          <Text style={styles.nameDeviceConnected}>Connecté à {this.props.connectedDevice.id}</Text>
          <View style={styles.btDisconnectButton}>
            <Icon.Button
              name={'bluetooth'}
              size={20}
              onPress={this.onDisconnectPressed}
              backgroundColor="grey"
              iconStyle={styles.btButtonIcon}>
            </Icon.Button>
          </View>
        </View>
      )
    } else {
      return (
        <View style={styles.btConnectButton}>
          <Icon.Button
            name={'bluetooth'}
            size={20}
            onPress={this.onConnectPressed}
            backgroundColor="grey"
            iconStyle={styles.btButtonIcon}>
          </Icon.Button>
        </View>
      )
    }
  }

  newMessage(){
    this.props.setContactId(null)
    this.props.navigation.push('MessagesScreen')
  }

  render () {
    return (
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <View>
          <Icon.Button
            name={'plus'}
            size={20}
            backgroundColor="blue"
            iconStyle={styles.btButtonIconAddMessage}
            onPress={this.newMessage}
          >New message</Icon.Button>
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
  connectedDevice: BluetoothSelectors.getConnectedDevice(state)
})

const mapDispatchToProps = (dispatch) => ({
  disconnect: () => dispatch(BluetoothActions.disconnect()),
  setContactId: (contactId) => dispatch(MessagesActions.setContactId(contactId)),
  onError: (error) => dispatch(BluetoothActions.onError(error))
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
