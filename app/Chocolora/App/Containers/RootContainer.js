import React, { Component } from 'react'
import { ActivityIndicator, Alert, View, StatusBar, PermissionsAndroid } from 'react-native'
import { connect } from 'react-redux'
import ReduxNavigation from '../Navigation/ReduxNavigation'
import BluetoothActions, { BluetoothSelectors } from '../Redux/BluetoothRedux'
import { LoadingSelectors } from '../Redux/LoadingRedux'

// Styles
import styles from './Styles/RootContainerStyles'

class RootContainer extends Component {
  async componentDidMount () {
    await this.requestLocationPermission()
    this.props.initBluetooth()
  }

  componentDidUpdate (prevProps) {
    if (this.props.errors.length > 0) {
      Alert.alert('Erreur', 'Une erreur est survenue: ' + this.props.error)
      this.props.dismissError()
    }
  }

  async requestLocationPermission () {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        { 'title': 'Permission requise', 'message': 'La localisation doit être autorisée pour utiliser le BLE.' }
      )

      if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
        this.props.onError('Vous ne pourrez pas scanner sans la localisation.')
      }
    } catch (err) {
      this.props.onError(err)
    }
  }

  render () {
    return (
      <View style={styles.applicationView}>
        <StatusBar barStyle='light-content' />
        <ReduxNavigation />

        {this.props.isLoading &&
          <View style={styles.loader}>
            <ActivityIndicator size='large' />
          </View>
        }
      </View>
    )
  }
}

const mapStateToProps = (state) => ({
  error: BluetoothSelectors.getError(state),
  errors: BluetoothSelectors.getErrors(state),
  isLoading: LoadingSelectors.isLoading(state)
})

const mapDispatchToProps = (dispatch) => ({
  dismissError: () => dispatch(BluetoothActions.dismissError()),
  onError: (error) => dispatch(BluetoothActions.onError(error)),
  initBluetooth: () => dispatch(BluetoothActions.init())
})

export default connect(mapStateToProps, mapDispatchToProps)(RootContainer)
