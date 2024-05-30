import cors from 'cors'
import 'dotenv/config'
import express from 'express'
import http from 'http'
import mongoose from 'mongoose'
import { Server } from 'socket.io'
import conversationRoutes from './routes/conversations/routes.js'
import messagesRoutes from './routes/messages/routes.js'
import userRoutes from './routes/user/routes.js'

const app = express()
app.use(express.json())

const server = http.createServer(app)
const { PORT } = process.env || 4000

app.use(cors())

mongoose.connect('mongodb://localhost:27017/telegram-clone')
const db = mongoose.connection
db.on('connected', () => {
  console.log('MongoDB connected')
})

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
  },
})

server.listen(PORT, () => {
  console.log('PORT', PORT)

  console.log(`Server is running on http://localhost:${PORT}`)
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/user', userRoutes)
app.use('/conversation', conversationRoutes)
app.use('/message', messagesRoutes)

export { io }
