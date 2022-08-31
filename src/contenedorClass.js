const fs = require('fs')

//---------------------------------------------------------------------
//        CLASE
//---------------------------------------------------------------------

class Contenedor {

  constructor(archivo) {
      this.archivo = "./public/archivos/"+archivo+".json"
    };

  //---------------------------------------------------------------------
  //    METODO GET ALL
  //---------------------------------------------------------------------
  getAll = () => {
    try {
      const datos = fs.readFileSync(this.archivo,'utf-8');
      let datosParse = JSON.parse(datos);
      return datosParse;
    } 
    catch (error) {
      console.log('Hubo un error en la lectura de archivos')
    }
  };

  //---------------------------------------------------------------------
  //        METODO SAVE
  //---------------------------------------------------------------------
  save = (obj) => {
    try{
      const datos = fs.readFileSync(this.archivo,'utf-8')
      let datosJson = JSON.parse(datos);
      let nuevosDatos = [];
      const indice = datosJson.map(elem => elem.id).sort();
      obj.id = indice[indice.length - 1] + 1 

      if(!obj.id){
        obj.id = 1;
        nuevosDatos = [{...obj}];
        fs.writeFileSync(this.archivo, JSON.stringify(nuevosDatos));
        return nuevosDatos[0].id
      }
      datosJson.push(obj)

      fs.writeFileSync(this.archivo, JSON.stringify(datosJson))
      console.log(`El elemento: \n${JSON.stringify(obj)} \nfue guarado exitosamente`)
    }
    catch(error){
      console.log('ERROR! ' + error)
    }
  };

  //---------------------------------------------------------------------
  //    METODO GET BY ID
  //---------------------------------------------------------------------

  getById = (id) => {
    try {
      const datos = fs.readFileSync(this.archivo,'utf-8')
      let datosJson = JSON.parse(datos);
      
      if(datosJson.find(elemento => elemento.id == id)){
        return (datosJson.find(elemento => elemento.id == id));
      } else {
        console.log(`El elemento con id numero ${id} no existe`)
      }
    }
    catch (error) {
      console.log('La busqueda no pudo realizarse correctamente' + error);
    }
  };

  //---------------------------------------------------------------------
  //     METODO UPDATE
  //---------------------------------------------------------------------
  update = (id, obj) => {
    try {
      let productosData = this.getAll();
      let productosActualizados = productosData.map(e => 
        e.id == id
        ? e = {...e, ...obj}
        : e);

      fs.writeFileSync(this.archivo, JSON.stringify(productosActualizados));
      console.log('Update complete')

    } catch (error) {
      
    }
  };

  //---------------------------------------------------------------------
  //METODO DELETE BY ID
  //---------------------------------------------------------------------

  deleteById = (id) => {
    try {
      const datos = fs.readFileSync(this.archivo,'utf-8');
      let datosJson = JSON.parse(datos);

      if(datosJson.some(elemento => elemento.id == id)){
        let objIndex = datosJson.findIndex((elemento) => elemento.id == id);
        datosJson.splice(objIndex, 1);
        console.log(datosJson)
        fs.writeFileSync(this.archivo, JSON.stringify(datosJson));
        console.log(`El elemento con id: ${id} fue eliminado con exito`)
      } else {
        console.log(`No existe un elemento con el id ${id}`)
      }
    } 
    catch (error) {
      
    }
  };

};

module.exports = Contenedor;