import { createReducer, createActions } from 'reduxsauce'
import Immutable from 'seamless-immutable'

/* ------------- Types and Action Creators ------------- */

const { Types, Creators } = createActions({
  sendMessageAction: ['message'],
  receiveMessageAction: ['senderId', 'message'],
  setContactId: ['contactId']
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
  getPreviousMessages: (state) => state.messages.previousMessages,
  getCurrentContactId: (state) => state.messages.currentContactId
}

/* ------------- Reducers ------------- */

export const addMessage = (state, { contactId, message, type }) => {
  let conversation;
  let messageData = { type, message };

  if (state.previousMessages[contactId] !== undefined) {
    conversation = [
      ...state.previousMessages[contactId],
      messageData
    ]
  } else {
    conversation = [messageData]
  }

  return state.merge({
    previousMessages: {
      ...state.previousMessages,
      [contactId]: conversation
    }
  })
}

export const addSentMessage = (state, { message }) =>
  addMessage(state, { contactId: state.currentContactId, message, type: MessageType.SENT })

export const addReceivedMessage = (state, { senderId, message }) =>
  addMessage(state, { contactId: senderId, message, type: MessageType.RECEIVED })

export const setContactId = (state, { contactId }) =>
  state.merge({ currentContactId: contactId })

/* ------------- Hookup Reducers To Types ------------- */

export const reducer = createReducer(INITIAL_STATE, {
  [Types.SEND_MESSAGE_ACTION]: addSentMessage,
  [Types.RECEIVE_MESSAGE_ACTION]: addReceivedMessage,
  [Types.SET_CONTACT_ID]: setContactId
})
