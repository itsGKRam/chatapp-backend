import 'dotenv/config'
import { Router } from 'express'
import { io } from '../../index.js'
import { Conversations } from '../conversations/model.js'
import { getUserbyAccessToken } from '../middleware/index.js'
import { Messages } from './model.js'

const messagesRoutes = Router()

messagesRoutes.post('/send', getUserbyAccessToken, async (req, res) => {
  const user = req.user
  const { conversationId, content } = req.body

  if (!conversationId || !content) {
    return res.status(400).send('Invalid data')
  }

  try {
    const conversation = await Conversations.findById(conversationId)

    if (!conversation) {
      return res.status(404).send('Conversation not found')
    }

    if (!conversation.members.includes(user._id)) {
      return res.status(403).send('Forbidden')
    }

    const newMessage = await Messages.create({
      sender: user._id,
      content,
    })

    conversation.messages.push(newMessage._id)
    conversation.lastMessage = newMessage._id
    await conversation.save()

    const updated_conversation = await Conversations.findById(
      conversationId,
    )
      .populate({
        path: 'messages',
        select: 'sender content createdAt',
      })
      .populate({
        path: 'members',
        select: 'name',
        match: { _id: { $ne: user._id } },
      })

    const groupPeople = updated_conversation.members.map((member) =>
      member._id.toString() === user._id.toString() ? 'You' : member.name,
    )

    io.emit(`conversation-${updated_conversation._id}`, {
      ...updated_conversation._doc,
      groupPeople,
    })

    return res.send({
      ...updated_conversation._doc,
      groupPeople,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send('Something went wrong')
  }
})

export default messagesRoutes
