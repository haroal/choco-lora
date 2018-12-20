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
        <TextInput
          style={styles.destinationTextInput}
          //onSubmitEditing={(text) => console.log(text)}
          //value={this.state.text}
        />
      ),
    }
  }


  constructor (props) {
    super(props)
    this.sendMessage = this.sendMessage.bind(this)
    this.state = {
      messageText:""
    }
  }

  sendMessage(){
    this.props.sendingMessage(this.state.messageText)
    //this.props.writeBluetooth(this.state.messageText)
    console.log(this.state.messageText)
    //this.setState([name]: value);
  }

  renderItem({item}){
    if (item[0]===1){
      return(
        <View>
          <Text style={{color:"black"}}>{item[1]}</Text>
        </View>
      )
    }else{

    }
  }

  render () {
    console.log(this.props.previousMessages)

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
          //value={this.state.message}
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
    writeBluetooth: (message) => dispatch(BluetoothActions.write(message))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(MessagesScreen)
