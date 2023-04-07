const { Client, GatewayIntentBits } = require('discord.js');
const config = require('./config.json');
const Powy = require('./Powy');

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

Powy.init(client, config);

client.login(config.token);

