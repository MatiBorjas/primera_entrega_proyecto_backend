const fs = require('fs')

//---------------------------------------------------------------------
//                    SERVIDOR  EXPRESS
//---------------------------------------------------------------------
const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;
const server = app.listen(PORT, () => {
  console.log(`Servidor escuchando puerto ${server.address().port}`);
});

server.on("error", (error) => console.log(`Error en el servidor: ${error}`));

//---------------------------------------------------------------------
//                        MIDDLEWARE
//---------------------------------------------------------------------

  //Para lectura de JSon desde el server
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/public', express.static(__dirname + '/public'));

//---------------------------------------------------------------------
//                         ROUTER
//---------------------------------------------------------------------

const { Router } = express
const routerProductos = Router();
const routerCarrito = Router();

  //Configuracion path del router
app.use('/api/productos', routerProductos);
app.use('/api/carrito', routerCarrito)

//---------------------------------------------------------------------
//                     CREADOR DE CLASE
//---------------------------------------------------------------------

const Contenedor = require("./src/contenedorClass.js");

const productos = new Contenedor('datosProductos');
const carrito = new Contenedor('datosCarrito');

//---------------------------------------------------------------------
//                          TIMESTAMP
//---------------------------------------------------------------------
const fecha = Date.now();
const timeStamp = {"timestamp": new Date(fecha).toUTCString()};


/////////////////////////////////////////////////////////////////////////////
////////////////             PRODUCTOS             //////////////////////////
/////////////////////////////////////////////////////////////////////////////


//---------------------------------------------------------------------
//                  PETICIONES DE PRODUCTOS
//---------------------------------------------------------------------

  //Variable isAdmin
  let isAdmin = true;


  //Get productos

routerProductos.get("/", (req, res) => {

  let productosData =  productos.getAll();
  
  if (!productosData) {
      res.json({error: "Hubo un error al leer el archivo."});
  } else {
      res.json({ title: 'listado de productos', products: productosData });
  }
});

  //Get producto por ID
routerProductos.get('/:id', (req, res) => {
  const { id } = req.params;
  busquedaId = productos.getById(id);

  if(busquedaId){
    res.json({ producto: busquedaId, title:`Detalle del producto ${busquedaId.nombre}` })
  } else {
    res.json({error: "producto no encontrado"})
  }
});

  //Post producto (solo admin)
routerProductos.post('/', (req, res, next) => {
  if (!isAdmin) {
    res.send({
      error: -1,
      descripcion: `ruta ${req.baseUrl} método ${req.method} no autorizada`,
    });
  } else {
    next();
  }
},
  (req, res) => {
    const { body } = req;
    let productoNuevo = {...timeStamp, ...body}
    productos.save( productoNuevo )

    res.json({succes:"ok" , productoAgregado: body});
});

  //Put producto (solo admin)
routerProductos.put('/:id', (req, res, next) => {
  if (!isAdmin) {
    res.send({error: -1, descripcion: `ruta ${req.baseUrl} método ${req.method} no autorizada`,
    });
  } else {
    next();
  }
},
(req, res) => {
  const { id } = req.params;
  const { body } = req;

  let productoModificar = productos.getById(id);
  
  if(productoModificar){
  productoModificar = {...productoModificar, ...body};
  productos.update(id, productoModificar);
  res.json({succe:'ok', nuevo: productoModificar})
  } else {
    res.json({error: 'Producto no encontrado'});
  }
});

//Delete producto (solo admin)
routerProductos.delete('/:id', (req, res, next) => {
  if (!isAdmin) {
    res.send({
      error: -1,
      descripcion: `ruta ${req.baseUrl} método ${req.method} no autorizada`,
    });
  } else {
    next();
  }
},
(req, res) =>{
  const { id } = req.params;

  const busquedaProducto = productos.getById(id);

  if(busquedaProducto){
    productos.deleteById(id);
    res.json({ succes:'ok', accion:'Producto eliminado'});
  } else {
    res.json({error: 'Producto no encontrado'});
  }
});

/////////////////////////////////////////////////////////////////////////////
//////////////////             CARRITO            ///////////////////////////
/////////////////////////////////////////////////////////////////////////////

//---------------------------------------------------------------------
//                  PETICIONES DE PRODUCTOS CARRITO
//---------------------------------------------------------------------


  //Get carrito
  routerCarrito.get("/", (req, res) => {

  let carritoData =  carrito.getAll();
  
  if (carritoData = []) {
      res.json({Mensaje: "El carrito esta vacio"});
  } else {
      res.json({ title: 'Productos en tu carrito', products: carritoData });
  }
});

  //Post carrito vacio
  routerCarrito.post('/', (req, res) => {
    let productos = {"productos":[]}
    let nuevoCarrito = {...timeStamp,...productos};
    carrito.save( nuevoCarrito )

    res.json({succes:"ok" , mensaje: `se creo el carrito ${nuevoCarrito.id}`});
  });

  //Delete carrito
routerCarrito.delete('/:id', (req, res) => {
  const { id } = req.params;
  const busquedaCarrito = carrito.getById(id);

  if(busquedaCarrito){
    carrito.deleteById(id);
    res.json({ succes:'ok', accion:`Carrito ${id} eliminado`});
  } else {
    res.json({error: 'Carrito no encontrado'});
  }
});


  //Get productos carrito  por ID
  routerCarrito.get('/:id/productos', (req, res) => {
  const { id } = req.params;
  let findCarrito = carrito.getById(id);
  let productosCarrito = findCarrito.productos;

  if(productosCarrito != 0){
    res.json({ productos: productosCarrito, title:`Productos en el carrito ${findCarrito.id}` })
  } else {
    res.json({error: `El carrito ${findCarrito.id} no contiene productos`})
  }
});


  //Post producto en carrito
  routerCarrito.post('/:id/productos', (req, res) => {
  const { id } = req.params;
  const { body } = req;

  let productoAgregar = productos.getById(body.id); 
  let findCarrito = carrito.getById(id);

  if(productoAgregar) {
    findCarrito.productos.push(productoAgregar);
    carrito.update(id, findCarrito)
  res.json({succe:'ok', mensaje: `Se agrego el producto ${productoAgregar.nombre} a tu carrito`})
  } else {
    res.json({error: 'Producto no encontrado'});
  }
});

//Delete producto en carrito
  routerCarrito.delete('/:id/productos/:id_prod', (req, res) => {
  const { id, id_prod } = req.params;

  let findCarrito = carrito.getById(id);
  let productoEliminar = carrito.getById(id_prod);
  let indexProdEliminar = findCarrito.productos.findIndex((e) => e.id == productoEliminar.id);

  if(indexProdEliminar != -1) {
    findCarrito.productos.splice(indexProdEliminar, 1);
    carrito.update(id, findCarrito)
  res.json({succes:'ok', mensaje: `Se elimino el producto ${productoEliminar.nombre} del carrito`})
  } else {
    res.json({error: 'Producto no encontrado'});
  }
});