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

const mostrarListaTurnos = (lista) => {
    let respuesta = "**__Lista de espera__**\n\n";
    lista.forEach(turno => {
        respuesta += `${turno.usuario} ${(turno.cierraTema ? "🫶" : "")} *(${turno.hora.fromNow()})*` + "\n"
    });
    return respuesta;
}

const Util = {
    mostrarOrdenado: mostrarOrdenado,
    limpiarCanalAModerar: limpiarCanalAModerar,
    mostrarListaTurnos: mostrarListaTurnos
}

module.exports = Util;