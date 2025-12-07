const { fract } = require('three/src/nodes/TSL.js');
const data_getItOn = require('./getItOn.json');
const data_tieYourMother = require('./tieYourMother.json');

console.log(data_getItOn.tracks.length);
//console.log(data); // 'data' is now a JavaScript object
console.log(getAmountNotes(data_getItOn, "electric bass (finger)"));
console.log(chordPerTime(data_getItOn, "electric bass (finger)"));

console.log("\nTIE YOUR MOTHER DOWN:");
console.log(getAmountNotes(data_tieYourMother, "distortion guitar"));
console.log(chordPerTime(data_tieYourMother, "distortion guitar"));

function getAmountNotes(jsonOBJ, instrument){
    var arrNotes = new Map();
    for(var i = 0; i < jsonOBJ.tracks.length; i++){
        if(jsonOBJ.tracks[i].instrument.name == instrument){
            for(var j = 0; j < jsonOBJ.tracks[i].notes.length; j++){
                //console.log(data.tracks[i].notes[j].name);
                var noteName = jsonOBJ.tracks[i].notes[j].name;
                if(arrNotes.has(noteName)){
                    let count = arrNotes.get(noteName);
                    arrNotes.set(noteName, ++count);
                }else{
                    arrNotes.set(noteName, 1);
                }
            }
            break;
        }
    }
    return arrNotes;
}

//To know how chords are stick to each other
function chordPerTime(jsonOBJ, instrument){
    var arrChords = new Map();
    for(var i = 0; i < jsonOBJ.tracks.length; i++){
        if(jsonOBJ.tracks[i].instrument.name == instrument){
            for(var j = 0; j < jsonOBJ.tracks[i].notes.length; j++){
                //console.log(data.tracks[i].notes[j].name);
                let time = "TIME: "+jsonOBJ.tracks[i].notes[j].time;
                let noteName = jsonOBJ.tracks[i].notes[j].name;
                if(arrChords.has(time)){
                    let chordsInside = arrChords.get(time);
                    chordsInside.push(noteName);
                    arrChords.set(time, chordsInside);
                }else{
                    arrChords.set(time, [noteName]);
                }
            }
            break;
        }
    }
    return arrChords;
}


