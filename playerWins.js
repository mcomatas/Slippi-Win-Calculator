const { SlippiGame } = require("@slippi/slippi-js");
const  readlineSync = require('readline-sync');
const fs = require ('fs');

const gameInput = readlineSync.question( 'Please enter the location of your Slippi Replays: ');
const gameFiles = fs.readdirSync( gameInput ).filter(file => file.endsWith('.slp'));

const connectCode = readlineSync.question( 'Please enter your connect code: ' ).toUpperCase();
// connectCode = connectCode.toUpperCase();

const opponentCode = readlineSync.question( 'Please enter the connect code of your opponent: ' ).toUpperCase();
// opponentCode = opponentCode.toUpperCase();

var totalWins = 0;
var totalGames = 0;
var invalidGames = 0;
var playerIndex;
var opponentIndex;

console.log( "Please wait for calculations to process, it may take awhile..." );
console.log( "--------------------------------------------------------------" );

for ( const file of gameFiles ) 
{
    const game = new SlippiGame( gameInput + file );

    const metadata = game.getMetadata();
    const stats = game.getStats();
    const gameSeconds = Math.floor( (metadata.lastFrame + 123) / 60 );
    const settings = game.getSettings();

    if ( gameSeconds <= 60 || (stats.overall[0].killCount == 0 && stats.overall[1].killCount == 0) || settings.players.length > 2 || ( ( settings.players[0].connectCode != connectCode && settings.players[1].connectCode != connectCode ) || ( settings.players[0].connectCode != opponentCode && settings.players[1].connectCode != opponentCode ) ) )
    {
        invalidGames++;
    }
    else
    {
        if ( settings.players[0].connectCode == connectCode )
        {
            playerIndex = 0;
            opponentIndex = 1;
        }
        else
        {
            playerIndex = 1;
            opponentIndex = 0;
        }

        for ( i = 0; i < stats.stocks.length; i++ )
        {
            if ( stats.stocks[i].deathAnimation == null )
            {
                if ( stats.stocks[i].playerIndex == playerIndex )
                {
                    totalWins++;
                    break;
                }
            }
        }
        
        totalGames++;
    }
}

const winPercentange = ((totalWins / totalGames) * 100).toFixed(2);

console.log(`Total Games: ${totalGames}`);
console.log(`Invalid Games: ${invalidGames}`);
console.log(`Total Wins: ${totalWins}`);

console.log(`Win percentage: ${winPercentange}%`);

