import mongoose from 'mongoose'

const userSchema = new mongoose.Schema({
  name: String,
  imageId: String,
  email: { type: String, unique: true },
  conversations: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Conversations',
    },
  ],
})

export const User = mongoose.model('Users', userSchema)
