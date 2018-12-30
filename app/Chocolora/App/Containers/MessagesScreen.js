import React, { Component } from 'react'
import { ScrollView, Text, TextInput, View, FlatList } from 'react-native'
import { connect } from 'react-redux'
import MessagesActions, { MessagesSelectors, MessagesState } from '../Redux/MessagesRedux'
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
        <View>
        {navigation.getParam('renderNameInput')}
        </View>
      ),
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
    this.props.navigation.setParams({
      renderNameInput: this.renderNameInput()
    })
  }

  renderNameInput(){
    return (
      <TextInput
      style={styles.destinationTextInput}
      onChangeText={(text) => this.setState({nameText:text})}
      onSubmitEditing={this.setDestinationName()}
      //value={this.state.text}
      />
    )
  }

  sendMessage(){
    this.props.sendingMessage(this.state.messageText)
    //this.props.writeBluetooth(this.state.messageText)
    console.log(this.state.messageText)
    //this.setState([name]: value);
  }

  setDestinationName(){
    this.props.setDestinationNameValidate(this.props.nameText)
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

    return (
      <ScrollView contentContainerStyle={styles.container}>
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

const mapStateToProps = (state) => {
  return {
    previousMessages: MessagesSelectors.getPreviousMessages(state)
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
