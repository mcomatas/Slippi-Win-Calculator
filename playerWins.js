const { SlippiGame } = require("@slippi/slippi-js");
const  readlineSync = require('readline-sync');
const fs = require ('fs');

const gameInput = readlineSync.question( 'Please enter the location of your Slippi Replays: ');
const gameFiles = fs.readdirSync( gameInput ).filter(file => file.endsWith('.slp'));

const connectCode = readlineSync.question( 'Please enter your connect code: ' ).toUpperCase();
// connectCode = connectCode.toUpperCase();

const opponentCode = readlineSync.question( 'Please enter the connect code of your opponent: ' ).toUpperCase();
// opponentCode = opponentCode.toUpperCase();

//Have access to stages
const stages = [null, null, 'Fountain of Dreams', 'Pokemon Stadium', 'Peachs Castle', 'Kongo Jungle', 'Brinstar', 'Corneria', 'Yoshis Story',
                'Onett', 'Mute City', 'Rainbow Cruise', 'Jungle Japes', 'Great Bay', 'Hyrule Temple', 'Brinstar Depths', 'Yoshis Island', 
                'Green Greens', 'Fourside', 'Mushroom Kingdom', 'Mushroom Kingdom 2', 'Venom', 'Poke Floats', 'Big Blue', 'Icicle Mountain',
                'Icetop', 'Flat Zone', 'Dreamland', 'Yoshis Island N64', 'Kongo Jungle N64', 'Battlefield', 'Final Destination', 'Target Test Mario',
                'Target Test Captain Falcon', 'Target Test Young Link', 'Target Test Donkey Kong', 'Target Test Dr. Mario', 'Target Test Falco',
                'Target Test Fox', 'Target Test Ice Climbers', 'Target Test Kirby', 'Target Test Bowser', 'Target Test Link', 'Target Test Luigi', 
                'Target Test Marth', 'Target Test Mewtwo', 'Target Test Ness', 'Target Test Peach', 'Target Test Pichu', 'Target Test Pikachu', 
                'Target Test Jigglypuff', 'Target Test Samus', 'Target Test Sheik', 'Target Test Yoshi', 'Target Test Zelda', 'Target Test Game & Watch',
                'Target Test Roy', 'Target Test Ganondorf', 'Home Run Contest'];

//Acess to legal stages for wins table
const legalStages = ['Fountain of Dreams', 'Pokemon Stadium', 'Yoshis Story', 'Dreamland', 'BattleField', 'Final Destination', 'Other Stages'];

var winsTable = createWinsTable();

// console.log( winsTable );

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

        var stageIndex;
        switch( settings.stageId )
        {
            case 2: //Fountain of Dreams
                stageIndex = 0;
                break;
            case 3: //Pokemon Stadium
                stageIndex = 1;
                break;
            case 8: //Yoshis Story
                stageIndex = 2;
                break;
            case 28: //Dreamland
                stageIndex = 3;
                break;
            case 31: //Battlefield
                stageIndex = 4;
                break;
            case 32: //Final Destination
                stageIndex = 5;
                break;
            default: //Other
                stageIndex = 6;
        }

        for ( i = 0; i < stats.stocks.length; i++ )
        {
            if ( stats.stocks[i].deathAnimation == null )
            {
                if ( stats.stocks[i].playerIndex == playerIndex )
                {
                    winsTable[stageIndex][0]++;
                    totalWins++;
                    break;
                }
            }
        }
        
        winsTable[stageIndex][1]++;
        totalGames++;
    }
}

printWins( winsTable );

const totalWinPercentage = getWinPercentage( totalWins, totalGames );

console.log( `\nTotal Wins: ${totalWins} | Total Games: ${totalGames} | Overall Win Percentage: ${totalWinPercentage}%`);
console.log( "--------------------------------------------------------------" );

/*console.log(`Total Games: ${totalGames}`);
console.log(`Invalid Games: ${invalidGames}`);
console.log(`Total Wins: ${totalWins}`);

console.log(`Win percentage: ${winPercentange}%`);*/

// ----------------------------------------------------------------------------------
// HELPER FUNCTIONS

function createWinsTable() {
    var twoD = new Array(7);
    for ( var i = 0; i < twoD.length; i++ )
    {
        twoD[i] = new Array(2).fill(0);
    }
    return twoD;
}

function getWinPercentage( wins, totalGames ) {
    if ( totalGames === 0 )
    {
        return 0;
    }
    else
    {
        const winPercentange = ( ( wins / totalGames ) * 100 ).toFixed(2);
        return winPercentange;
    }
}

function printWins( winsTable )
{
    for ( var i = 0; i < winsTable.length; i++ )
    {
        var wins = winsTable[i][0];
        var games = winsTable[i][1];;
        var winPercentange = getWinPercentage( wins, games );
        console.log( `On ${legalStages[i]}: Total Wins: ${wins} | Total Games: ${games} | Win Percentage: ${winPercentange}%`);
    }
}

