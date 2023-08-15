const moment = require('moment/moment');
const Util = require('./util');
const Log = require('./log');
const config = require('./config.json');

moment.locale('es');

const comandos = [
    { "comando": "!moderar", "descripcion": "Para establecer el canal en el que se va a necesitar moderación. __Esto limpiará la lista de espera.__", "disponibilidad": "Moderador" },
    { "comando": "!turno /☝️", "descripcion": "Para pedir el turno. Si se añade como parámetro 'conclusion', se marcará en la lista como que tiene intención de cerrar. Ejemplo: '!turno conclusion'", "disponibilidad": "Cualquiera" },
    { "comando": "!siguiente", "descripcion": "Para cambiar al siguiente turno de la lista.", "disponibilidad": "Moderador" },
    { "comando": "!listaTurnos / !lista", "descripcion": "Para ver la lista de espera.", "disponibilidad": "Cualquiera" },
    { "comando": "!eliminame", "descripcion": "Para quitarte de la lista de espera, si ya no quieres hablar.", "disponibilidad": "Cualquiera" },
    { "comando": "!limpiar", "descripcion": "Para limpiar la lista de espera.", "disponibilidad": "Moderador" },
    { "comando": "!help", "descripcion": "Para mostrar esta lista de comandos tan chula.", "disponibilidad": "Cualquiera" }
]
let turnos = [];
let canalAModerar;
let quiereCerrar = false;
let param;
let temporizador = setTimeout(() => canalAModerar = null, 3600000);
let cooldownOn = false;

const init = (client) => {

    client.once('ready', () => {
        console.clear();
        Log.success(`Bot conectado como ${client.user.tag}`);
        console.log();
    });

    client.on('messageCreate', async (message) => {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => canalAModerar = null, 3600000);

        if (message.content.includes(" ") && (message.content.startsWith("!") || message.content.includes("☝️"))) {
            param = message.content.split(" ")[1];
            message.content = message.content.split(" ")[0];
        }

        if (message.author.id !== client.user.id) {
            switch (message.content) {
                //Comando '!moderar', para establecer el canal en el que se va a necesitar moderación. Solo los que tengan rol 'Moderador' podrán usarlo
                case `${config.prefix}moderar`:
                    if (message.member.roles.cache.some(role => role.name === 'Moderador')) {
                        if (message.channel !== canalAModerar) {
                            turnos = [];
                            canalAModerar = message.channel;
                            Log.info(`Canal a moderar: #${canalAModerar.name}`);
                            canalAModerar.send(`Se ha establecido el canal ${canalAModerar} como canal a moderar`);
                        } else {
                            message.reply('Este canal ya está asignado para moderar.');
                        }
                    } else {
                        message.author.send('¡Hola! Antes de nada, te informo de que te mando este mensaje privado porque es mejor no saturar el servidor 😜.\n\nSi no tienes el rol de "Moderador" no vas a poder utilizar determinados comandos en el servidor.\nSi utilizas el comando "!help" en el servidor, podrás ver qué comandos puedes utilizar.')
                    }
                    break;
                //Comando '!turno', para pedir el turno (añadir usuario a la lista de espera). Si se añade como parámetro "conclusion", se marcará en la lista como que tiene intención de cerrar.
                case `${config.prefix}turno`:
                case '☝️':
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
                    break;
                //Comando '!siguiente', para cambiar de turno en la lista. Solo los que tengan rol 'Moderador' podrán usarlo
                case `${config.prefix}siguiente`:
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
                    } else {
                        message.author.send('¡Hola! Antes de nada, te informo de que te mando este mensaje privado porque es mejor no saturar el servidor 😜.\n\nSi no tienes el rol de "Moderador" no vas a poder utilizar determinados comandos en el servidor.\nSi utilizas el comando "!help" en el servidor, podrás ver qué comandos puedes utilizar.')
                    }
                    break;
                //Comando '!listaTurnos', para ver la lista de espera
                case `${config.prefix}listaTurnos`:
                case `${config.prefix}lista`:
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
                    break;
                //Comando '!eliminame', para quitarte de la lista de espera si ya no quieres hablar
                case `${config.prefix}eliminame`:
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
                    break;
                //Comando '!limpiar', para vaciar la lista de espera al terminar un punto
                case `${config.prefix}limpiar`:
                    if (message.member.roles.cache.some(role => role.name === 'Moderador')) {
                        if (canalAModerar) {
                            if (message.channel === canalAModerar) {
                                turnos = [];
                                message.reply('Lista de espera vaciada');

                            } else {
                                message.reply(`Solo se pueden utilizar los comandos en el canal ${canalAModerar}.`);
                            }
                        } else {
                            message.reply('Para poder utilizar los comandos en este canal, debes asignarlo para moderación con el comando "!moderar"');
                        }
                    } else {
                        message.author.send('¡Hola! Antes de nada, te informo de que te mando este mensaje privado porque es mejor no saturar el servidor 😜.\n\nSi no tienes el rol de "Moderador" no vas a poder utilizar determinados comandos en el servidor.\nSi utilizas el comando "!help" en el servidor, podrás ver qué comandos puedes utilizar.')
                    }

                    break;
                //Comando '!help', para mostrar la lista de comandos
                case `${config.prefix}help`:
                    message.reply(config.welcome)
                    setTimeout(() => message.channel.send(Util.mostrarOrdenado(comandos)), 1500);
                    break;
                
                //Comandos graciosos
                case `${config.prefix}hlep`:
                case `${config.prefix}truno`:
                case `${config.prefix}tuno`:
                case `${config.prefix}turnos`:
                case `${config.prefix}lita`:
                case `${config.prefix}lsita`:
                    if (!cooldownOn) {
                        message.reply(`Vaya, vaya, parece que ${message.author} se ha levantado un poco disxélico hoy :see_no_evil: `);
                        cooldownOn = true;
                        setTimeout(() => cooldownOn = false, 30000);
                    }
                    break;
                case '🖕':
                    message.react('😡');
                    break;
                case '👆':
                    message.react('🙄');
                    break;
                case '☟':
                    message.reply(`${message.author}, dale la vuelta al móvil, anda.`)
            }

            //TODO: Contador por usuario para que deje de dar por culo. Mr Increíble
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
