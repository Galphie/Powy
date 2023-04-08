const Log = require('./log');

const mostrarOrdenado = (lista) => {
    let resultado = '';

    lista.forEach(elemento => {
        resultado += `> **${elemento.comando}**\n${elemento.descripcion} \n| ¿Quién puede usarlo? -> *${elemento.disponibilidad}* |\n\n`;
    });

    return resultado;

}

const limpiarCanalAModerar = () => { 
    canalAModerar = null;
    Log.info("Canal a moderar eliminado");
}

const Util = {
    mostrarOrdenado: mostrarOrdenado,
    limpiarCanalAModerar: limpiarCanalAModerar
}

module.exports = Util;