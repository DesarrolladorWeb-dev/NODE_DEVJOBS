module.exports = {
    seleccionarSkills : (seleccionadas = [], opciones ) => {

        // opciones son las etiquetas que se encuentran dentro de seleccionarSkills


        const skills = ['HTML5','CSS3','CSSGrid','Flexbox','JavaScript',
        'JQuery','Node','Angular','VueJS','ReactJS','React Hooks', 'Redux',
        'Apollo','GraphQL', 'TypeScript','PHP','Laravel','Symfony','Python',
        'Django','ORM','Sequelize','Mongoose','SQL','MVC','SASS','WordPress'];

        // this.seleccionadas.includes(skill) para saber si se encuentra y depende a eso devuelve false o true y activa los que se encuentran
        let html = '';
        skills.forEach(skill => {
            html += ` 
                <li${seleccionadas.includes(skill) ? ' class = "activo"' : ''} >${skill}</li>
            `;
        })
        return opciones.fn().html = html;
    },

    tipoContrato : (seleccionado , opciones) => {
        // opciiones =  todo lo que contiene en su interior
        // console.log(opciones.fn())  // --> aquel seleccionado
        return opciones.fn(this).replace(
            // Tomamos el value  y le vamos a agregar el select : 
            // $&  = signica que va a insertar un atributo , cuando encuentre lo que hemos  seleccionado ( value = "${seleccionado}) el que se encuentra en la bd
            // agregara el atributo a la etiqueta  selected="selected"
            //* debe estar junto value=
            new RegExp(`value="${seleccionado}"`), '$& selected="selected" '
        )
    },
    mostrarAlertas: (errores = {} , alertas) => {

        //Nos permite traernos las llaves de nuestros objetos 
        const categoria = Object.keys(errores)
        let html = '';
        if(categoria.length){ //se ejecutara si almenos tiene una categoria 
            // console.log(errores[categoria]) //solo tendremos los mensajes de error 
            errores[categoria].forEach(error => {
                html += `
                    <div class="${categoria} alerta">
                        ${error}
                    </div>
                `;
            })
        }
       return alertas.fn().html = html; //para mostrarlo en la pagina crear-cuenta
    }

}
