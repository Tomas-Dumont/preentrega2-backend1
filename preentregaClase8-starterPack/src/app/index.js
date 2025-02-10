import express from 'express'
import { CartsRouter, ProductsRouter } from '../routes/index.js'
import { config } from '../config/index.js'
import exphbs from 'express-handlebars'
import http from 'http'
import { Server } from 'socket.io'

const initApp = () => {
  const app = express()

  // Configurar Handlebars
  app.engine('handlebars', exphbs.engine())
  app.set('view engine', 'handlebars')
  app.set('views', './src/views')

  // Para poder trabajar con JSON y que se parseen correctamente a formatos de objeto
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))

  // Rutas
  app.use('/api/products', ProductsRouter)
  app.use('/api/carts', CartsRouter)

  // Crear servidor HTTP
  const server = http.createServer(app)

  // Configurar Socket.IO con el servidor HTTP
  const io = new Server(server)

  // Evento de conexión de Socket.IO
  io.on('connection', (socket) => {
    console.log('A user connected')
    socket.on('disconnect', () => {
      console.log('User disconnected')
    })
  })

  // Devolver tanto el app como el server
  return { app, server }
}

export default initApp

