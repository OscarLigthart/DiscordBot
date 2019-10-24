const wiki = require('wikijs').default;
const Discord = require('discord.js');

 
/**
 *  This function searches wikipedia for an article based on a user given Query
 */
exports.search = function (message) {
    
    // get search term
    var query = message.content.split(' ')
    
    // check if the user entered a query
    if (query.length == 1) return message.channel.send('Please give me something to search!')
    
    // complete the query
    query = query.slice(1).join(' ');

    // search the wiki for an article
    wiki()
    .page(query)
    .then(page => {

        // await all searches
        Promise.all([page.summary(), page.mainImage()]).then(function(values) {

            // extract the summary
            let summary = values[0]

            // process it if it is too long
            if (summary.length > 1000){
                summary = summary.substr(0, 1000)
                summary = summary.split('.').slice(0, -1).join('.').concat('.');
            }

            // extract images
            let image = values[1]

            // create the embedding
            const embed = new Discord.RichEmbed()
                .setTitle("Result for: " + query)
                /*
                * Alternatively, use "#00AE86", [0, 174, 134] or an integer number.
                */
                .setColor(0x00AE86)
                .setImage(image)
                /*
                * Takes a Date object, defaults to current date.
                */
                .setTimestamp()
                .setURL(page.raw.fullurl)
                .addField(page.raw.title,
                    summary)
                /*
                * Blank field, useful to create some space.
                */
                .addBlankField(true)
            
            // send the embedding
            message.channel.send({embed})
        });

    }).catch(err => {
        //console.log(err);
        // todo print the page, might be able to refer the user to the right link
        message.channel.send('I could not find an article!')
    });
}



