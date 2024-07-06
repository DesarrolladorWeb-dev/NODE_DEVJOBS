const mongoose = require('mongoose');
mongoose.Promise = global.Promise;  //para las respuestas de mongoose Promises
const slug = require('slug');
const shortid = require('shortid');

const vacantesSchema =  new mongoose.Schema({
    titulo: {
        type: String, 
        required: 'El nombre de la vacante es obligatorio',
        trim : true
    }, 
    empresa: {
        type: String,
        trim: true
    },
    ubicacion: {
        type: String,
        trim: true,
        required: 'La ubicación es obligatoria'
    },
    salario: {
        type: String,
        default: 0,
        trim: true,
    },
    contrato: {
        type: String,
        trim: true,
    },
    descripcion: {
        type: String,
        trim: true,
    },
    url : {
        type: String,
        lowercase:true
    },
    skills: [String],
    candidatos: [{
        nombre: String,
        email: String,
        cv : String
    }], 
    autor : {
        type: mongoose.Schema.ObjectId, 
        ref: 'Usuarios', 
        required: 'El autor es obligatorio'
    }
});

// Hooks para almacenar antes de que se guarde a la base de datos = lo encuentras en Midelware (pagina)
// siempre es algo es lo que te da opciones en la pagina en este caso usaremos 
// antes de guardar 
vacantesSchema.pre('save', function(next){
    // crear la url
    const url = slug(this.titulo)  //se va a pasar el objeto completo y al unico que aplicaremos slug es a titulo
    this.url = `${url}-${shortid.generate()}`; //es para el id unico

    next() //que es el siguiente midelware
})

module.exports = mongoose.model('Vacante', vacantesSchema )