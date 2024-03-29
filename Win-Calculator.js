/* 
Author: Michael Comatas
Caching Implementation inspired by: https://github.com/BrodyVoth/slippi-cumulative-stats/blob/a53231f0a4968e01fc3662a5b2c44604aff4efb8/slippi-stats.js#L71
*/

const { SlippiGame } = require("@slippi/slippi-js");
const  readlineSync = require('readline-sync');
const fs = require ('fs');
const crypto = require('crypto');
const path = require('path');
const pkgjson = require('./package.json');

//For easy access of characters, since characters have IDs that are numbers
const characters = ['Captain Falcon', 'Donkey Kong', 'Fox', 'Game & Watch', 'Kirby', 'Bowser', 'Link', 'Luigi', 'Mario', 'Marth',
                    'Mewtwo', 'Ness', 'Peach', 'Pikachu', 'Ice Climbers', 'Jigglypuff', 'Samus', 'Yoshi', 'Zelda', 'Sheik', 'Falco',
                    'Young Link', 'Dr. Mario', 'Roy', 'Pichu', 'Ganondorf', 'Master Hand', 'Wireframe Male', 'Wireframe Female',
                    'Giga Bowser', 'Crazy Hand', 'Sandbag', 'Popo'];

const charactersLow = ['captain falcon', 'donkey kong', 'fox', 'game & watch', 'kirby', 'bowser', 'link', 'luigi', 'mario', 'marth',
                        'mewtwo', 'ness', 'peach', 'pikachu', 'ice climbers', 'jigglypuff', 'samus', 'yoshi', 'zelda', 'sheik', 'falco',
                        'young link', 'dr. mario', 'roy', 'pichu', 'ganondorf', 'master hand', 'wireframe male', 'wireframe female',
                        'giga bowser', 'crazy hand', 'sandbag', 'popo'];

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

const version = pkgjson.version;
const cachePath = './replayCache.json';

console.log( `--------------- \x1b[38;2;0;255;255mSlippi Win Calculator\x1b[0m! V${version} ---------------`);
console.log( "-------------------------------------------------------------" );
console.log( "This script will scan the current folder and provide stats taken from all Slippi games in that folder." )
console.log( "You also have the option to write a csv file of the data.")
console.log( "-------------------------------------------------------------" );

const cache = loadCache();

const gameInput = './';
const gameFiles = fs.readdirSync( gameInput ).filter(file => file.endsWith('.slp'));

var input;
if( cache && cache.connectCode )
{
    input = readlineSync.question( `Enter your connect code (leave blank to keep it ${cache.connectCode}): `) || cache.connectCode;
}
else
{
    input = readlineSync.question( 'Enter your connect code: ' );
}

const opponentInput = readlineSync.question( 'Enter the connect code of your opponent (leave blank for all opponent): ' );

const charInput = checkChar( readlineSync.question( 'Enter your character (leave blank for all characters): ') ) || false;
const charID = charactersLow.indexOf( charInput );

const opponentCharInput = checkChar( readlineSync.question( 'Enter your opponents character (leave blank for all characters): ' ) ) || false;
const oppCharID = charactersLow.indexOf( opponentCharInput );

const csvInput = readlineSync.keyInYNStrict( 'Do you want to write a csv file of the data?' );

var winsTable = createWinsTable();

var totalWins = 0;
var totalGames = 0;
var invalidGames = 0;
var playerIndex;
var opponentIndex;

var j = 1;
for ( const file of gameFiles )
{
    const game = getGameData( gameInput + file );
    if ( !game ) { continue; /*return;*/ }
    cache.results[game.hash] = game; //hashs the game, stats, etc to the cache
    getResults( game, winsTable, input, j );
    j++;
}

//Write to the cache
fs.writeFileSync( cachePath, JSON.stringify({
    connectCode: input,
    results: cache.results
}));

printWins( winsTable );

if( csvInput )
{
    writeCSV( winsTable );
}

const totalWinPercentage = getWinPercentage( totalWins, totalGames );

console.log( "-------------------------------------------------------------" );
console.log( `Total Wins: ${totalWins} | Total Games: ${totalGames} | Overall Win Percentage: \x1b[38;2;0;255;255;0m${totalWinPercentage}%\x1b[0m`);
console.log( "-------------------------------------------------------------" );

process.stdin.resume();

//HELPER FUNCTIONS: --------------------------------------------------------------------------------------------------------------------------------

