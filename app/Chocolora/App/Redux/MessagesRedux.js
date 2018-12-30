import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  sendMessageAction: ['message'],
  receiveMessageAction: ['message'],
  addDestinationAction: null,
  changeDestinationNameAction: ['destination'],
  selectDestinationAction: ['index'],
})

export const MessagesTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  previousMessages: [],
  destinationSelected: [],
  destinations: []
})

/* ------------- Selectors ------------- */

export const MessagesSelectors = {
  getPreviousMessages: state => state.messages.previousMessages,
  getDestinationSelected: state => state.messages.destinationSelected,
  getDestinations: state => state.messages.destinations,
}

/* ------------- Reducers ------------- */

export const addSentMessage = (state, { message }) =>
  state.merge({
    previousMessages : [
      ...state.previousMessages,
      [1 , state.destinationSelected[0], message]
    ]
  })

export const addReceivedMessage = (state, { message }) =>
  state.merge({
    previousMessages : [
      ...state.previousMessages,
      [0 , state.destinationSelected[0], message]
    ]
  })

export const addDestination = (state) =>
  state.merge({
    destinations : [
      ...state.destinations,
      "test test"
    ]
  })

export const changeDestinationName = (state, {destination}) => {
  return state.merge({
    destinations: [
      ...state.destinations.slice(0,state.destinations.length-2),
      destination
    ]
  })
}

export const selectDestination = (state, { index }) =>
  state.merge({
    destinationSelected : [index, state.destinations[index]]
  })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SEND_MESSAGE_ACTION]: addSentMessage,
  [Types.RECEIVE_MESSAGE_ACTION]: addReceivedMessage,
  [Types.ADD_DESTINATION_ACTION]: addDestination,
  [Types.CHANGE_DESTINATION_NAME_ACTION]: changeDestinationName,
  [Types.SELECT_DESTINATION_ACTION]: selectDestination
})
