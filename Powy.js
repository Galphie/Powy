const Log = require('./log');

// Lista de espera para los turnos
let turnos = [];

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

            if (message.content === `${config.prefix}moderar`) {
                Log.info(`Canal a moderar: #${message.channel.name}`);
                message.channel.send(`Se ha establecido el canal #${message.channel.name} como canal a moderar`)
            }

            if (message.content === `${config.prefix}turno`) {
                Log.info(`${message.author.tag} ha pedido turno`);
                const authorVoiceChannel = message.member.voice.channel;
                Log.info("authorVoiceChannel: ", authorVoiceChannel);
                if (!authorVoiceChannel) {
                    Log.warning('No está en un canal de voz')
                    message.reply('Debes estar en un canal de voz para pedir un turno.');
                    return;
                }
                if (turnos.includes(message.author.id)) {
                    Log.warning('Usuario ya incluido en la lista')
                    message.reply('Ya pediste un turno.');
                    return;
                }
                turnos.push(message.author.id);
                message.reply('Pedido de turno registrado.');
            }

            if (message.content === `${config.prefix}siguienteTurno`) {
                //TODO: controlar que solo pueda usarlo un moderador
                turnos.shift();
                const nextUser = client.users.cache.get(turnos[0]);
                nextUser.send('Es tu turno');
            }

            if (message.content === `${config.prefix}listaTurnos`) {
                message.reply(turnos.toString());
            }
        }
    });
}

module.exports = {
    init: init
};
