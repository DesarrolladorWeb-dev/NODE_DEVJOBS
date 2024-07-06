const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');
const multer = require('multer');
const shortid = require("shortid");

exports.subirImagen = (req, res , next ) => {
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
            res.redirect('/administracion');
            return; //previene que se ejecute todo el codigo
        }else{
            return next(); //si no hay error para que se valle al siguiente midelware
        }
    });
  
}

// Opciones de Multer
const configuracionMulter = {

    limits: {fileSize : 100000 }, //para limitar los tamaños de la imagen
    // donde se almacenaran
    storage : fileStorage = multer.diskStorage({
        // cb = next , file = archivo
        destination: (req, file , cb) => {
            // con el cb (callback) le decimos que ya esta listo que termino de ejecutarce
            cb(null, __dirname+'../../public/uploads/perfiles') //error , la ubicacion donde quieres que lo guarde 
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
        if(file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' ) {
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
const upload = multer(configuracionMulter).single('imagen'); 

exports.formCrearCuenta = (req, res) => {
    res.render('crear-cuenta', {
        nombrePagina : 'Crear tu cuenta en devJobs',
        tagline: 'Comienza a publicar tus vacantes gratis , solo debes crear una cuenta'
    })
}


exports.validarRegistro = (req, res , next) => {

    // sanitizar = cambia los datos del req.body - y ayuda a no guardar codigo JS en la bd
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    req.sanitizeBody('password').escape();
    req.sanitizeBody('confirmar').escape();
    
    // validar
    req.checkBody('nombre' , 'El Nombre es Obligatorio').notEmpty();// que el nombre no sea vacio = notEmpty
    req.checkBody('email', 'El Email debe ser valido').isEmail();
    req.checkBody('password', 'El password no puede ir vacio').notEmpty();
    req.checkBody('confirmar', 'Confirmar password no puede ir vacio').notEmpty();
    req.checkBody('confirmar','El password es diferente').equals(req.body.password); //compara los password

    const errores = req.validationErrors(); //en caso de que existan errores se guardaran aqui 

    if(errores){
        // si no hay errores
        req.flash('error', errores.map(error => error.msg) );  //de  esta forma solo tenemos los mensajes

        
        res.render('crear-cuenta',{
            nombrePagina : 'Crear tu cuenta en devJobs',
            tagline: 'Comienza a publicar tus vacantes gratis , solo debes crear una cuenta',
            mensajes: req.flash()
        });
        return;
    }
    // di toda la validacion es correcta 
    next()

}   

exports.crearUsuario = async (req, res, next) => {
    // Crear el usuario
    const usuario = new Usuarios (req.body);


    try {
        await usuario.save();
        res.redirect('/iniciar-sesion');

    } catch (error) {
        console.log(error)
        // si hay un error lo pasamos a la clase de error 
        // ese error saldra del post de Usuarios.js - Ese correo ya esta registrado
        req.flash('error', error);
        res.redirect('/crear-cuenta');
    }
}

// Formulario para iniciar sesion
exports.formIniciarSesion = (req , res) => {
    res.render('iniciar-sesion', {
        nombrePagina : 'Iniciar Sesion devJobs'
    })
}

// Form editar el Perfil 
exports.formEditarPerfil = (req, res ) => {

    console.log(req.user)
    const {nombre , email, password, imagen} = req.user

    const user = {
        nombre, 
        email , 
        password,
        imagen
    }

    res.render('editar-perfil',{
        nombrePagina : 'Editar tu perfil en devJobs',
        usuario: user,
        cerrarSesion:true,
        nombre : nombre,
        imagen : imagen
    })
}
// Guardar cambios editar perfil
exports.editarPerfil = async(req, res) => {
    const usuario = await Usuarios.findById(req.user._id);
    // console.log(usuario)
    usuario.nombre = req.body.nombre;
    usuario.email = req.body.email;

    if(req.body.password){
        usuario.password = req.body.password
    }
    console.log("arreglo",req.file); //podremos acceder a todos los archivos de multer - veremos toda la info

    //si no lo encuentra es porque es muy pessado y no paso por el filtro del limite
    console.log(req.file) 

    if(req.file) {
        usuario.imagen = req.file.filename;
    }


    const errores = req.validationErrors();
    
    if(!errores){
        console.log("usuario creado")
        await usuario.save(); //guaradamos el usuario

        req.flash('correcto', 'Cambios Guardados Correctamente');
        // redirect
    }

    res.redirect('/administracion');




}

// sanitizar y validar el formulario de editar perfiles
exports.validarPerfil = (req, res, next) => {
    // sanitizar
    req.sanitizeBody('nombre').escape();
    req.sanitizeBody('email').escape();
    if(req.body.password){
        req.sanitizeBody('password').escape();
    }
    // validar
    req.checkBody('nombre', 'El nombre no puede ir vacio').notEmpty();
    req.checkBody('email', 'El correo no puede ir vacio').notEmpty();

    const errores = req.validationErrors();

    if(errores) {
        req.flash('error', errores.map(error => error.msg));
        const {nombre , email, password, imagen} = req.user

        const user = { nombre, email, password , imagen}
        res.render('editar-perfil', {
            nombrePagina : 'Edita tu perfil en devJobs',
            usuario: req.user,
            cerrarSesion: true,
            nombre : nombre,
            imagen : imagen,
            mensajes : req.flash()
        })
    }
    next(); // todo bien, siguiente middleware!
}


