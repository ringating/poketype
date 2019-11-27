const fs = require("fs");
const readline = require("readline");
const rl = readline.createInterface
({
    input: process.stdin,
    output: process.stdout
});


var typefile_str = fs.readFileSync("typedata", "utf8");
var pokedex = JSON.parse( fs.readFileSync("pokedex.json") );

var types_str = typefile_str.slice(0, typefile_str.indexOf('\n'));
var typechart_str = typefile_str.slice(typefile_str.indexOf('\n') + 1);
var types_arr = types_str.split(',');

typechart_arr = new Array(types_arr.length);
for(let i = 0; i < types_arr.length; ++i)
{
    types_arr[i] = types_arr[i];
    typechart_arr[i] = getRowArr(i, typechart_str);
}

console.log("\nselect a mode, \"pokemon\" or \"types\"");
rl.question("mode: ", (modeStr)=>
{
    //TODO, see this for nested questions: https://nodejs.org/en/knowledge/command-line/how-to-prompt-for-command-line-input/
    
    rl.close();
});

rl.question("\ntype(s): ", (inputStr)=>
{    
    var reqTypes = inputStr.split(' ');
    
    var effectiveness = getEffectiveness(reqTypes);
    
    if(effectiveness.err < 0){ rl.close(); return; }
    
    console.log(effectiveness.offEffArr);
    console.log(effectiveness.defEffArr);
    
    rl.close();
});







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
        for(let j = 0; j < types_arr.length; ++j)
        {
            eff.offEffArr[j] *= typechart_arr[ typeIndex ][ j ];
            eff.defEffArr[j] *= typechart_arr[ j ][ typeIndex ];
        }
    }
    
    return eff;
}









