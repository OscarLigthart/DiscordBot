const Discord = require('discord.js');
const {
	prefix,
	token,
} = require('./auth.json');
const ytdl = require('ytdl-core');

const Music = require("./music_helpers.js");

const bot = new Discord.Client();

//const queue = new Map();

bot.once('ready', () => {
	console.log('Ready!');
});

bot.once('reconnecting', () => {
	console.log('Reconnecting!');
});

bot.once('disconnect', () => {
	console.log('Disconnect!');
});

/**
 *  Let the bot respond to messages
 */
bot.on('message', async message => {
	if (message.author.bot) return;
	if (!message.content.startsWith(prefix)) return;

    var args = message.content.substring(1).split(' ');
    var cmd = args[0];
    var cmd = cmd.toLowerCase();

    // switch/case to walk through possible commands
    switch(cmd) {

        // help
        case 'help':
            // send command list
            message.channel.send('Only Oscar knows what I am capable of.')
            break;

        // !ping
        case 'play':
            // play the requested song
            Music.execute(message);
            break;
            
        case 'skip':
            // skip the current song
            Music.skip(message);
            break;

        // what else would be nice to have?
        case 'stop':
            // stop playing songs
            Music.stop(message);
            break;

        case 'queue':
        case 'q':
            // show the queue
            Music.queue(message);
            break;

        case 'remove':
        case 'r':
            // show the queue
            Music.remove(message, args);
            break;

        case 'pause':
            // pause the music
            Music.pause(message, args);
            break;

        case 'resume':
            // pause the music
            Music.resume(message, args);
            break;

        // case 'nachtjapon':
        //     message.content = 'manon jvt';
        //     Music.execute(message);
        //     message.channel.send('!play manon jvt');
        //     message.channel.send('-play manon jvt');
        //     break;
        
        
        // funny messages
        case ('jelle'):
            message.channel.send('I think I have some spare multipurpose ropes lying around.', {
                tts: true
            })
            break;

        case ('tim'):
            message.channel.send('No one nose who he is.', {
                tts: true
            })
            break;

        case ('sander'):
            message.channel.send('This guy is so fat, you literally can\'t miss him if friendly fire is on.', {
                tts: true
            })
            break;

        case ('guido'):
            message.channel.send('https://www.transhair.nl/haartransplantatie-amsterdam?gclid=EAIaIQobChMI54Si7d6y5QIV0-R3Ch0SAQGQEAAYAiAAEgIbFvD_BwE')
            break;

        case ('mischa'):
            message.channel.send('If only you\'d hit that...', {
                tts: true
            })
            break;
        
        case ('kanker'):
            message.channel.send('Kanker zelf op jonge', {
                tts: true
            })
        
        // if nothing matches, the bot does not know the command
        default:
            message.channel.send('I do not know this command. Please master, spare me!')

    }

});



bot.login(token);