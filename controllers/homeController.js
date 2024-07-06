const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');


exports.mostrarTrabajos = async (req, res, next) => {

    const vacantes = await Vacante.find().lean();
    if(!vacantes) return next();
    // console.log(vacantes)
    // a una vista que voy a nombrar home
    res.render('home', { 
        //el archivo principal (Master Page) sera layout.handlebars(layout prin cipal) y lo que esta en {{{body}}} estaran  hijos (las otras paginas)
        nombrePagina : 'devJobs', //le envio parametros a el layout.handlebars
        tagline : 'Encuentra y Publica trabajdos para Desarrolladores Web ', //descripcion
        barra: true, //en caso de que no le pase esta barra no se mostrara en el layout.handlebar
        boton: true,
        vacantes 
    })
}
