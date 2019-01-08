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
  },
  vMessageReceived:{
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start'
  },
  txtMessageReceived:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    // flex: 1,
    //width: 50,
    color: 'white',
    backgroundColor: '#692000',
    maxWidth: '70%',
    marginLeft: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 3
  },
  vMessageSent:{
    width: '100%',
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end'
  },
  txtMessageSent:{
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    color: 'white',
    backgroundColor: '#00b779',
    maxWidth: '70%',
    marginRight: 15,
    marginTop: 5,
    marginBottom: 5,
    padding: 5,
    borderRadius: 3
  },
})
