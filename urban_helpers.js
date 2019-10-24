const ud = require('urban-dictionary');
const Discord = require('discord.js');


exports.search = function(message) {

    // get search term
    var query = message.content.split(' ')

    // check if the user entered a query
    if (query.length == 1) return message.channel.send('Please give me something to search!')
    
    // complete the query
    query = query.slice(1).join(' ');

    // Callback example.
    ud.term(query, (error, entries, tags, sounds) => {
        if (error) {
            console.error(error.message)
            message.channel.send("I could not find anything.")
        } else {
            
            // extract information regarding the query
            let definition = entries[0].definition; 
            let example = entries[0].example;

            // check for ranges
            if (definition.length > 250) {definition = definition.substr(0, 250)}

            if (example.length > 500) {example = example.substr(0, 500)}
            
            // create the embedding
            const embed = new Discord.RichEmbed()
                .setTitle(entries[0].word)

                /*
                * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
                */
                .setColor(0x00AE86)
                /*
                * Takes a Date object, defaults to current date.
                */
                .setTimestamp()
                .addField(definition,
                        example)
            
            // send the embedding
            message.channel.send({embed})
        }
    })

}
