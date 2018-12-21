import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  sendMessageAction: ['message'],
  receiveMessageAction: ['sender_id', 'message'],
  setContactId: ['contact_id']
})

export const MessagesTypes = Types
export default Creators

/* ------------- Initial State ------------- */

export const MessageType = {
  RECEIVED: '0',
  SENT: '1'
}

export const INITIAL_STATE = Immutable({
  previousMessages: {},
  currentContactId: null
})

/* ------------- Selectors ------------- */

export const MessagesSelectors = {
  getPreviousMessages: state => state.messages.previousMessages,
  getCurrentContactId: state => state.messages.currentContactId
}

/* ------------- Reducers ------------- */

export const addMessage = (state, { contact_id, message, type }) => {
  let conversation;
  let message = {type, message};

  if (state.previousMessages[contact_id] !== undefined) {
    conversation = [
      ...state.previousMessages[contact_id],
      message
    ]
  } else {
    conversation = [message]
  }

  return state.merge({
    previousMessages: {
      ...state.previousMessages,
      [contact_id]: conversation
    }
  })
}

export const addSentMessage = (state, { message }) =>
  addMessage(state, { device_id: state.currentContactId, message, type: MessageType.SENT })

export const addReceivedMessage = (state, { sender_id, message }) =>
  addMessage(state, { device_id: sender_id, message, type: MessageType.SENT })

export const setContactId = (state, { contact_id }) =>
  state.merge({ currentContactId: contact_id })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SEND_MESSAGE_ACTION]: addSentMessage,
  [Types.RECEIVE_MESSAGE_ACTION]: addReceivedMessage,
  [Types.SET_CONTACT_ID]: setContactId
})
