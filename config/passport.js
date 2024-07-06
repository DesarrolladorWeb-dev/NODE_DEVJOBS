const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const mongoose = require('mongoose');
const Usuarios = mongoose.model('Usuarios');

passport.use(new LocalStrategy({
    // le decimos desde nuestros modelos se autenticaran co nestos dos campos 
    usernameField : 'email',
    passportField : 'password'
    // done es igual a next 
    },async (email , password, done) => { //esta funcion interactua con la base de datos 
        const usuario = await Usuarios.findOne({email});

        if(!usuario) return done(null,false, {  //mensaje de error , usuarios, opciones 
            menssage :  'Usuario No Existente'
        } ) 
        // usuario existe , vamos a verificarlo - usamos el metodo comparar password de Usuario.js
        const verificarPass = usuario.compararPassword(password) //le pasamos el password que colocamos input

        if(!verificarPass) return done(null,false, {
            message : 'Password Incorrecto'
        } );

        // Usuario existe y el password es correcto
        return done(null,usuario)  //le pasamos el usuario 

}));


// Serializamos 
// en caso de que finalize no tome ningun error (null) , pero si tome el usuario y el id
// de esta manera tenemos el id del usuario
passport.serializeUser((usuario, done) => done(null, usuario._id)) ;   

passport.deserializeUser(async (id, done) => {  // le pasara un id y done el next 
    const usuario = await Usuarios.findById(id).exec(); //exec : ejecuta la consulta
    return done(null, usuario) //no retorna ningun error , pero si el usuario
})

module.exports = passport;  // lo importaremos en el index.js