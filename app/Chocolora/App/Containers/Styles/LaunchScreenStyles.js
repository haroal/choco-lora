import { StyleSheet } from 'react-native'
import { Metrics, ApplicationStyles } from '../../Themes/'

export default StyleSheet.create({
  ...ApplicationStyles.screen,
  container: {
    paddingBottom: Metrics.baseMargin
  },
  logo: {
    marginTop: Metrics.doubleSection,
    height: Metrics.images.logo,
    width: Metrics.images.logo,
    resizeMode: 'contain'
  },
  centered: {
    alignItems: 'center'
  },
  vMessages:{
    display : 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-start',
    width: '90%'
  },
  vNewMessage: {
    marginTop:10,
    marginBottom:7.5,
  },
  vItemList: {
    marginTop: 2.5,
    marginBottom:2.5,
  },
  connectedDeviceText: {
    color: '#3c1200',
    textAlign: 'center',
    margin: 5,
    backgroundColor: '#e3fcff',
    borderRadius: 5,
    height: 30,
    lineHeight: 30
  },
  btItemList: {
    borderWidth: 1,
    borderColor:'#00b779',
    color:'#00b779',
  },
  btNewMessage: {
    color: 'white'
  },
  btButtonIconBluetoothC: {
    marginRight: 0,
    color: 'white'
  },
  btButtonIconBluetoothD: {
    marginRight: 0,
    color: 'grey'
  },
  AppTitleStyle: {
    fontSize: 30,
    fontWeight: 'bold',
    textAlign: 'center',
    margin: 10,
    marginTop: 10
  },
  authors: {
    fontStyle: 'italic'
  },
  mainContainer: {
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    justifyContent: 'space-between'
  },
  digitStyle: {
    fontFamily: 'SevenSegmentRegular',
    fontSize: 90,
    color: '#000000'
  },
  littleDigitStyle: {
    fontFamily: 'SevenSegmentRegular',
    fontSize: 30,
    color: '#000000',
    textAlign: 'center'
  },
  nameDeviceConnected: {
    fontSize: 18,
    color: '#59644e'
  },
  valuesChart: {
    marginTop: 10,
    height: 200,
    width: '80%',
    minWidth: 200,
    borderWidth: 1,
    borderColor: 'black'
  },
  headerLaunch: {
    flex: 0.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  centerLaunch: {
    flex: 6.5,
    alignItems: 'center',
  }
})
