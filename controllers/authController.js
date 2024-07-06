const passport = require('passport')
const mongoose = require('mongoose')
const Vacante = mongoose.model('Vacante');
const Usuarios = mongoose.model('Usuarios');
const crypto = require('crypto');
const enviarEmail = require('../handlers/email');

// local : Revisa la configuracion 
exports.autenticarUsuario =  passport.authenticate('local',{ 
    // tendremos dos URL , Bien y Mal
    successRedirect : '/administracion',  
    failureRedirect : '/iniciar-sesion',
    failureFlash:true,
    badRequestMessage : 'Ambos campos son obligatorios'
})

// Revisar si el usuario esta autenticado o no 
exports.verificarUsuario = (req, res, next) => {

    // revisar el usuario
    if(req.isAuthenticated()){

        return next(); // estan autenticados
    }

    // redireccionar
    res.redirect('/iniciar-sesion');

}

exports.mostrarPanel = async (req, res) => {

    // consultar el usuario autenticado 
    const vacantes = await Vacante.find({autor : req.user._id}).lean();

    

    res.render('administracion',{
        nombrePagina : 'Panel de Administracion',
        tagline: 'Crea y Administra tus vacantes desde aqui',
        cerrarSesion: true,
        nombre : req.user.nombre,
        imagen : req.user.imagen,
        vacantes

    })
}

exports.cerrarSesion = (req, res) => {
    req.logout();
    req.flash('correcto', 'Cerraste Sesion Correctamente')
    return res.redirect('/iniciar-sesion')
}


// Formulario para reiniciar el password
exports.formReestablecerPassword = (req, res) => {
    res.render('reestablecer-password',{
        nombrePagina : 'Restablece tu Password',
        tagline : 'Si ya tienes una cuenta pero olvidaste tu password, coloca tu email'
    })
}

// Genera el Token en la Tabla del usuario
exports.enviarToken = async (req, res) => {

    const usuario = await Usuarios.findOne({ email: req.body.email });

    if(!usuario) {
        req.flash('error', 'No existe esa cuenta');
        return res.redirect('/iniciar-sesion');
    }

    // el usuario existe, generar token
    usuario.token = crypto.randomBytes(20).toString('hex');
    usuario.expira = Date.now() + 3600000;

    // Guardar el usuario
    await usuario.save();
    const resetUrl = `http://${req.headers.host}/reestablecer-password/${usuario.token}`;

    console.log(resetUrl);

    // Enviar notificacion por email
    await enviarEmail.enviar({
        usuario,
        subject : 'Password Reset',
        resetUrl,
        archivo: 'reset'
    });

    console.log('-1');


    // Todo correcto
    req.flash('correcto', 'Revisa tu email para las indicaciones');
    res.redirect('/iniciar-sesion');
}