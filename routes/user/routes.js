import 'dotenv/config'
import { Router } from 'express'
import jwt from 'jsonwebtoken'
import { getUserbyAccessToken } from '../middleware/index.js'
import { User } from './model.js'

const userRoutes = Router()

userRoutes.post('/auth', (req, res) => {
  const data = req.body
  const { email, name, imageId } = data

  if (!email || !name) return res.status(400).send('Invalid data')

  try {
    User.findOne({ email }).then((user) => {
      if (user) {
        const accessToken = jwt.sign(
          user.toObject(),
          'dhbcuhwbcugywqucbjhwqgycbjdcgyu',
        )
        return res.send({
          accessToken,
          user,
        })
      } else {
        const newUser = new User({
          email,
          name,
          imageId: imageId || null,
        })
        newUser.save().then((user) => {
          const accessToken = jwt.sign(
            user.toObject(),
            'dhbcuhwbcugywqucbjhwqgycbjdcgyu',
          )
          return res.send({
            accessToken,
            user,
          })
        })
      }
    })
  } catch (error) {
    console.log(error)
    return res.status(500).send('Something went wrong')
  }
})

userRoutes.get('/getUser', getUserbyAccessToken, (req, res) => {
  return res.send(req.user)
})

userRoutes.get('/getAllUsers', getUserbyAccessToken, (req, res) => {
  const user = req.user
  const { name = '' } = req.query

  const filter = { _id: { $ne: user._id } }
  if (name) {
    filter.name = { $regex: name, $options: 'i' }
  }
  if (user.conversations.length > 0) {
    const conversationIds = user.conversations.map((conv) => conv._id)
    filter.conversations = { $nin: conversationIds }
  }

  User.find(filter, '_id name imageId').then((users) => {
    return res.send(users)
  })
})

userRoutes.get(
  '/getAllConversations',
  getUserbyAccessToken,
  async (req, res) => {
    const user = req.user
    try {
      if (user.conversations.length === 0) {
        return res.send([])
      }

      const conversations = await User.findById(user._id).populate({
        path: 'conversations',
        populate: {
          path: 'members lastMessage',
          select: 'name imageId content createdAt -_id',
          match: { _id: { $ne: user._id } },
        },
        select: `-messages`,
      })

      // const filteredData = conversations.conversations.map((conv) => {
      //   const members = conv.members.map((member) => member.name)
      //   return { ...conv.toObject(), allMembers: members }
      // })

      return res.send(conversations.conversations)
    } catch (err) {
      console.log(err)
      return res.status
    }
  },
)

userRoutes.get('/getUsers', async (req, res) => {
  const users = await User.find().select('_id name imageId')
  return res.send(users)
})

export default userRoutes
