import express from 'express'
import { CartsRouter, ProductsRouter } from '../routes/index.js'
import { config } from '../config/index.js'

const initApp = () => {
  const app = express()

  //Para poder trabajar con JSON y que se parseen correctamente a formatos de objeto
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }))



  app.use('/api/products', ProductsRouter)
  app.use('/api/carts', CartsRouter)

  console.log(config.dirname)

  return app
}

export default initApp
