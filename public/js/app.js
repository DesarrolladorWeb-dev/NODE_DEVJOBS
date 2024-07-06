import axios from 'axios';
import Swal from 'sweetalert2'


document.addEventListener('DOMContentLoaded', () => {
    const skills = document.querySelector('.lista-conocimientos');

    //Limpiar las Alertas  
    let alertas = document.querySelector('.alertas');

    if(alertas){
        limpiarAlertas();
    }

    if(skills){
        skills.addEventListener('click', agregarSkills);
        // una vez que estamos en editar , llamar la funcion 
        skillSeleccionados();
    }

    const vacantesListado = document.querySelector('.panel-administracion');

    if(vacantesListado){
        console.log(vacantesListado)
        vacantesListado.addEventListener('click', accionesListado);
    }
})

const skills = new Set();

const agregarSkills = e => {
    if(e.target.tagName == 'LI'){
        if(e.target.classList.contains('activo')){
            // quitarlo del set y quitar la clase
            skills.delete( e.target.textContent);
            e.target.classList.add('remove');
        }else{
            // Agregarlo al set y agregar la clase 
            skills.add( e.target.textContent);
            e.target.classList.add('activo');
        }
    }
    //una copia del set para convertirlo en un arreglo  porque sino no se podra leer
    const skillsArray = [...skills] ;
    document.querySelector('#skills').value = skillsArray;

}

const skillSeleccionados = () => {
    const seleccionadas = Array.from (document.querySelectorAll('.lista-conocimientos .activo'));

    console.log(seleccionadas) // tendremos las li

    
    // TODO Cada vez que le doy click se agrega en value del input skills y resalta
    seleccionadas.forEach(seleccionadas => {
        skills.add(seleccionadas.textContent);
    })
    // inyectarlo en el hidden 
    const skillsArray = [...skills] ;
    document.querySelector('#skills').value = skillsArray;

}

const limpiarAlertas = () => {
    const alertas = document.querySelector('.alertas');
    const interval = setInterval(()=> {
        if(alertas.children.length > 0) { //si hay hijos 
            alertas.removeChild(alertas.children[0]);
        }else if(alertas.children.length === 0){ 
            alertas.parentElement.removeChild(alertas); //elimina el div padre
            clearInterval(interval) //detiene el interval cunado ya no hay mas alertas , soluciona el bucle
        }
    },2000) //cada dos segundos elimina una alerta 

}

// Eliminar vacantes
const accionesListado = e => {
    e.preventDefault();
    console.log(e.target); // lo que dimos click
    
    if(e.target.dataset.eliminar){
        console.log(e.target.dataset.eliminar)
        //Eliminar por axios
        Swal.fire({
            title: "¿Confirmar Eliminacion?",
            text: "Una vez eliminada no se puede recuperar",
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#3085d6",
            cancelButtonColor: "#d33",
            confirmButtonText: "Si, Eliminar",
            cancelButtonText : 'No, Cancelar'
          }).then((result) => {
            if (result.value) {
                // Enviar la peticion con axios //servirdo actual
                const url = `${location.origin}/vacantes/eliminar/${e.target.dataset.eliminar}`;
                console.log(url)

                // Axios para eliminar el registro
                axios.delete(url, {params:{url}})
                    .then(function(respuesta){
                        if(respuesta.status === 200){
                            Swal.fire(
                                'Eliminado',
                                respuesta.data,
                                'success'
                            );
                              //Eliminar del DOM
                              e.target.parentElement.parentElement.parentElement.removeChild(e.target.parentElement.parentElement);

                        }
                    })
                    .catch(() => {
                        Swal.fire({
                            type:'error',
                            title: 'Hubo un error',
                            text: 'No Se pudo eliminar'
                        })
                    })

            }

          });

    }else if(e.target.tagName === 'A'){ // si el click se presenta en un tag de un enlace 

        // si le da click  a los otros botones  los manda hacia sus vistas
        window.location.href = e.target.href 
    }
}