const Discord = require('discord.js');
const config = require("./config.json");

const client = new Discord.Client({
    intents: [config.intents],
});

// Lista de espera para los turnos
let turnos = [];

client.on('ready', () => {
    console.log(`Bot conectado como ${client.user.tag}`);
});

client.on('message', (message) => {
    console.log('Se ha recibido un mensaje')
    if (message.content === `${config.prefix}turno`) {
        const authorVoiceChannel = message.member.voice.channel;
        if (!authorVoiceChannel) {
            message.reply('Debes estar en un canal de voz para pedir un turno.');
            return;
        }
        if (turnos.includes(message.author.id)) {
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
});


client.login(config.token);