import React, { Component } from 'react'
import { ScrollView, Text, TextInput, View, FlatList } from 'react-native'
import { connect } from 'react-redux'
import MessagesActions, {MessagesSelectors, MessageType } from '../Redux/MessagesRedux'
import BluetoothActions from '../Redux/BluetoothRedux'

// Styles
import styles from './Styles/MessagesScreenStyle'

class MessagesScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: 'Message à',
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
      headerRight: (
        <TextInput
          style={styles.destinationTextInput}
          onSubmitEditing={navigation.getParam('onContactIdSubmitted')}
          onChangeText={navigation.getParam('onContactIdChanged')}
        />
      ),
    }
  }


  constructor (props) {
    super(props)

    this.state = {
      messageText: "",
      contactIdText: ""
    }

    this.sendMessage = this.sendMessage.bind(this)
    this.onContactIdChanged = this.onContactIdChanged.bind(this)
    this.onContactIdSubmitted = this.onContactIdSubmitted.bind(this)

    this.props.navigation.setParams({
      onContactIdChanged: this.onContactIdChanged,
      onContactIdSubmitted: this.onContactIdSubmitted
    })
  }

  onContactIdChanged (text) {
      this.setState({
        contactIdText: text
      })
  }

  onContactIdSubmitted () {
      this.props.setContactId(this.state.contactIdText)
  }

  sendMessage () {
    this.props.sendingMessage(this.state.messageText)
    //this.props.writeBluetooth(this.state.messageText)
    console.log(this.state.messageText)
  }

  renderItem({ item }){
    if (item.type === MessageType.RECEIVED){
      return(
        <View>
          <Text style={{color:"black"}}>{item.message}</Text>
        </View>
      )
    }else{
      return(
        <View>
          <Text style={{color:"red"}}>{item.message}</Text>
        </View>
      )
    }
  }

  render () {
    return (
      <ScrollView contentContainerStyle={styles.container}>
        <FlatList
          data={this.props.previousMessages}
          keyExtractor={(item, index) => index.toString()}
          renderItem={this.renderItem}
        />
        <TextInput
          name='message'
          editable={this.props.contactId !== null}
          style={styles.messageTextInput}
          onChangeText={(text) => this.setState({ messageText:text })}
          onSubmitEditing={this.sendMessage}
        />
      </ScrollView>
    )
  }
}

// TODO: get messages for contact id

const mapStateToProps = (state) => {
  return {
    previousMessages: MessagesSelectors.getPreviousMessages(state),
    contactId: MessagesSelectors.getCurrentContactId(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendingMessage: (message) => dispatch(MessagesActions.sendMessageAction(message)),
    setContactId: (contactId) => dispatch(MessagesActions.setContactId(contactId)),
    writeBluetooth: (message) => dispatch(BluetoothActions.write(message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesScreen)
