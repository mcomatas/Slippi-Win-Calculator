const { SlippiGame } = require("@slippi/slippi-js");
const  readlineSync = require('readline-sync');
const fs = require ('fs');

const gameInput = readlineSync.question( 'Please enter the location of your Slippi Replays: ');
const gameFiles = fs.readdirSync( gameInput ).filter(file => file.endsWith('.slp'));

const input = readlineSync.question("Enter your connect code: ");
//console.log( input );

//For easy access of characters, since characters have IDs that are numbers
const characters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Game & Watch', 'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth',
                    'Mewtwo', 'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Shiek', 'Falco',
                    'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf', 'Master Hand', 'Wireframe Male', 'Wireframe Female',
                    'Giga Bowser', 'Crazy Hand', 'Sandbag', 'Popo'];

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

//var totalWins = 0;
//var totalGames = 0;
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
    const gameSeconds = Math.floor( (metadata.lastFrame + 123) / 60 ); //Frame 0 starts with the timer, add the -123 where you can play before. Divide by 60 since 60 FPS
    const settings = game.getSettings();
    //console.log( "hello" );
    //console.log( totalGames );
    //console.log( invalidGames );
    if ( gameSeconds <= 60 || (stats.overall[0].killCount == 0 && stats.overall[1].killCount == 0) || settings.players.length > 2 )
    {
        invalidGames++;
    }
    else
    {
        const settings = game.getSettings();
        if ( settings.players[0].connectCode == input )
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
        var characterIndex = settings.players[opponentIndex].characterId; // Get the character id / index of the opponent

        for ( i = 0; i < stats.stocks.length; i++ )
        {
            if ( stats.stocks[i].deathAnimation == null )
            {
                if ( stats.stocks[i].playerIndex == playerIndex )
                {   
                    winsTable[characterIndex][stageIndex][0]++;
                    //totalWins++;
                    break;
                }
            }
        }
        // console.log( characterIndex );
        // console.log( stageIndex );

        winsTable[characterIndex][stageIndex][1]++;
        //winsTable[characterIndex][stageIndex][1]++;
        //totalGames++;
    }
}

printWins( winsTable );

//HELPER FUNCTIONS:

function printWins( winsTable ) {
    for ( var i = 0; i < winsTable.length; i++ )
    {
        console.log( "--------------------------------------------------------------" );
        console.log( `Against ${characters[i]}: `);
        for ( var j = 0; j < winsTable[i].length; j++ )
        {
            var wins = winsTable[i][j][0];
            var games = winsTable[i][j][1];
            var winPercentange = getWinPercentage( wins, games );
            console.log( `\tOn ${legalStages[j]}: Total Wins: ${wins} | Total Games: ${games} | Win Percentage: ${winPercentange}%` );
        }
    }
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

//Creates a 3D array of all 0's to represent wins, total games per stage per character played against
function createWinsTable() {
    var threeD = new Array(26);
    for ( var i = 0; i < threeD.length; i++ )
    {
        threeD[i] = new Array(7);
        for ( var j = 0; j < threeD[i].length; j++ )
        {
            threeD[i][j] = new Array(2).fill(0);
        }
    }
    return threeD;
}



/* const endTypes = {
    1: "TIME!",
    2: "GAME!",
    7: "No Contest",
}; */