require('dotenv').config();
const { Client, GatewayIntentBits } = require('discord.js');
const Powy = require('./Powy');

const client = new Client({
    partials: ['MESSAGE', 'CHANNEL', 'REACTION'],
    intents: [
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.Guilds
    ]
});

Powy.init(client);

client.login(process.env.TOKEN);

