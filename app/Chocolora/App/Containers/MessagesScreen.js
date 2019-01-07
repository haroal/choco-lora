import React, { Component } from 'react'
import { Button, Text, ScrollView, View, FlatList, TextInput } from 'react-native'
import connect from 'react-redux/es/connect/connect'
import BluetoothActions, { BluetoothSelectors, BluetoothState } from '../Redux/BluetoothRedux'
import MessagesActions, { MessagesSelectors, MessagesState } from '../Redux/MessagesRedux'

// Styles
import styles from './Styles/MessagesScreenStyle'

class MessagesScreen extends Component {

  static navigationOptions = ({ navigation }) => {
    return {
      title: navigation.getParam('selectedDestination'),
      headerStyle: {
        backgroundColor: '#f4511e',
      },
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      }
    }
  }


  constructor (props) {
    super(props)
    this.sendMessage = this.sendMessage.bind(this)
    this.setDestinationName = this.setDestinationName.bind(this)
    this.state = {
      messageText:"",
      nameText:""
    }
    //this.props.navigation.state.params.title = "test"
    this.props.navigation.setParams({
      selectedDestination: "Message à "+String(this.props.selectedDestination[1]),
    })
  }

  renderNameInput(){
    return (
      <TextInput
      //style={styles.destinationTextInput}
      onChangeText={(text) => {
        this.setState({nameText : text})
      }}
      onSubmitEditing={() => {
        this.setDestinationName()
      }}
      //value={this.state.text}
      />
    )
  }

  sendMessage(){
    this.props.sendingMessage(this.state.messageText)
    //this.props.writeBluetooth(this.state.messageText)
    //this.setState([name]: value);
  }

  setDestinationName(){
    this.props.setDestinationNameValidate(this.state.nameText)
    console.log(this.props.destinations)
  }

  renderItem({item}){
    if (item[0]===1){
      return(
        <View>
          <Text style={{color:"black"}}>{item[2]}</Text>
        </View>
      )
    }else{

    }
  }

  render () {
    //console.log("render message screen : "+this.props.selectedDestination)
    if(this.props.selectedDestination[1]==="?"){
      return (
        <ScrollView contentContainerStyle={styles.container}>
          {this.renderNameInput()}
          <Text style={{color:"black"}}>
            {this.props.selectedDestination[1]}
          </Text>
          <FlatList
            data={this.props.previousMessages}
            keyExtractor={(item, index) => index}
            renderItem={this.renderItem}
          />
          <TextInput
            name='message'
            style={styles.messageTextInput}
            onChangeText={(text) => this.setState({messageText:text})}
            onSubmitEditing={this.sendMessage}
          />
        </ScrollView>
      )
    }else{
      return (
        <ScrollView contentContainerStyle={styles.container}>
          <Text style={{color:"black"}}>
            {this.props.selectedDestination[1]}
          </Text>
          <FlatList
            data={this.props.previousMessages}
            keyExtractor={(item, index) => index}
            renderItem={this.renderItem}
          />
          <TextInput
            name='message'
            style={styles.messageTextInput}
            onChangeText={(text) => this.setState({messageText:text})}
            onSubmitEditing={this.sendMessage}
          />
        </ScrollView>
      )
    }
  }
}

const mapStateToProps = (state) => {
  return {
    previousMessages: MessagesSelectors.getPreviousMessages(state),
    selectedDestination: MessagesSelectors.getDestinationSelected(state),
    destinations: MessagesSelectors.getDestinations(state)
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    sendingMessage: (message) => dispatch(MessagesActions.sendMessageAction(message)),
    writeBluetooth: (message) => dispatch(BluetoothActions.write(message)),
    setDestinationNameValidate: (destination) => dispatch(MessagesActions.changeDestinationNameAction(destination))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesScreen)
