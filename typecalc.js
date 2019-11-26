var fs = require("fs");


var typefile_filename = "typedata";
var typefile_str = fs.readFileSync(typefile_filename, "utf8");

var types_str = typefile_str.slice(0, typefile_str.indexOf('\n'));
var typechart_str = typefile_str.slice(typefile_str.indexOf('\n') + 1);
var types_arr = types_str.split(',');

typechart_arr = new Array(types_arr.length);
for(let i = 0; i < types_arr.length; ++i)
{
    types_arr[i] = types_arr[i].toLowerCase();
    typechart_arr[i] = getRowArr(i, typechart_str);
}

// console.log(types_arr);
// console.log(getTypeIndex("fir", types_arr));
// console.log(getTypeIndex("gra", types_arr));

var offTypeStr = "gra";
var defTypeStr = "fir";

var offIndex = getTypeIndex(offTypeStr, types_arr);
var defIndex = getTypeIndex(defTypeStr, types_arr);

console.log("\n" + offTypeStr + " attacking " + defTypeStr + " -> " + typechart_arr[offIndex][defIndex] + "x effective");











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


function getTypeIndex(typeStr, typesArr)
{
    var index = -1;
    var matches = true;
    for(let i = 0; i < typesArr.length; ++i)
    {
        for(let j = 0; j < typeStr.length; ++j)
        {
            if(typeStr[j] != typesArr[i][j])
            {
                matches = false;
                break;
            }
        }
        if(matches)
        {
            if(index != -1)
            {
                return -2; // typeStr matches multiple types, error
            }
            index = i;
        }
        matches = true;
    }
    return index;
}














