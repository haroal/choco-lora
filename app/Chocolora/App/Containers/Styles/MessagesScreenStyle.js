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
    height: 40,
    borderWidth: 0,
    backgroundColor:'white',
    width:180,
    marginRight:20
  },
  messageTextInput:{
    height: 40,
    borderWidth: 1,
    backgroundColor:'white',
    width:'90%'
  }
})