function printWins( winsTable ) {
    for ( var i = 0; i < winsTable.length; i++ )
    {
        console.log( "-------------------------------------------------------------" );
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

//Loads the replay cache
function loadCache() {
    try
    {
        const info = fs.readFileSync( cachePath, 'utf-8' );
        const data = JSON.parse( info );
        if ( !data )
        {
            console.log( 'No replay data was found. All scanned files will be cached for faster scans in the future.' );
            return { results: {} };
        }
        return data;
    }
    catch
    {
        console.log( 'No replay cache was found. Creating replay cache and scanning all files so future runs will finish faster.' );
        return { results: {} };
    }
}

function getGameData( file ) {
    const filename = path.basename( file );
    const hash = crypto.createHash('sha256').update( filename ).digest('hex');
    //Check if it's in the cache already
    if ( cache && cache.results[hash] )
    {
        return cache.results[hash];
    }
    let data = { hash }
    const game = new SlippiGame( file );
    data.settings = game.getSettings();
    data.metadata = game.getMetadata();
    data.stats = game.getStats();

    return data;
}

function getResults( game, winsTable, connectCode, j ) {
    const { settings, metadata, stats } = game;
    try
    {    
        const gameSeconds = Math.floor( ( metadata.lastFrame + 123 ) / 60 );
        if ( gameSeconds <= 45 )
        {
            console.log( `${j}: Game is under 45 seconds. Game is ignored.` );
            return;
        }
        if ( stats.overall[0].killCount == 0 && stats.overall[1].killCount == 0 )
        {
            console.log( `${j}: Both players had 0 kills. Game is ignored.` );
            return;
        }
        if  ( settings.players.length > 2 )
        {
            console.log( `${j}: Is not a singles match. Game is ignored.` );
            return;
        }

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

        if( opponentInput && settings.players[opponentIndex].connectCode != opponentInput )
        {
            console.log( `${j}: Game is not against specified opponent. Game is ignored.` );
            return;
        }

        if( charInput && settings.players[playerIndex].characterId != charID )
        {
            console.log( `${j}: Not playing specificed character. Game is ignored.` );
            return;
        }

        if( opponentCharInput && settings.players[opponentIndex].characterId != oppCharID )
        {
            console.log( `${j}: Opponent is not playing specified character. Game is ignored.` );
            return;
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

        var characterIndex = settings.players[opponentIndex].characterId; // Gets the character id / index of the opponent

        for ( i = 0 ; i < stats.stocks.length; i++ )
        {
            if ( stats.stocks[i].deathAnimation == null )
            {
                if ( stats.stocks[i].playerIndex == playerIndex )
                {
                    console.log( `${j}: ${settings.players[playerIndex].connectCode} (${characters[settings.players[playerIndex].characterId]}) \x1b[38;2;0;255;0mwon\x1b[0m vs ${settings.players[opponentIndex].connectCode} (${characters[settings.players[opponentIndex].characterId]})!` );
                    winsTable[characterIndex][stageIndex][0]++;
                    totalWins++;
                    break;
                }
                else
                {
                    console.log( `${j}: ${settings.players[playerIndex].connectCode} (${characters[settings.players[playerIndex].characterId]}) \x1b[38;2;255;0;0mlost\x1b[0m vs ${settings.players[opponentIndex].connectCode} (${characters[settings.players[opponentIndex].characterId]})` );
                    break;
                }
            }
        }

        winsTable[characterIndex][stageIndex][1]++;
        totalGames++;
    }
    catch( err )
    {
        console.log( `${j}: Error reading Slippi replay. Game is ignored.` );
        return;
    }
}

function checkChar( char )
{
    arg = char.toLowerCase();
    while ( !charactersLow.includes( arg ) && arg )
    {
        console.log( `${arg} is not a valid character.` );
        console.log( `List of valid characters: ${characters.slice(0, 26).join(', ')}` );
        arg = readlineSync.question( 'Please enter a valid character (or leave blank for all characters): ' ).toLowerCase() || false;
    }
    return arg;
}

function writeCSV( winsTable )
{
    let csvContent = "";
    let row = "Opponent-Character,Stage,Wins,Total-Games,Win-Percentage";
    csvContent += row + "\r\n";

    for( let i = 0; i < winsTable.length; i++ )
    {
        for( let j = 0; j < winsTable[i].length; j++ )
        {
            let winP = getWinPercentage( winsTable[i][j][0], winsTable[i][j][1] );
            let row = `${characters[i]},${legalStages[j]},${winsTable[i][j][0]},${winsTable[i][j][1]},${winP}`;
            csvContent += row + "\r\n";
        }
    }
   
    const d = new Date();
    let time = d.getTime();
    let csvFilePath = 'Slippi-Games-CSV-' + time + '.csv';
    fs.writeFileSync( csvFilePath, csvContent );
}