import express from 'express'
import { login, resetPassword, verify, getMe } from '../controllers/authController.js'
import authMiddleware from '../middleware/authMiddlware.js'

 
const route = express.Router()

route.post('/login', login)
route.get('/verify', authMiddleware, verify)
route.post('/verify', authMiddleware, verify)

route.post('/reset-password', resetPassword);

route.get("/me", authMiddleware, getMe);


export default route;