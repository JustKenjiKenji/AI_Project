const data_getItOn = require('./midi_json/getItOn.json');

console.log(data_getItOn.tracks.length);
//console.log(data); // 'data' is now a JavaScript object
console.log(getAmountNotes(data_getItOn, "acoustic guitar (steel)"));
console.log(chordPerTime(data_getItOn, "acoustic guitar (steel)"));
console.log(chordPerFraction(data_getItOn, "acoustic guitar (steel)"));

function getAmountNotes(jsonOBJ, instrument){
    var arrNotes = new Map();
    for(var i = 0; i < 32; i++){
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
    for(var i = 0; i < 32; i++){
        if(jsonOBJ.tracks[i].instrument.name == instrument){
            for(var j = 0; j < 32; j++){
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

function chordPerFraction(jsonOBJ, instrument){
    const PPQ = jsonOBJ.header.ppq;
    var arrDuration = new Map();
    for(var i = 0; i < jsonOBJ.tracks.length; i++){
        if(jsonOBJ.tracks[i].instrument.name == instrument){
            for(var j = 0; j < 32; j++){
                //console.log(data.tracks[i].notes[j].name);
                let beatDuration = jsonOBJ.tracks[i].notes[j].durationTicks / PPQ;
                let noteName = jsonOBJ.tracks[i].notes[j].name;
                let fractDuration = quantizeDur(beatDuration);

                if(arrDuration.has(noteName)){
                    let durations = arrDuration.get(noteName);
                    durations.push(fractDuration);
                    arrDuration.set(noteName, durations);
                }else{
                    arrDuration.set(noteName, [fractDuration]);
                }
                
                
            }
            break;
        }
    }
    
    return arrDuration;
}

function quantizeDur(d) {
    if (d < 0.20) return "1/8";
    if (d < 0.40) return "1/4";
    if (d < 0.75) return "1/2";
    return "1";
}
