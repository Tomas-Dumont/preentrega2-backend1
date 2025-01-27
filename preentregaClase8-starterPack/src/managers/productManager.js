//validar que un producto existe antes de agregarlo al carrito.
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const cartsFilePath = path.join('./src/data/carts.json')

export class CartManager {
  constructor() {
    if (!fs.existsSync(cartsFilePath)) {
      fs.writeFileSync(cartsFilePath, JSON.stringify([]))
    }
  }

  async getCarts() {
    const cartsString = await fs.promises.readFile(cartsFilePath, 'utf-8')
    return JSON.parse(cartsString)
  }

  async getCartById(cartId) {
    const carts = await this.getCarts()
    return carts.find(cart => cart.id === cartId) || null
  }

  async createCart() {
    const carts = await this.getCarts()
    const newCart = { id: uuidv4(), products: [] }
    carts.push(newCart)
    await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2))
    return newCart
  }

  async addProductToCart(cartId, productId) {
    const carts = await this.getCarts()
    const cartIndex = carts.findIndex(cart => cart.id === cartId)
    if (cartIndex === -1) throw new Error('Carrito no encontrado')

    const cart = carts[cartIndex]
    const productIndex = cart.products.findIndex(product => product.product === productId)

    if (productIndex === -1) {
      cart.products.push({ product: productId, quantity: 1 })
    } else {
      cart.products[productIndex].quantity += 1
    }

    carts[cartIndex] = cart
    await fs.promises.writeFile(cartsFilePath, JSON.stringify(carts, null, 2))
    return cart
  }
}