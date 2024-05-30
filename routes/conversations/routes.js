import 'dotenv/config'
import { Router } from 'express'
import { io } from '../../index.js'
import { Messages } from '../messages/model.js'
import { getUserbyAccessToken } from '../middleware/index.js'
import { User } from '../user/model.js'
import { Conversations } from './model.js'

const conversationRoutes = Router()

conversationRoutes.post(
  '/create',
  getUserbyAccessToken,
  async (req, res) => {
    const user = req.user
    const { members, isGroup, message } = req.body

    if (!members || members.length === 0 || !message) {
      return res.status(400).send('Invalid data')
    }

    if (members.includes(user._id)) {
      return res
        .status(400)
        .send('User cannot be in conversation with himself')
    }

    try {
      const newMembers = [...members, user._id]
      const conversation = await Conversations.create({
        isGroup,
        members: newMembers,
      })

      const newMessage = await Messages.create({
        conversation: conversation._id,
        sender: user._id,
        content: message,
      })

      newMembers.forEach(async (member) => {
        const user = await User.findById(member)
        user.conversations.push(conversation._id)
        await user.save()
      })

      conversation.messages.push(newMessage._id)
      conversation.lastMessage = newMessage._id

      await conversation.save()

      io.emit(
        `new-conversation-created-${members[0]._id}`,
        conversation._id,
      )

      return res.send(conversation)
    } catch (error) {
      console.log(error)
      return res.status(500).send('Something went wrong')
    }
  },
)

conversationRoutes.get(
  '/getById',
  getUserbyAccessToken,
  async (req, res) => {
    const user = req.user
    const { conversationId } = req.query

    if (!conversationId) {
      return res.status(400).send('Invalid data')
    }

    const conversation = await Conversations.findById(conversationId)
      .populate({
        path: 'messages',
        select: 'sender content createdAt',
      })
      .populate({
        path: 'members',
        select: 'name',
        match: { _id: { $ne: user._id } },
      })

    if (!conversation) {
      return res.status(404).send('Conversation not found')
    }

    if (!user.conversations.includes(conversation._id)) {
      return res.status(403).send('Forbidden')
    }

    const groupPeople = conversation.members.map((member) =>
      member._id.toString() === user._id.toString() ? 'You' : member.name,
    )

    return res.send({
      ...conversation._doc,
      groupPeople: groupPeople.join(', '),
    })
  },
)

export default conversationRoutes
