import initApp from './app/index.js'
import { config } from './config/index.js'
import { Server } from 'socket.io'
import { ProductsRouter } from './routes/products.js'
import fs from 'fs'
import path from 'path'

// Inicializamos la app y el servidor
const { app, server } = initApp()

// Ruta de productos
const pathToProducts = path.join(config.dirname, '/src/data/products.json')

let products = []  // Variable global para almacenar los productos

// Leer los productos del archivo
const loadProducts = async () => {
  try {
    const productsString = await fs.promises.readFile(pathToProducts, 'utf-8')
    products = JSON.parse(productsString)
  } catch (error) {
    console.error("Error al cargar los productos", error)
  }
}

// Crear servidor HTTP y configurar Socket.IO
const io = new Server(server)

// Configurar el router de productos para usar Socket.IO
ProductsRouter.setSocketIO(io)

// Evento de conexión de Socket.IO
io.on('connection', (socket) => {
  console.log('Nuevo cliente conectado')

  // Enviar la lista de productos al cliente cuando se conecta
  socket.emit('updateProducts', products)

  // Escuchar eventos para añadir un nuevo producto
  socket.on('addProduct', (newProduct) => {
    products.push(newProduct)
    // Guardar los productos actualizados en el archivo
    fs.promises.writeFile(pathToProducts, JSON.stringify(products, null, 2))
    io.emit('updateProducts', products)  // Enviar la lista actualizada a todos los clientes
  })

  // Escuchar eventos para eliminar un producto
  socket.on('deleteProduct', (productId) => {
    products = products.filter(product => product.id !== productId)
    // Guardar los productos actualizados en el archivo
    fs.promises.writeFile(pathToProducts, JSON.stringify(products, null, 2))
    io.emit('updateProducts', products)  // Enviar la lista actualizada a todos los clientes
  })

  socket.on('disconnect', () => {
    console.log('Cliente desconectado')
  })
})

// Cargar los productos al inicio
loadProducts()

// Configuración de Handlebars
app.set('view engine', 'handlebars')
app.set('views', './src/views') // Asegúrate de tener la carpeta views

// Iniciar el servidor
server.listen(config.PORT, () => {
  console.info(`Server listening on http://localhost:${config.PORT}`)
})
