import { Router } from 'express'
import { CartManager } from '../managers/cartManager.js'

export const CartsRouter = Router()
const cartManager = new CartManager()

// Crear un nuevo carrito
CartsRouter.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart()
    res.status(201).json({ message: 'Carrito creado', cart: newCart })
  } catch (error) {
    res.status(500).json({ message: 'Error al crear el carrito', error: error.message })
  }
})

// Obtener productos de un carrito por ID
CartsRouter.get('/:cid', async (req, res) => {
  const { cid } = req.params
  try {
    const cart = await cartManager.getCartById(cid)
    if (!cart) {
      return res.status(404).json({ message: 'Carrito no encontrado' })
    }
    res.json({ cart })
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener el carrito', error: error.message })
  }
})

// Agregar un producto al carrito
CartsRouter.post('/:cid/product/:pid', async (req, res) => {
  const { cid, pid } = req.params
  try {
    const updatedCart = await cartManager.addProductToCart(cid, pid)
    res.json({ message: 'Producto agregado al carrito', cart: updatedCart })
  } catch (error) {
    res.status(500).json({ message: 'Error al agregar el producto al carrito', error: error.message })
  }
})