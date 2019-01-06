import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'
import { BleManager, State as ControllerState } from 'react-native-ble-plx'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  init: null,
  onInitDone: null,
  setControllerState: ['newState'],
  setConnectedDevice: ['newDevice'],
  startScan: null,
  stopScan: null,
  onDeviceFound: ['deviceFound'],
  onScanStopped: null,
  connect: ['deviceId', 'onConnectedCallback'],
  onConnected: ['connectedDevice'],
  disconnect: null,
  onDisconnected: null,
  subscribeNotification: ['device'],
  write: ['message'],
  onWriteDone: null,
  onError: ['error'],
  dismissError: null
})

export const BluetoothTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const BluetoothState = {
  Initializing: 'Initializing',
  Scanning: 'Scanning',
  StoppingScan: 'StoppingScan',
  Idle: 'Idle',
  Connecting: 'Connecting',
  Connected: 'Connected',
  Writing: 'Writing',
  Disconnecting: 'Disconnecting'
}

const bleManager = new BleManager()

export const INITIAL_STATE = Immutable({
  scannedDevices: [],
  connectedDevice: null,
  bluetoothState: BluetoothState.Idle,
  controllerState: ControllerState.Unknown,
  errors: []
})

/* ------------- Selectors ------------- */

export const BluetoothSelectors = {
  getManager: (state) => bleManager,
  getError: (state) => state.bluetooth.errors[0],
  getErrors: (state) => state.bluetooth.errors,
  getBluetoothState: state => state.bluetooth.bluetoothState,
  getControllerState: state => state.bluetooth.controllerState,
  getScannedDevices: state => state.bluetooth.scannedDevices,
  getConnectedDevice: state => state.bluetooth.connectedDevice
}

/* ------------- Reducers ------------- */

export const init = (state) =>
  state.merge({ bluetoothState: BluetoothState.Initializing })

export const onInitDone = (state) =>
  state.merge({ bluetoothState: BluetoothState.Idle })

export const setControllerState = (state, { newState }) =>
  state.merge({ controllerState: newState })

export const setConnectedDevice = (state, { newDevice }) =>
  state.merge({ connectedDevice: newDevice })

export const startScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.Scanning, scannedDevices: [] })

export const stopScan = (state) =>
  state.merge({ bluetoothState: BluetoothState.StoppingScan })

export const onScanStopped = (state) => {
  if (state.bluetoothState !== BluetoothState.Scanning) {
    return state
  }
  return state.merge({ bluetoothState: BluetoothState.Idle })
}

export const onDeviceFound = (state, { deviceFound }) => {
  const index = state.scannedDevices.findIndex((device) => device.id === deviceFound.id)
  let newScannedDevices

  if (index === -1) {
    newScannedDevices = [
      ...state.scannedDevices,
      { id: deviceFound.id, name: deviceFound.name }
    ]
  } else {
    newScannedDevices = state.scannedDevices.slice()
    newScannedDevices[index] = { id: deviceFound.id, name: deviceFound.name }
  }

  return state.merge({
    scannedDevices: newScannedDevices
  })
}

export const connect = (state) =>
  state.merge({ bluetoothState: BluetoothState.Connecting })

export const onConnected = (state, { connectedDevice }) =>
  state.merge({
    bluetoothState: BluetoothState.Connected,
    connectedDevice: {
      id: connectedDevice.id,
      name: connectedDevice.name
    },
    scannedDevices: []
  })

export const disconnect = (state) =>
  state.merge({ bluetoothState: BluetoothState.Disconnecting, values: null })

export const onDisconnected = (state) =>
  state.merge({ bluetoothState: BluetoothState.Idle, connectedDevice: null })

export const write = (state) =>
  state.merge({ bluetoothState: BluetoothState.Writing })

export const onWriteDone = (state) =>
  state.merge({ bluetoothState: BluetoothState.Connected })

export const onError = (state, { error }) => {
  console.log('ERROR', error)
  return state.merge({
    bluetoothState: state.connectedDevice !== null ? BluetoothState.Connected : BluetoothState.Idle,
    errors: [...state.errors, error] })
}

export const removeError = (state) =>
  state.merge({ errors: state.errors.slice(1) })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.INIT]: init,
  [Types.ON_INIT_DONE]: onInitDone,
  [Types.SET_CONNECTED_DEVICE]: setConnectedDevice,
  [Types.SET_CONTROLLER_STATE]: setControllerState,
  [Types.START_SCAN]: startScan,
  [Types.STOP_SCAN]: stopScan,
  [Types.ON_DEVICE_FOUND]: onDeviceFound,
  [Types.ON_SCAN_STOPPED]: onScanStopped,
  [Types.CONNECT]: connect,
  [Types.ON_CONNECTED]: onConnected,
  [Types.DISCONNECT]: disconnect,
  [Types.ON_DISCONNECTED]: onDisconnected,
  [Types.WRITE]: write,
  [Types.ON_WRITE_DONE]: onWriteDone,
  [Types.ON_ERROR]: onError,
  [Types.DISMISS_ERROR]: removeError
})
