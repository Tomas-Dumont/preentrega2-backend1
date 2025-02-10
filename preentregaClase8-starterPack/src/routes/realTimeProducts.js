// routes/products.js
ProductsRouter.get('/realtimeproducts', async (req, res) => {
    try {
      const productsString = await fs.promises.readFile(pathToProducts, 'utf-8');
      const products = JSON.parse(productsString);
  
      res.render('realTimeProducts', { products });
    } catch (error) {
      res.status(500).send({ message: 'Error al obtener los productos', error });
    }
  });
  