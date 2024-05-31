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

app.use(cors())

mongoose.connect(
  'mongodb+srv://itsgkram-qwertyuiop:qwertyuiop@cluster0.gkx09l7.mongodb.net/telegram-clone',
)
const db = mongoose.connection
db.on('connected', () => {
  console.log('MongoDB connected')
})

const io = new Server(server, {
  cors: {
    origin: 'https://chatapp-frontend-pi-puce.vercel.app/',
  },
})

server.listen(4000, () => {
  console.log('PORT', 4000)

  console.log(`Server is running on http://localhost:${4000}`)
})

app.get('/', (req, res) => {
  res.send('Hello World')
})

app.use('/user', userRoutes)
app.use('/conversation', conversationRoutes)
app.use('/message', messagesRoutes)

export { io }
