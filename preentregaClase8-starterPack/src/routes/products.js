import { Router } from 'express'
import fs from 'fs'
import path from 'path'
import { config } from '../config/index.js'
import { validateInputProducts } from '../middlewares/validationMiddleware.js'

export const ProductsRouter = Router()

const pathToProducts = path.join(config.dirname, '/src/data/products.json')

console.log(pathToProducts)
ProductsRouter.get('/', async (req, res) => {
  let productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
  const products = JSON.parse(productsString)
  res.send({ products })
})

ProductsRouter.post('/', validateInputProducts, async (req, res) => {
  //Logica para generar el producto
  let productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
  const products = JSON.parse(productsString)

  const id = uuidv4() // ⇨ '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d'

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
    //id autogenerado
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
  res.send({ message: 'Producto creado', data: product })
})

// PUT /api/products/:pid (Actualizar un producto)
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

    // Actualizar producto sin modificar el ID
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
    res.send({ message: 'Producto actualizado', data: updatedProduct })
  } catch (error) {
    res.status(500).send({ message: 'Error al actualizar el producto', error })
  }
})

// DELETE /api/products/:pid (Eliminar un producto)
ProductsRouter.delete('/:pid', async (req, res) => {
  try {
    const { pid } = req.params

    const productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    const products = JSON.parse(productsString)

    const productIndex = products.findIndex((product) => product.id === pid)

    if (productIndex === -1) {
      return res.status(404).send({ message: 'Producto no encontrado' })
    }

    // Eliminar producto
    const updatedProducts = products.filter((product) => product.id !== pid)

    const productsStringified = JSON.stringify(updatedProducts, null, '\t')
    await fs.promises.writeFile(pathToProducts, productsStringified)
    res.status(204).send() // No content
  } catch (error) {
    res.status(500).send({ message: 'Error al eliminar el producto', error })
  }
})


/* UsersRouter.get('/', (req, res) => {
    //get users
    res.send({message: 'ok'})
})

UsersRouter.get('/:id', (req, res) => {
    //get users
    res.send({message: {...req.params}})
}) */
