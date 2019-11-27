const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface
({
    input: process.stdin,
    output: process.stdout
});


var typefile_str = fs.readFileSync("typedata", "utf8");
var pokedex = JSON.parse( fs.readFileSync("pokedex.json") ); // yoinked from https://github.com/fanzeyi/pokemon.json

var types_str = typefile_str.slice(0, typefile_str.indexOf('\n'));
var typechart_str = typefile_str.slice(typefile_str.indexOf('\n') + 1);
var types_arr = types_str.split(',');

const colors = 
{
    Reset : "\x1b[0m",
    Bright : "\x1b[1m",
    Dim : "\x1b[2m",
    Underscore : "\x1b[4m",
    Blink : "\x1b[5m",
    Reverse : "\x1b[7m",
    Hidden : "\x1b[8m",

    FgBlack : "\x1b[30m",
    FgRed : "\x1b[31m",
    FgGreen : "\x1b[32m",
    FgYellow : "\x1b[33m",
    FgBlue : "\x1b[34m",
    FgMagenta : "\x1b[35m",
    FgCyan : "\x1b[36m",
    FgWhite : "\x1b[37m",

    BgBlack : "\x1b[40m",
    BgRed : "\x1b[41m",
    BgGreen : "\x1b[42m",
    BgYellow : "\x1b[43m",
    BgBlue : "\x1b[44m",
    BgMagenta : "\x1b[45m",
    BgCyan : "\x1b[46m",
    BgWhite : "\x1b[47m"
}

typechart_arr = new Array(types_arr.length);
for(let i = 0; i < types_arr.length; ++i)
{
    types_arr[i] = types_arr[i];
    typechart_arr[i] = getRowArr(i, typechart_str);
}

var pokemonNames = new Array();
for(let i = 0; i < pokedex.length; ++i)
{
    pokemonNames.push(pokedex[i].name.english);
}

iNeedSynchronousInput();
async function iNeedSynchronousInput()
{
    while(true)
    {
        var modeStr = await askQuestion("\nselect a mode, \"pokemon\" or \"types\"\nmode: ");
        switch(getStrIndex(modeStr, ["pokemon","types"]))
        {
            case 0: // pokemon
                pokeMode();
                break;
            
            case 1: // types
                typeMode();
                break;
            
            default: // invalid mode
                console.log("\"" + modeStr + "\" is an invalid mode");
                break;
        }
    }
}


function askQuestion(question)
{
    return new Promise(resolve => rl.question(question, result => resolve(result)));
}


async function typeMode()
{
    while(true)
    {
        var inputStr = await askQuestion("\ntype(s): ");

        var reqTypes = inputStr.split(' ');

        var effectiveness = getEffectiveness(reqTypes);
        if(effectiveness.err < 0)
        {
            return;
        }
        printEffTypes(effectiveness);
        console.log("");
        printEffDefensive(effectiveness);
        console.log("");
        printEffOffensive(effectiveness);
        console.log("");
    }
}


async function pokeMode()
{
    while(true)
    {
        var inputStr = await askQuestion("\nenter a pokémon's name\nname: ");
        
        console.log("");
        
        pokeIndex = getStrIndex(inputStr, pokemonNames);
        
        switch(pokeIndex)
        {
            case -1:
                console.log("input \"" + inputStr + "\" does not match an existing pokémon name");
                break;
            case -2:
                console.log("input \"" + inputStr + "\" matches multiple pokémon names");
                break;
            default:
                var effectiveness = getEffectiveness(pokedex[pokeIndex].type);
                if(effectiveness.err < 0)
                {
                    return;
                }
                console.log("\n\nPokémon: " + pokedex[pokeIndex].name.english + "\n");
                printEffTypes(effectiveness);
                console.log("");
                printEffDefensive(effectiveness);
                console.log("");
                printEffOffensive(effectiveness);
                console.log("");
                break;
        }
    }
}


function printEffTypes(eff)
{
    var typeStr = "Type:";
    for(let i = 0; i < eff.types.length; ++i)
    {
        typeStr += " " + eff.types[i] + ",";
    }
    console.log(typeStr.slice(0, typeStr.length-1));
}


