import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config } from '../config/index.js'
import { validateInputProducts } from '../middlewares/validationMiddleware.js'

export const ProductsRouter = Router()

const pathToProducts = path.join(config.dirname, '/src/data/products.json')

console.log(pathToProducts)

let io; // Este será nuestro objeto de Socket.IO

ProductsRouter.setSocketIO = (socketIOInstance) => {
  io = socketIOInstance
}

// Obtener todos los productos
ProductsRouter.get('/', async (req, res) => {
  try {
    let productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)
    res.send({ products })
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los productos', error })
  }
})

// Crear un producto
ProductsRouter.post('/', validateInputProducts, async (req, res) => {
  try {
    let productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)

    const id = uuidv4()

    const {
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    } = req.body

    const product = {
      id,
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails,
    }

    products.push(product)

    const productsStringified = JSON.stringify(products, null, '\t')
    await fs.promises.writeFile(pathToProducts, productsStringified)

    // Emitir el evento para que todos los clientes reciban la actualización
    if (io) {
      io.emit('new-product', product) // Emitir un evento 'new-product'
    }

    res.send({ message: 'Producto creado', data: product })
  } catch (error) {
    res.status(500).send({ message: 'Error al crear el producto', error })
  }
})

// Actualizar un producto
ProductsRouter.put('/:pid', async (req, res) => {
  try {
    const { pid } = req.params
    const { title, description, code, price, status, stock, category, thumbnails } = req.body

    const productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)

    const productIndex = products.findIndex((product) => product.id === pid)

    if (productIndex === -1) {
      return res.status(404).send({ message: 'Producto no encontrado' })
    }

    const updatedProduct = {
      ...products[productIndex],
      title: title || products[productIndex].title,
      description: description || products[productIndex].description,
      code: code || products[productIndex].code,
      price: price || products[productIndex].price,
      status: status !== undefined ? status : products[productIndex].status,
      stock: stock || products[productIndex].stock,
      category: category || products[productIndex].category,
      thumbnails: thumbnails || products[productIndex].thumbnails
    }

    products[productIndex] = updatedProduct

    const productsStringified = JSON.stringify(products, null, '\t')
    await fs.promises.writeFile(pathToProducts, productsStringified)

    // Emitir el evento de actualización
    if (io) {
      io.emit('update-product', updatedProduct) // Emitir un evento 'update-product'
    }

    res.send({ message: 'Producto actualizado', data: updatedProduct })
  } catch (error) {
    res.status(500).send({ message: 'Error al actualizar el producto', error })
  }
})

// Eliminar un producto
ProductsRouter.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params

    const productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)

    const productIndex = products.findIndex((product) => product.id === pid)

    if (productIndex === -1) {
      return res.status(404).send({ message: 'Producto no encontrado' })
    }

    const updatedProducts = products.filter((product) => product.id !== pid)

    const productsStringified = JSON.stringify(updatedProducts, null, '\t')
    await fs.promises.writeFile(pathToProducts, productsStringified)

    // Emitir el evento de eliminación
    if (io) {
      io.emit('delete-product', pid) // Emitir un evento 'delete-product'
    }

    res.status(204).send()
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar el producto', error })
  }
})

// Obtener todos los productos para la vista 'home'
ProductsRouter.get('/home', async (req, res) => {
  try {
    const productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)
    res.render('home', { products })
  } catch (error) {
    res.status(500).send({ message: 'Error al obtener los productos', error })
  }
})
