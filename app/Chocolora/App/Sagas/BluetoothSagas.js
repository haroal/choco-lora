import { apply, cancel, cancelled, fork, put, select, take } from 'redux-saga/effects'
import { eventChannel } from 'redux-saga'
import { Buffer } from 'buffer'
import BluetoothConfig from '../Config/BluetoothConfig'
import BluetoothActions, { BluetoothSelectors, BluetoothTypes } from '../Redux/BluetoothRedux'
import { State as ControllerState } from 'react-native-ble-plx'
import MessagesActions from '../Redux/MessagesRedux'
import LoadingActions, { LoadingId } from '../Redux/LoadingRedux'

/** ************ Scan ************* **/
export function * scanDevicesTask (channel) {
  try {
    while (true) {
      const { error, device } = yield take(channel)
      if (error) {
        throw error
      }

      yield put(BluetoothActions.onDeviceFound(device))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    if (yield cancelled()) {
      yield put(BluetoothActions.onScanStopped())
    }
  }
}

export function * scanDevices () {
  yield put(LoadingActions.onLoad(LoadingId.Scanning))

  const bleManager = yield select(BluetoothSelectors.getManager)

  const scanningChannel = eventChannel(emit => {
    bleManager.startDeviceScan([BluetoothConfig.serviceUUID], null, (error, scannedDevice) => {
      if (error) {
        emit({ error, device: null })
      } else {
        emit({ error: null, device: scannedDevice })
      }
    })

    return () => {}
  })

  const task = yield fork(scanDevicesTask, scanningChannel)

  yield put(LoadingActions.onStopLoading(LoadingId.Scanning))

  yield take(BluetoothTypes.STOP_SCAN)

  yield put(LoadingActions.onLoad(LoadingId.StoppingScan))

  bleManager.stopDeviceScan()

  yield cancel(task)

  yield put(LoadingActions.onStopLoading(LoadingId.StoppingScan))
}

/** ************ Connection ************* **/
export function * onDisconnectedTask (channel) {
  try {
    const { error } = yield take(channel)
    if (error) {
      throw error
    }

    yield put(BluetoothActions.onDisconnected())
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  }
}

export function * connectDevice (action) {
  yield put(LoadingActions.onLoad(LoadingId.Connecting))

  try {
    const controllerState = yield select(BluetoothSelectors.getControllerState)
    if (controllerState !== ControllerState.PoweredOn) {
      throw new Error("Le contrôleur Bluetooth n'est pas allumé")
    }

    yield put(BluetoothActions.stopScan())

    const bleManager = yield select(BluetoothSelectors.getManager)
    const { deviceId, onConnectedCallback } = action
    console.log('CONNECTING TO ', deviceId)

    let connectedDevice = yield apply(bleManager, bleManager.connectToDevice, [deviceId, { timeout: 5000 }])
    connectedDevice = yield apply(connectedDevice, connectedDevice.discoverAllServicesAndCharacteristics)

    const onDisconnectedChannel = eventChannel(emit => {
      connectedDevice.onDisconnected((error, device) => {
        if (error) {
          emit({ error })
        } else {
          emit({ error: null })
        }
      })

      return () => {}
    })

    yield fork(onDisconnectedTask, onDisconnectedChannel)

    yield put(BluetoothActions.onConnected(connectedDevice))

    onConnectedCallback(connectedDevice)
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Connecting))
  }
}

/** ************ Disconnection ************* **/
export function * disconnectDevice () {
  yield put(LoadingActions.onLoad(LoadingId.Disconnecting))

  try {
    const bleManager = yield select(BluetoothSelectors.getManager)
    const connectedDevice = yield select(BluetoothSelectors.getConnectedDevice)

    if (connectedDevice !== null) {
      console.log('DISCONNECTING FROM ', connectedDevice.id)

      // TODO: stop reading value before disconnecting (ignored for now)
      yield apply(bleManager, bleManager.cancelDeviceConnection, [connectedDevice.id])
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Disconnecting))
  }
}

/** ************ Write Message ************* **/
export function * writeMessage ({message}) {
  yield put(LoadingActions.onLoad(LoadingId.Writing))

  try {
    const bleManager = yield select(BluetoothSelectors.getManager)
    const connectedDevice = yield select(BluetoothSelectors.getConnectedDevice)

    if (connectedDevice === null) {
      throw new Error('Impossible to write if not connected')
    }

    yield apply(bleManager, bleManager.writeCharacteristicWithResponseForDevice,
      [connectedDevice.id, BluetoothConfig.serviceUUID, BluetoothConfig.sendCharacteristicUUID, Buffer.from(message).toString('base64')])

    yield put(BluetoothActions.onWriteDone())
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Writing))
  }
}

/** ****** Subscribe to notification ******* **/
export function * receiveNotificationTask (channel) {
  try {
    while (true) {
      const { error, value } = yield take(channel)
      if (error) {
        throw error
      }

      let magicCode = value.readUInt16BE(0)
      console.log("Magic Code: ", magicCode)
      let length = value.readUInt16BE(2)
      console.log("Length: ", length)
      let type = value.readUInt8(4)
      console.log("Type: ", type)
      let senderId = value.toString('utf8', 5, 15)
      console.log("Sender Id: ", senderId)
      let message = value.toString('utf8', 15)
      console.log("Message: ", message)
      yield put(MessagesActions.receiveMessageAction(senderId, message))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    if (yield cancelled()) {
      yield put(BluetoothActions.onScanStopped())
    }
  }
}

export function * receiveNotification (action) {
  try {
    const { device } = action

    const notificationChannel = eventChannel(emit => {
      device.monitorCharacteristicForService(
        BluetoothConfig.serviceUUID,
        BluetoothConfig.receiveCharacteristicUUID,
        (error, characteristic) => {
          if (error) {
            // emit({ error, value: null })
          } else {
            console.log(Buffer.from(characteristic.value, 'base64'))
            emit({ error: null, value: Buffer.from(characteristic.value, 'base64') })
          }
        }
      )

      return () => {}
    })

    yield fork(receiveNotificationTask, notificationChannel)
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Initializing))
  }
}

/** ************ Init ************* **/
export function * controllerStateTask (channel) {
  try {
    while (true) {
      const { state } = yield take(channel)

      yield put(BluetoothActions.setControllerState(state))
    }
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  }
}

export function * initBluetooth () {
  yield put(LoadingActions.onLoad(LoadingId.Initializing))

  try {
    const bleManager = yield select(BluetoothSelectors.getManager)

    const controllerStateChannel = eventChannel(emit => {
      const subscription = bleManager.onStateChange((state) => {
        emit({ state })
      }, true)

      return () => {
        console.log('Unsubscribed from controller state channel')
        subscription.remove()
      }
    })

    yield fork(controllerStateTask, controllerStateChannel)

    const connectedDevices = yield apply(bleManager, bleManager.connectedDevices, [[]])

    if (connectedDevices.length > 0) {
      if (connectedDevices.length === 1) {
        yield put(BluetoothActions.setConnectedDevice(connectedDevices[0]))
      } else {
        throw new Error("Ne gère pas les connexions multiples pour l'instant")
      }
    }

    yield put(BluetoothActions.onInitDone())
  } catch (error) {
    yield put(BluetoothActions.onError(error))
  } finally {
    yield put(LoadingActions.onStopLoading(LoadingId.Initializing))
  }
}
