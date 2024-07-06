const mongoose = require('mongoose');
mongoose.Promise = global.Promise; 

const bcrypt = require('bcrypt');

const usuariosSchema = new mongoose.Schema ({
    email : {
        type : String,
        unique : true,
        lowercase : true,
        trim:true,
    },
    nombre : {
        type:String ,
        required: true
    },
    password : {
        type : String ,
        required : true ,
        trim: true
    },
    token: String,
    expira: Date,
    imagen: String
})

// Metodo para hasheear los passwords 
// todo el objeto que vallamos a cagar pasa por esta parte 
usuariosSchema.pre('save', async function(next) {

    // isModufied es un metodo de mongose
    if(!this.isModified('password')){ //si ya esta hasheado
        return next(); //deten la ejecucion 
    }
    // si no esta hacheado 
    const hash = await bcrypt.hash(this.password, 12);
    this.password = hash;
    next();
});

// Envia alerta cuando un usuario ya esta registrado
usuariosSchema.post('save', function(error, doc, next) {
    // Previene que se inserte los registros erroneos - correos repetidos 
    // este error es de elementos duplicados 11000

    console.log('aqui',error)
    if(error.name === 'MongoServerError' && error.code === 11000){ 
        next('Ese correo ya esta registrado');

    } else {
        next(error); //importante porque puede suceder muchos errores
    }
} );

// Autenticar Usuarios - de esta forma te permite agregar diferentes funciones
usuariosSchema.methods = {
    // compara el password que le pasamos y el password que esta hasheado retorna true o false
    compararPassword: function(password) {
        return bcrypt.compareSync(password, this.password);
    }
}

module.exports = mongoose.model('Usuarios', usuariosSchema)