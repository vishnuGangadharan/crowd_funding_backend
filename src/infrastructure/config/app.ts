import express from 'express'
const app = express()
import cookieParser from 'cookie-parser'
import session from 'express-session'
import http from 'http'
import userRoutes from '../routes/userRoutes'
import cors from 'cors'

export const httpServer  = http.createServer(app) 

app.use(cors({ origin: 'http://localhost:5173', credentials: true }))
app.use(cookieParser())
app.use(express.json())
app.use(express.urlencoded({ extended: true}))

app.use(session({
    secret: 'kdjhsdfk',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}))

app.use('/api/user',userRoutes)