function printEffDefensive(eff)
{
    console.log(colors.FgCyan, "---------- DEFENSE ----------\n");
    
    var typeStr = "";
    
    var strongStr = "";
    var reallyStrongStr = "";
    var weakStr = "";
    var reallyWeakStr = "";
    
    var immuneStrings = new Array();
    
    for(let i = 0; i < eff.typeIndeces.length; ++i)
    {
        typeStr += types_arr[eff.typeIndeces[i]].toUpperCase() + "/";
    }
    typeStr = typeStr.slice(0, typeStr.length-1);
    strongStr       = typeStr;
    reallyStrongStr = typeStr;
    weakStr         = typeStr;
    reallyWeakStr   = typeStr;
    
    strongStr       += " -    2x weak to: ";
    reallyStrongStr += " -    4x weak to: ";
    weakStr         += " -  0.5x weak to: ";
    reallyWeakStr   += " - 0.25x weak to: ";
    
    for(let i = 0; i < eff.defEffArr.length; ++i)
    {
        switch(eff.defEffArr[i])
        {
            case 2:
                strongStr += " " + types_arr[i] + ",";
                break;
            case 4:
                reallyStrongStr += " " + types_arr[i] + ",";
                break;
            case 0.5:
                weakStr += " " + types_arr[i] + ",";
                break;
            case 0.25:
                reallyWeakStr += " " + types_arr[i] + ",";
                break;
            case 0:
                immuneStrings.push(typeStr + " is immune to " + types_arr[i].toUpperCase());
                break;
        }
    }
    strongStr = strongStr.slice(0, strongStr.length-1);
    reallyStrongStr = reallyStrongStr.slice(0, reallyStrongStr.length-1);
    weakStr = weakStr.slice(0, weakStr.length-1);
    reallyWeakStr = reallyWeakStr.slice(0, reallyWeakStr.length-1);
    
    console.log(strongStr);
    console.log(reallyStrongStr);
    console.log("");
    console.log(weakStr);
    console.log(reallyWeakStr);
    
    if(immuneStrings.length > 0)
    {
        console.log("");
        for(let j = 0; j < immuneStrings.length; ++j)
            console.log(immuneStrings[j]);
    }
    
    console.log("")
}


function printEffOffensive(eff)
{
    console.log(colors.FgRed, "---------- OFFENSE ----------\n");
    var strongStrings = new Array();
    var weakStrings = new Array();
    var immuneStrings = new Array();
    for(let i = 0; i < eff.typeIndeces.length; ++i)
    {
        strongStrings[i] = types_arr[eff.typeIndeces[i]].toUpperCase() + " -   2x strong against: ";
        weakStrings[i]   = types_arr[eff.typeIndeces[i]].toUpperCase() + " - 0.5x strong against: ";
        for(let j = 0; j < typechart_arr.length; ++j)
        {
            switch(parseFloat(typechart_arr[eff.typeIndeces[i]][j]))
            {
                case 2:
                    strongStrings[i] += " " + types_arr[j] + ",";
                    break;
                
                case 0.5:
                    weakStrings[i]   += " " + types_arr[j] + ",";
                    break;
                
                case 0:
                    immuneStrings.push(types_arr[j].toUpperCase() + " is immune to " + types_arr[eff.typeIndeces[i]].toUpperCase());
                    break;
                
                default:
                    break;
            }
        }
        console.log(strongStrings[i].slice(0, strongStrings[i].length-1));
        console.log(  weakStrings[i].slice(0,   weakStrings[i].length-1));
        console.log("");
    }
    if(immuneStrings.length > 0)
    {
        for(let j = 0; j < immuneStrings.length; ++j)
            console.log(immuneStrings[j]);
        console.log("");
    }
}


function getRowArr(rowIndex, str)
{
    var sliceFrom = 0;
    
    for(let i = 0; i < rowIndex; ++i)
    {
        sliceFrom = str.indexOf('\n', sliceFrom) + 1;
    }
    
    var sliceTo = str.indexOf('\n', sliceFrom);
    
    return str.slice(sliceFrom, sliceTo).split(',');
}


function getStrIndex(searchStr, arrOfStrings)
{
    var index = -1;
    var matches = true;
    for(let i = 0; i < arrOfStrings.length; ++i)
    {
        for(let j = 0; j < searchStr.length; ++j)
        {
            if(searchStr[j].toLowerCase() != arrOfStrings[i][j].toLowerCase())
            {
                matches = false;
                break;
            }
        }
        if(matches)
        {
            if(index != -1)
            {
                return -2; // str matches multiple possible strings, error
            }
            index = i;
        }
        matches = true;
    }
    return index;
}


function getEffectiveness(reqTypes) // reqTypes is an array of type strings
{
    var eff = 
    {
        offEffArr: new Array(types_arr.length).fill(1),
        defEffArr: new Array(types_arr.length).fill(1),
        typeIndeces: new Array(),
        types: new Array(),
        err: 0
    };
    
    var typeIndex;
    for(let i = 0; i < reqTypes.length; ++i)
    {
        typeIndex = getStrIndex(reqTypes[i], types_arr);
        if(typeIndex == -1)
        {
            console.log("input \"" + reqTypes[i] + "\" does not match an existing type");
            eff.err = -1;
            break;
        }
        if(typeIndex == -2)
        {
            console.log("input \"" + reqTypes[i] + "\" matches multiple types");
            eff.err = -2;
            break;
        }
        
        eff.types.push(types_arr[typeIndex]);
        eff.typeIndeces.push(typeIndex);
        
        for(let j = 0; j < types_arr.length; ++j)
        {
            eff.offEffArr[j] *= typechart_arr[ typeIndex ][ j ];
            eff.defEffArr[j] *= typechart_arr[ j ][ typeIndex ];
        }
    }
    
    return eff;
}









