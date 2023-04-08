const mostrarEnTabla = (lista) => {
    let resultado = '';

    resultado += '| Comando | Descripción | Disponibilidad |\n';
    resultado += '|---------|-------------|-----------------|\n';

    lista.forEach(elemento => {
        resultado += `| ${elemento.comando} | ${elemento.descripcion} | ${elemento.disponibilidad} |\n`;
    });

    return resultado;

}

const Util = {
    mostrarEnTabla: mostrarEnTabla
}

module.exports = Util;