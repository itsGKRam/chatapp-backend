import 'dotenv/config'
import jwt from 'jsonwebtoken'
import { User } from '../user/model.js'

export const getUserbyAccessToken = async (req, res, next) => {
  const { authorization } = req.headers

  if (!authorization || authorization.split(' ')[0] !== 'Bearer') {
    res.status(401).send('Unauthorized access')
  }

  const accessToken = authorization.split(' ')[1]

  try {
    const data = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET)
    const user = await User.findOne({ email: data.email })

    if (!user) {
      res.status(404).send('User not found for this authorization')
    }

    req.user = user
    next()
  } catch (err) {
    console.log(err)
    res.status(500).send(err)
  }
}
