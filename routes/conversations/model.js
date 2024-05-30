import mongoose from 'mongoose'

const conversationsModel = new mongoose.Schema({
  isGroup: {
    type: Boolean,
    default: false,
  },
  name: String,
  imageId: String,
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Users',
    },
  ],
  messages: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Messages',
    },
  ],
  lastMessage: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Messages',
  },
})

export const Conversations = mongoose.model(
  'Conversations',
  conversationsModel,
)
