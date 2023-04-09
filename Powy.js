const moment = require('moment/moment');
const Util = require('./util');
const Log = require('./log');

moment.locale('es');

const comandos = [
    { "comando": "!moderar", "descripcion": "Para establecer el canal en el que se va a necesitar moderación. __Esto limpiará la lista de espera.__", "disponibilidad": "Moderador" },
    { "comando": "!turno/☝️", "descripcion": "Para pedir el turno. Si se añade como parámetro 'conclusion', se marcará en la lista como que tiene intención de cerrar. Ejemplo: '!turno conclusion'", "disponibilidad": "Cualquiera" },
    { "comando": "!siguiente", "descripcion": "Para cambiar al siguiente turno de la lista.", "disponibilidad": "Moderador" },
    { "comando": "!listaTurnos/!lista", "descripcion": "Para ver la lista de espera.", "disponibilidad": "Cualquiera" },
    { "comando": "!eliminame", "descripcion": "Para quitarte de la lista de espera, si ya no quieres hablar.", "disponibilidad": "Cualquiera" },
    { "comando": "!limpiar", "descripcion": "Para limpiar la lista de espera.", "disponibilidad": "Moderador" },
    { "comando": "!help", "descripcion": "Para mostrar esta lista de comandos tan chula.", "disponibilidad": "Cualquiera" }
]
let turnos = [];
let canalAModerar;
let quiereCerrar = false;
let param;
let temporizador = setTimeout(Util.limpiarCanalAModerar, 3600000);

const init = (client, config) => {

    client.once('ready', () => {
        console.clear();
        Log.success(`Bot conectado como ${client.user.tag}`);
        console.log();
    });

    client.on('messageCreate', async (message) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(Util.limpiarCanalAModerar, 3600000);

        if (message.content.includes(" ") && (message.content.startsWith("!") || message.content.includes("☝️"))) {
            param = message.content.split(" ")[1];
            message.content = message.content.split(" ")[0];
        }

        if (message.author.id !== client.user.id) {
            Log.info('Se ha recibido un mensaje');
            Log.showMessage(message.author.tag, message.content);

            //Comando '!moderar', para establecer el canal en el que se va a necesitar moderación. Solo los que tengan rol 'Moderador' podrán usarlo
            if (message.content === `${config.prefix}moderar`) {
                if (message.member.roles.cache.some(role => role.name === 'Moderador')) {
                    if (message.channel !== canalAModerar) {
                        turnos = [];
                        canalAModerar = message.channel;
                        Log.info(`Canal a moderar: #${canalAModerar.name}`);
                        canalAModerar.send(`Se ha establecido el canal ${canalAModerar} como canal a moderar`);
                    } else {
                        message.reply('Este canal ya está asignado para moderar.');
                    }
                }
            }

            //Comando '!turno', para pedir el turno (añadir usuario a la lista de espera). Si se añade como parámetro "conclusion", se marcará en la lista como que tiene intención de cerrar.
            if (message.content === `${config.prefix}turno` || message.content === '☝️') {
                Log.info(`${message.author.tag} ha pedido turno`);
                if (canalAModerar) {
                    if (message.channel === canalAModerar) {
                        if (turnos.find(turno => turno.usuario === message.author)) {
                            Log.warning('Usuario ya incluido en la lista');
                            message.reply('Ya pediste un turno.');
                            return;
                        }
                        if (param === 'conclusion') {
                            quiereCerrar = true;
                        }
                        const nuevoTurno = {
                            usuario: message.author,
                            hora: moment(),
                            cierraTema: quiereCerrar
                        };
                        turnos.push(nuevoTurno);
                        message.react('📝')
                            .then(() => message.reply('Solicitud de turno registrada.'));
                        quiereCerrar = false;
                    } else {
                        message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                    }
                } else {
                    message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                }
            }

            //Comando '!siguiente', para cambiar de turno en la lista. Solo los que tengan rol 'Moderador' podrán usarlo
            if (message.content === `${config.prefix}siguiente`) {
                if (message.member.roles.cache.some(role => role.name === 'Moderador')) {
                    if (canalAModerar) {
                        if (message.channel === canalAModerar) {
                            if (turnos.length > 0) {
                                const nextUser = turnos[0].usuario;
                                canalAModerar.send(`${nextUser}, ¡es tu turno!`);
                                turnos.shift();
                            } else {
                                message.reply("Vaya, parece que no hay nadie en la lista");
                            }
                        } else {
                            message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                        }
                    } else {
                        message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                    }
                }
            }

            //Comando '!listaTurnos', para ver la lista de espera
            if (message.content === `${config.prefix}listaTurnos` || message.content === `${config.prefix}lista`) {
                if (canalAModerar) {
                    if (message.channel === canalAModerar) {
                        if (turnos.length > 0) {
                            message.reply(Util.mostrarListaTurnos(turnos));
                        } else {
                            message.reply("Vaya, parece que no hay nadie en la lista");
                        }
                    } else {
                        message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                    }
                } else {
                    message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                }
            }

            //Comando '!eliminame', para quitarte de la lista de espera si ya no quieres hablar
            if (message.content === `${config.prefix}eliminame`) {
                if (canalAModerar) {
                    if (message.channel === canalAModerar) {
                        if (turnos.find(turno => turno.usuario === message.author)) {
                            turnos.splice(turnos.findIndex(turno => turno.usuario === message.author), 1);
                            message.reply('Te he eliminado de la lista, como has pedido');
                        } else {
                            message.reply('No estás en la lista de espera, así que no te he tenido que eliminar');
                        }
                    } else {
                        message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                    }
                } else {
                    message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                }
            }

            //Comando '!limpiar', para vaciar la lista de espera al terminar un punto
            if (message.content === `${config.prefix}limpiar`) {
                if (canalAModerar) {
                    if (message.channel === canalAModerar) {
                        if (message.member.roles.cache.some(role => role.name === 'Moderador')) {
                            turnos = [];
                            message.reply('Lista de espera vaciada');
                        }
                    } else {
                        message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                    }
                } else {
                    message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                }
            }

            //Comando '!help', para mostrar la lista de comandos
            if (message.content === `${config.prefix}help`) {
                message.reply(config.welcome)
                setTimeout(() => message.channel.send(Util.mostrarOrdenado(comandos)), 1500);

            }

            //Comandos graciosos
            if (message.content === `${config.prefix}hlep` 
                || message.content === `${config.prefix}truno`
                || message.content === `${config.prefix}turnos`) {
                message.reply(`Vaya, vaya, parece que ${message.author} se ha levantado un poco disxélico hoy :see_no_evil: `)

            }

            if (message.content === '🖕')
                message.react('😡');
            else if (message.content === '👆')
                message.react('🙄');

            // if (message.content === `${config.prefix}test`) {

            //     message.reply(canalAModerar.name);
            //     canalAModerar.send("funciona");
            // }
        }
    });
}

module.exports = {
    init: init
};
