const mongoose = require('mongoose')
require('dotenv').config({path: 'variables.env' });

mongoose.connect(process.env.DATABASE, { useNewUrlParser: true})
// const conectarDB = async () => {
//     try {
//         await mongoose.connect(process.env.DB_MONGO, {
//             // useNewUrlParser: true,
//             // useFindAndModify: false,
//             // useCreateIndex: true
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
    
            
//         });
//         console.log('DB Conectada')
//     } catch (error) {
//         console.log(error);    
//         process.exit(1) //detener la app
//     }

// }
// module.exports = conectarDB;

mongoose.connection.on('error', (error) => {
    console.log(error);
})

// importar los modelos
require('../models/Usuarios');
require('../models/Vacantes');