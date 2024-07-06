const mongoose = require('mongoose');
const Vacante = mongoose.model('Vacante');
const multer = require('multer');
const shortid = require('shortid');

exports.formularioNuevaVacante = (req,res) => {
    res.render('nueva-vacante',{
        nombrePagina: 'Nueva Vacante',
        tagline : 'Llena el formulario y publica tu vacante',
        cerrarSesion:true,
        nombre : req.user.nombre,
        imagen : req.user.imagen

    })
}

exports.agregarVacante = async (req, res) => {
    const vacante = new Vacante(req.body);

    // usuario autor de la vacante
    vacante.autor = req.user._id;

    // crear arreglo de habilidades (skills)
    vacante.skills = req.body.skills.split(',');

    const errores = req.validationErrors();
    console.log(errores)

    
    if(!errores){

            // almacenarlo en la base de datos
            const nuevaVacante = await vacante.save()
        
            // redireccionar
            res.redirect(`/vacantes/${nuevaVacante.url}`);

    }


}
// Muestra una vacante
exports.mostrarVacante =  async (req , res,next) => {
    // populate = tendremos toda la informacion de su autor de esa vacante  dentro de la info de vacante es un (join)
    const vacante = await Vacante.findOne({url: req.params.url}).populate('autor').lean();


    // si no hay resultados
    if(!vacante) return next();
    res.render('vacante',{
        vacante,  //aqui se pasa como objeto
        nombrePagina :vacante.titulo,
        barra: true
    })
}

exports.formEditarVacante = async (req, res, next) => {
    const vacante = await Vacante.findOne({ url: req.params.url}).lean();

    if(!vacante) return next();

    res.render('editar-vacante', {
        vacante,
        nombrePagina: `Editar - ${vacante.titulo}`,
        cerrarSesion:true,
        nombre : req.user.nombre,
        imagen : req.user.imagen

    })
}

exports.editarVacante  = async (req, res) => {
    const vacanteActualizada = req.body;

    vacanteActualizada.skills = req.body.skills.split(',');

    const vacante = await Vacante.findOneAndUpdate({url : req.params.url}, vacanteActualizada,{
        new:true,  //para que crea uno nuevo y borre el antiguo 
        runValidators : true
    });

    res.redirect(`/vacantes/${vacante.url}`)

}

// Validar y Sanitizar los campos de las nuevas Vacantes
exports.validarVacante = (req, res, next) => {
    // sanitizar los campos
    req.sanitizeBody('titulo').escape();
    req.sanitizeBody('empresa').escape();
    req.sanitizeBody('ubicacion').escape();
    req.sanitizeBody('salario').escape();
    req.sanitizeBody('contrato').escape();
    req.sanitizeBody('skills').escape();

    // validar
    req.checkBody('titulo', 'Agrega un Titulo a la Vacante').notEmpty();
    req.checkBody('empresa', 'Agrega una Empresa').notEmpty();
    req.checkBody('ubicacion', 'Agrega una Ubicación').notEmpty();
    req.checkBody('contrato', 'Selecciona el Tipo de Contrato').notEmpty();
    req.checkBody('skills', 'Agrega al menos una habilidad').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        // Recargar la vista con los errores
        req.flash('error', errores.map(error => error.msg));

        res.render('nueva-vacante', {
            nombrePagina: 'Nueva Vacante',
            tagline: 'Llena el formulario y publica tu vacante',
            cerrarSesion: true,
            nombre : req.user.nombre,
            mensajes: req.flash()
        })
    }

    next(); // siguiente middleware
}

exports.eliminarVacante = async (req, res) => {
    const { id } = req.params;

    const vacante = await Vacante.findById(id);
    // console.log(id)
    // console.log(vacante)
    
    if(verificarAutor(vacante, req.user)){
        // Todo bien, si es el usuario, eliminar
        // await vacante.findByIdAndRemove({id});
        
        await Vacante.findOneAndDelete({ _id : id})
        res.status(200).send('Vacante Eliminada Correctamente');
    }else{
        // no permitir
        res.status(403).send('Error');

    }


}

const verificarAutor  = (vacante = {} , usuario = {}) => {
    // Si su autor no es igual al usuario id
    if(!vacante.autor.equals(usuario._id)){ //si el usuario no esta verificado
        return false
    }
    return true

}

// Subir archivos en PDF
exports.subirCV = (req, res , next) => {
    // abajo mandamos a llamar upload
    upload(req, res, function(error){ //puede ser que se presente errores por eso la funcion
            if(error){
                if(error instanceof multer.MulterError) {
                    if(error.code = 'LIMIT_FILE_SIZE'){  //para los errores de multer
                        req.flash('error', 'El archivo es muy grande: Maximo 100kb');
                    }else{
                        req.flash('error', error.message);
                    }
                }else {
                    req.flash('error', error.message); //accedemos al error del new Error
                }
                res.redirect('back'); //se reenvia a la pagina en la que estamos 
                return; //previene que se ejecute todo el codigo
            }else{
                return next(); //si no hay error para que se valle al siguiente midelware
            }
        });
      
    }

// Opciones de Multer
const configuracionMulter = {

    limits: {fileSize : 100000 }, //para limitar los tamaños de la pdf
    // donde se almacenaran
    storage : fileStorage = multer.diskStorage({
        // cb = next , file = archivo
        destination: (req, file , cb) => {
            // con el cb (callback) le decimos que ya esta listo que termino de ejecutarce
            cb(null, __dirname+'../../public/uploads/cv') //error , la ubicacion donde quieres que lo guarde 
        },
        filename : (req, file , cb) => {
            // mimetype es el como se llama al tipo se archivo que ingresamos
            const extension = file.mimetype.split('/')[1];
            // Tendremos el archivo con nuevo nombre
            
            cb(null, `${shortid.generate()}.${extension}`)
        }
    }),
    fileFilter(req,file,cb){

        // validamos por formato
        if(file.mimetype === 'application/pdf'  ) {
            // el callback se ejecuta como true o false : true cuando la imagen se acepta
            cb(null, true);
            console.log(file.mimetype)

        }else{
            // cb(null,false);
            cb(new Error('Formato No Válido'));
        }
    }
}


// single = el nombre del campo que vamos a leer , el que tendra el archivo 
const upload = multer(configuracionMulter).single('cv'); 

// Almacenar los candidatos en la BD
exports.contactar = async (req ,res , next ) => {   
    const vacante = await Vacante.findOne({url : req.params.url});
    // si no existe la vacante 
    if(!vacante) return next();

    // Todo bien , construir el nuevo objeto
    const nuevoCandidato = {
        nombre: req.body.nombre,
        email:req.body.email,
        cv : req.file.filename
    }
    // almacenar la vacante
    vacante.candidatos.push(nuevoCandidato); //insertar un nuevo elemento
    await vacante.save();
    // mensaje flash y redireccion
    req.flash('correcto', 'Se envio tu Curriculum Correctamente');
    res.redirect('/');
}

// Candidatos
exports.mostrarCandidatos = async (req, res , next ) => {
    const vacante = await Vacante.findById(req.params.id).lean();

    // ambos si son objetos pero no son iguales entonces no seremos estrictos usar (==)
    if(vacante.autor != req.user._id.toString()){
        return next();
    } 
    console.log('aqui')

    if(!vacante) return next();

    res.render('candidatos', {
        nombrePagina : `Candidatos Vacante - ${vacante.titulo}`,
        cerrarSesion : true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        candidatos : vacante.candidatos 
    })
}