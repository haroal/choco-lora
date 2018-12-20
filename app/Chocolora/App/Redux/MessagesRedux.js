import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  sendMessageAction: ['message'],
  receiveMessageAction: ['message'],
})

export const MessagesTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const INITIAL_STATE = Immutable({
  previousMessages: []
})

/* ------------- Selectors ------------- */

export const MessagesSelectors = {
  getPreviousMessages: state => state.messages.previousMessages
}

/* ------------- Reducers ------------- */

export const addSentMessage = (state, { message }) =>
  state.merge({
    previousMessages : [
      ...state.previousMessages,
      [1 , message]
    ]
  })

export const addReceivedMessage = (state, { message }) =>
  state.merge({
    previousMessages : [
      ...state.previousMessages,
      [0 , message]
    ]
  })


/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SEND_MESSAGE_ACTION]: addSentMessage,
  [Types.RECEIVE_MESSAGE_ACTION]: addReceivedMessage
})
