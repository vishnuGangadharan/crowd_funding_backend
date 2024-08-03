import express from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import session from 'express-session'
import http from 'http'
import userRoutes from '../routes/userRoutes'
import adminRoutes from '../routes/adminRoutes'
import cors from 'cors'
import morg from 'morgan'
export const httpServer  = http.createServer(app) 

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))
app.use(morg('dev'))
app.use(session({
    secret: 'kdjhsdfk',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use('/api/user',userRoutes)
app.use('/api/admin',adminRoutes)
