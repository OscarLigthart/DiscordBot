const ytdl = require('ytdl-core');
const search = require('yt-search')

// global queue
const queue = new Map();

/**
 *  Function to execute a certain music command
 * @param {} message 
 * @param {*} serverQueue 
 */
exports.execute = async function (message) {

    const args = message.content.split(' ');
    const query = args.slice(1)

    // check if the user gave any query

    const serverQueue = queue.get(message.guild.id);

    const voiceChannel = message.member.voiceChannel;

	if (!voiceChannel) return message.channel.send('You need to be in a voice channel to play music!');
	const permissions = voiceChannel.permissionsFor(message.client.user);
	if (!permissions.has('CONNECT') || !permissions.has('SPEAK')) {
		return message.channel.send('I need the permissions to join and speak in your voice channel!');
	}

    // search for the song
    // todo, restructure this code
    const video = search(query.join(' '), async function(err, res){
        if (err) return message.channel.send('Sorry, something went wrong.')

        // get the first video in the queue
        let video = res.videos[0]  
        
        // get the song
        getSong(video, serverQueue, voiceChannel, message)
    });    

};

/**
 *  Function to show the queue
 * @param {*} message 
 * @param {*} serverQueue 
 */
exports.queue = function (message) {

    // get the server
    const serverQueue = queue.get(message.guild.id);

    // check if there is a queue
    if (!serverQueue) return message.channel.send('There is no queue currently.');

    // show how many songs are in the queue
    let nrSongs = serverQueue.songs.length

    if (nrSongs == 2){
        message.channel.send('There is currently ' + (nrSongs - 1) + ' song in the queue.');
    }
    else {
        message.channel.send('There are currently ' + (nrSongs - 1) + ' songs in the queue.');
    };    

    // initialize queue/song counter
    var count = 0;

    // initialize songqueue array
    var songQueue = []; 
    
    // add the songs in the form to feed to the embedding
    serverQueue.songs.forEach(function(song){
        
        // initialize songinfo
        var info;

        // skip the current song, as it is already embedded in the message
        if (count < 1) {
            info = {
                name: "Currently playing",
                value: serverQueue.songs[0].title
            }
        }
        // show the next songs
        else {
            info = {
                name: count,
                value: song.title
            }
        }

        songQueue.push(info);         
        count = count + 1;
    });

    // create the embedded message
    message.channel.send({embed: {
        color: 3447003,
        title: "Queue",
        fields: songQueue,
      }
    });

}

/**
 *  Function to remove a certain song, based on given index
 * @param {*} message 
 * @param {*} serverQueue 
 */
exports.remove = function (message, args) {
    
    // get the server
    const serverQueue = queue.get(message.guild.id);

    // check if there is a queue
    if (!serverQueue) return message.channel.send('There is no queue currently.');
    
    // extract the index, must be the second argument
    var index = args[1];

    // check if multiple were removed
    var index = index.split('-');

    // initialize range
    var range = [];

    // loop through given arguments
    index.forEach(function(i) {
        // put index in the correct form
        var i = parseInt(i, 10);

        // check if a number is inserted
        range.push(i);
    })

    for (let i = 0; i < range.length; i++) {
        // check if input is correct
        if (range[i] == NaN) return message.channel.send('Please use the following format: -remove {nr in queue}, or: -remove {nr in queue}-{nr in queue} for multiple removes.');

        // check if there is a queue item, or the queue is long enough
        if (range[i] + 1 > serverQueue.songs.length) return message.channel.send('The queue is not that long!');
    }

    // sort the list
    range.sort();

    // if two were given: 
    if (range.length == 2){

        // get difference in values
        let dif = range[1] - range[0]

        // remove messages
        message.channel.send(`Removing all songs from position ${range[0]} to ${range[1]}`);

        // remove range of songs
        return serverQueue.songs.splice(range[0], dif+1)        
    }
    else if (range.length == 1){

        // let user know song is being removed
        message.channel.send(`Removing: ${serverQueue.songs[index].title}`);
        // remove song requested by user
        return serverQueue.songs.splice(index, 1)

    }
    else {
        return message.channel.send('Please use the following format: -remove {nr in queue}, or: -remove {nr in queue}-{nr in queue} for multiple removes.');
    }


}

/**
 *  Function to skip a certain song
 * @param {*} message 
 * @param {*} serverQueue 
 */
exports.skip = function (message) {

    // get the server
    const serverQueue = queue.get(message.guild.id);

    // sanity checks
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');
    if (!serverQueue) return message.channel.send('There is no song that I could skip!');
    
    // stop song
	serverQueue.connection.dispatcher.end();
}

/**
 *  Function to stop playing songs
 * @param {} message 
 * @param {*} serverQueue 
 */
exports.stop = function (message) {

    // get the server
    const serverQueue = queue.get(message.guild.id);

    // sanity check
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');

    // empty queue
    serverQueue.songs = [];
    
    // stop song
	serverQueue.connection.dispatcher.end();
}

/**
 *  Function to pause song that is currently being played
 * @param {} message 
 * @param {*} serverQueue 
 */
exports.resume = function (message) {

    // get the server
    const serverQueue = queue.get(message.guild.id);

    // check if a song was playing
    if (!serverQueue) return message.channel.send('There is no song to be resumed!');

    // sanity check
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');

    if (!serverQueue.connection.dispatcher.paused) return message.channel.send('Already playing!');

    // pause the music
    serverQueue.connection.dispatcher.resume();
    
    // let user know music is paused
    return message.channel.send('Resuming the music!')
}

exports.pause = function (message) {

    // get the server
    const serverQueue = queue.get(message.guild.id);

    // check if a song is playing
    if (!serverQueue) return message.channel.send('There is no song to be paused!');

    // sanity check
    if (!message.member.voiceChannel) return message.channel.send('You have to be in a voice channel to stop the music!');

    if (serverQueue.connection.dispatcher.paused) return message.channel.send('Already paused!');
    
    // pause the music
    serverQueue.connection.dispatcher.pause();
    
    // let user know music is paused
    return message.channel.send('Paused the music!')
}

/**
 *  Function to play a certain song
 * @param {} guild 
 * @param {*} song 
 */
function play(guild, song) {

    // request queue
	const serverQueue = queue.get(guild.id);

    // leave if there is no song
	if (!song) {
		serverQueue.voiceChannel.leave();
		queue.delete(guild.id);
		return;
	}

    // play the selecte song
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

async function getSong(video, serverQueue, voiceChannel, message){

    const songInfo = await ytdl.getInfo(video.videoId);

    const song = {
        title: songInfo.title,
        url: songInfo.video_url,
    };

    // if there is not already a queue present, create one and add the requested song
    if (!serverQueue) {

        // create queue object
        const queueContruct = {
            textChannel: message.channel,
            voiceChannel: voiceChannel,
            connection: null,
            songs: [],
            volume: 5,
            playing: true,
        };
        
        // enter it in the queue fort this specific channel
        queue.set(message.guild.id, queueContruct);

        // add the song
        queueContruct.songs.push(song);

        // join the voice channel
        voiceChannel.join().then(function(connection) {
            queueContruct.connection = connection;
            play(message.guild, queueContruct.songs[0]);
        });
        return message.channel.send(`Playing: ${song.title}`);
    
    // if the queue is already present, just add the song to it
    } else {
        serverQueue.songs.push(song);
        return message.channel.send(`${song.title} has been added to the queue!`);
    }
}
