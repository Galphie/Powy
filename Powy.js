const moment = require('moment/moment');
const Log = require('./log');

moment.locale('es')
// Lista de espera para los turnos
let turnos = [];
let canalAModerar;

function init(client, config) {

    client.once('ready', () => {
        console.clear();
        Log.success(`Bot conectado como ${client.user.tag}`);
        console.log();
    });

    client.on('messageCreate', async (message) => {
        if (message.author.id !== client.user.id) {
            Log.info('Se ha recibido un mensaje');
            Log.showMessage(message.author.tag, message.content);

            //Comando '!moderar', para establecer el canal en el que se va a necesitar moderación
            if (message.content === `${config.prefix}moderar`) {
                canalAModerar = message.channel;
                Log.info(`Canal a moderar: #${canalAModerar.name}`);
                canalAModerar.send(`Se ha establecido el canal ${canalAModerar} como canal a moderar`)
            }

            //Comando '!turno', para pedir el turno (añadir usuario a la lista de espera)
            if (message.content === `${config.prefix}turno`) {
                Log.info(`${message.author.tag} ha pedido turno`);

                if (turnos.find(turno => turno.usuario === message.author)) {
                    Log.warning('Usuario ya incluido en la lista')
                    message.reply('Ya pediste un turno.');
                    return;
                }
                const nuevoTurno = {
                    usuario: message.author,
                    hora: moment()
                };
                turnos.push(nuevoTurno);
                message.reply('Solicitud de turno registrada.');
            }

            //Comando '!siguiente', para cambiar de turno en la lista. Solo los que tengan rol 'Moderador' podrán usarlo
            if (message.content === `${config.prefix}siguiente`) {
                //TODO: controlar que solo pueda usarlo un moderador
                if(canalAModerar) {
                    if(turnos.length > 0) {
                        const nextUser = turnos[0].usuario;
                        canalAModerar.send(`${nextUser}, ¡es tu turno!`);
                        turnos.shift();
                    } else {
                        message.reply("Vaya, parece que no hay nadie en la lista")
                    }
                } else {
                    message.reply(`Parece que no hay ningún canal a moderar seleccionado. Usa el comando '!moderar' para seleccionar este`)
                }
            }

            //Comando '!listaTurnos', para ver la lista de espera
            if (message.content === `${config.prefix}listaTurnos`) {
                if (turnos.length > 0) {
                    let respuesta = "**__Lista de espera__**\n\n";
                    turnos.forEach(turno => {
                        respuesta += `${turno.usuario} *(${turno.hora.fromNow()})*` + "\n"
                    });
                    message.reply(respuesta);
                } else {
                    message.reply("Vaya, parece que no hay nadie en la lista")
                }
            }

            if (message.content === `${config.prefix}test`) {

                message.reply(canalAModerar.name);
                canalAModerar.send("funciona")
            }
        }
    });
}

module.exports = {
    init: init
};
