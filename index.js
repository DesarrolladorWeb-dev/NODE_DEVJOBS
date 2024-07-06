require('dotenv').config({path : 'variable.env'})
const mongoose = require('mongoose');

require('./config/db');
const express = require('express');
const router = require('./routes');
const exphbs = require('express-handlebars'); 
const path = require('path');
const app = express(); 
const cookieParser = require('cookie-parser');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session); //esta sintaxis significa pasarle variables a este packete 
// express validator 
const expressValidator = require('express-validator');
const flash = require('connect-flash')
const passport  = require('./config/passport')


// Activar el body parse parque que se muestren en los midelware
const bodyParser = require('body-parser')

// Habilitar body-parser 
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

// validacion de campos
app.use(expressValidator());

// habilidar handlebars como view 
app.engine('handlebars', exphbs({
    defaultLayout: 'Layout',  // especificamos el layout por default
    helpers:require('./helpers/handlebars') //registras script que se comunica con los handlebars antes de su salida
}));
app.set('view engine', 'handlebars'); // de esta forma sabe que estamos usando handlebars

// static files
app.use(express.static(path.join(__dirname, 'public'))) // para que lea los archivos estaticos que tenemos en public 

app.use(cookieParser());
// por default siempre que se crean sessiones se guardan
// resave: false, pero con esta configuracion no la estaremos guardando otra vez
// saveUninitialized , si una session no hace nada el usuario no la guardara
app.use(session({ // lo que se necesita para firmar la session
    secret: process.env.SECRETO,
    key: process.env.KEY,
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({  
        mongooseConnection : mongoose.connection  //para que nos envie cualquier mensaje
    })
}))

// Inicializar passport 
app.use(passport.initialize());
app.use(passport.session());

// Alertas y flash messages
app.use(flash());

// crear nuestro middleware
app.use((req, res, next ) => {
    // cuando se vallen a llamar se llenaran aut las variables locales
    res.locals.mensajes = req.flash();
    next();
})

app.use('/', router());

app.listen(process.env.PUERTO) 