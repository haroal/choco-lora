import React, { Component } from 'react'
import { Button, Text, ScrollView, View, FlatList } from 'react-native'
import { State as ControllerState } from 'react-native-ble-plx'
import { connect } from 'react-redux'
import RNAndroidLocationEnabler from 'react-native-android-location-enabler'
import Icon from 'react-native-vector-icons/FontAwesome'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'
import MessagesActions, { MessagesSelectors } from '../Redux/MessagesRedux'

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
        <View style={{ marginRight: 10 }}>
          <Icon.Button
            name={'bluetooth'}
            size={20}
            onPress={navigation.getParam('bluetoothState') === BluetoothState.Connected ? navigation.getParam('onDisconnectPressed') : navigation.getParam('onConnectPressed')}
            backgroundColor={'#41c5e1'}
            iconStyle={navigation.getParam('bluetoothState') === BluetoothState.Connected ? styles.btButtonIconBluetoothC : styles.btButtonIconBluetoothD}
          />
        </View>
      ),
    }
  }

  constructor (props) {
    super(props)

    this.onConnectPressed = this.onConnectPressed.bind(this)
    this.onDisconnectPressed = this.onDisconnectPressed.bind(this)
    this.renderItem = this.renderItem.bind(this)
    this.newMessage = this.newMessage.bind(this)
    this.seeMessagesFromDestination = this.seeMessagesFromDestination.bind(this)

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

  newMessage(){
    this.props.setContactId(null)
    this.props.navigation.push('MessagesScreen')
  }

  seeMessagesFromDestination(contact){
    console.log("seeMessagesFromDestination : ", contact)
    this.props.setContactId(contact)
    this.props.navigation.push('MessagesScreen')
  }

  renderItem({ item }){
    return(
      <View style={styles.vItemList}>
        <Icon.Button
          name={'user'}
          size={30}
          backgroundColor= 'white'
          onPress={() => this.seeMessagesFromDestination(item)}
          style={styles.btItemList}
          iconStyle={{color: '#00b779'}}
          color="#00b779"
        >
          {item}
        </Icon.Button>
      </View>
    )
  }

  render () {
    return (
      <ScrollView contentContainerStyle={styles.mainContainer}>
        <View
          style={styles.vMessages}>
          <View style={styles.vNewMessage}>
            <Icon.Button
              name={'plus'}
              size={20}
              backgroundColor= '#00b779'
              iconStyle={styles.btButtonIconAddMessage}
              onPress={this.newMessage}
            >
              Nouveau message
            </Icon.Button>
          </View>

          <FlatList
            data={this.props.contacts}
            keyExtractor={(item, index) => index.toString()}
            renderItem={this.renderItem}
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
  contacts: MessagesSelectors.getContacts(state)
})

const mapDispatchToProps = (dispatch) => ({
  disconnect: () => dispatch(BluetoothActions.disconnect()),
  setContactId: (contactId) => dispatch(MessagesActions.setContactId(contactId)),
  onError: (error) => dispatch(BluetoothActions.onError(error))
})

export default connect(mapStateToProps, mapDispatchToProps)(LaunchScreen)
