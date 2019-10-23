var Discord = require('discord.io');
var logger = require('winston');
var config = require('./auth.json');

const ytdl = require('ytdl-core');

// Configure logger settings
logger.remove(logger.transports.Console);
logger.add(new logger.transports.Console, {
    colorize: true
});

logger.level = 'debug';

// queue for songs
const queue = new Map();

// function that executes the playing of songs
async function execute(message, serverQueue) {

	const voiceChannel = message.member.voiceChannel;
	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

	const songInfo = await ytdl.getInfo(args[1]);
	const song = {
		title: songInfo.title,
		url: songInfo.video_url,
	};

	if (!serverQueue) {
		const queueContruct = {
			textChannel: message.channel,
			voiceChannel: voiceChannel,
			connection: null,
			songs: [],
			volume: 5,
			playing: true,
		};

		queue.set(message.guild.id, queueContruct);

		queueContruct.songs.push(song);

		try {
			var connection = await voiceChannel.join();
			queueContruct.connection = connection;
			play(message.guild, queueContruct.songs[0]);
		} catch (err) {
			console.log(err);
			queue.delete(message.guild.id);
			return message.channel.send(err);
		}
	} else {
		serverQueue.songs.push(song);
		console.log(serverQueue.songs);
		return message.channel.send(`${song.title} has been added to the queue!`);
	}
}

// function to play a certian song
function play(guild, song) {
	const serverQueue = queue.get(guild.id);

	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

	const dispatcher = serverQueue.connection.playStream(ytdl(song.url))
		.on('end', () => {
			console.log('Music ended!');
			serverQueue.songs.shift();
			play(guild, serverQueue.songs[0]);
		})
		.on('error', error => {
			console.error(error);
		});
	dispatcher.setVolumeLogarithmic(serverQueue.volume / 5);
}

// Initialize Discord Bot
var bot = new Discord.Client({
   token: config.token,
   autorun: true
});

bot.on('ready', function (evt) {
    logger.info('Connected');
    logger.info('Logged in as: ');
    logger.info(bot.username + ' - (' + bot.id + ')');
});

bot.on('message', function (user, userID, channelID, message, evt) {
    console.log(message)
    const serverQueue = queue.get(message.guild.id)

    // Our bot needs to know if it will execute a command
    // It will listen for messages that will start with `~`
    if (message.substring(0, 1) == config.prefix) {
        var args = message.substring(1).split(' ');
        var cmd = args[0];

               
        args = args.splice(1);
        switch(cmd) {
            // !ping
            case 'ping':
                bot.sendMessage({
                    to: channelID,
                    message: 'Pong!'
                });
            break;

            // help
            case 'help':
                bot.sendMessage({
                    to: channelID,
                    message: 'Alleen Oscar weet wat ik kan doen'
                });
            break;

            case 'play':
                // bot.sendMessage({
                //     to: channelID,
                //     message: 'Playing ' + cmd
                // });

                execute(message, serverQueue);

            break;

            // what else would be nice to have?
            case 'test':
                // get all 
                voice_channel = discord.utils.get(ctx.message.server.channels, name="channelname", type=discord.ChannelType.voice)



         }
     }
});