import { StyleSheet } from 'react-native'
import { Colors, Metrics } from '../../Themes/'

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  destinationTextInput:{
    borderWidth: 0,
    backgroundColor:'white',
    width:180,
    marginRight:20,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'black'
  },
  destinationTextInputSelected:{
    borderWidth: 0,
    backgroundColor:'#41c5e1',
    width:180,
    marginRight:20,
    fontWeight: 'bold',
    fontSize: 20,
    color: 'white'
  },
  destinationText: {

  },
  messageTextInput:{
    height: 40,
    borderWidth: 1,
    backgroundColor:'white',
    width:'90%'
  }
})
