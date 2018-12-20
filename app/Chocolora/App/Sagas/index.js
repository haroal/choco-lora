import { takeLatest, all } from 'redux-saga/effects'

/* ------------- Types ------------- */

import { BluetoothTypes } from '../Redux/BluetoothRedux'

/* ------------- Sagas ------------- */

import { connectDevice, disconnectDevice, initBluetooth, receiveNotification, scanDevices, writeMessage } from './BluetoothSagas'

/* ------------- API ------------- */

// The API we use is only used from Sagas, so we create it here and pass along
// to the sagas which need it.

/* ------------- Connect Types To Sagas ------------- */

export default function * root () {
  yield all([
    takeLatest(BluetoothTypes.START_SCAN, scanDevices),
    takeLatest(BluetoothTypes.INIT, initBluetooth),
    takeLatest(BluetoothTypes.CONNECT, connectDevice),
    takeLatest(BluetoothTypes.DISCONNECT, disconnectDevice),
    takeLatest(BluetoothTypes.SUBSCRIBE_NOTIFICATION, receiveNotification),
    takeLatest(BluetoothTypes.WRITE, writeMessage)
  ])
}
