/**
 * [8][16]
 */
import { bar_8 } from './getNotes.js';
var sequence = bar_8;

var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player = new WebAudioFontPlayer();

var output = audioContext.destination;
var guitar = _tone_0280_LesPaul_sf2_file;
player.loader.decodeAfterLoading(audioContext, guitar);

var gainGuitar = audioContext.createGain();
gainGuitar.connect(audioContext.destination);
gainGuitar.gain.value=0.5;

//TIMING PARAMETERS
const bpm = 120; //Beats per Minute
const N = 4 * 60 / bpm; //Seconds per measure
const pieceLen = 8 * N; //4-Bar musical phase
const beatLen= 1/16 * N; //Duration of one 16th-Note in second

/*
for(let n = 0; n < bar_8.length; n++){
    var beat = bar_8[n];
    for (var i = 0; i < beat.length; i++) {
        console.log(beat);
        console.log(beat[i]);
        //CHECKS IF THE BEAT IT IS A CHORD OR NOT
        if(Array.isArray(beat[i])){
            console.log(true);
            player.queueChord(
                audioContext,
                audioContext.destination, 
                _tone_0280_LesPaul_sf2_file, 
                n * beatLen, 
                beat[i], 
                1
            );
        }
        else{
            player.queueWaveTable(
                audioContext,
                audioContext.destination, 
                _tone_0280_LesPaul_sf2_file, 
                n * beatLen, 
                beat[i], 
                1
            );
        }
    }
}
*/
document.querySelector('#play').onclick = () => {
    console.clear();
    for(let b = 0; b < sequence.length; b++){ //PER BAR
        for(let s = 0; s < sequence[b].length; s++){ //PER STEP
            if(!sequence[b][s] !== NaN){
                if(Array.isArray(sequence[b][s])){
                    console.log(sequence[b][s]);
                    //player.queueChord(audioContext, output, guitar, now, pitches(fretsAm), 1.5));
                    player.queueChord(
                        audioContext, 
                        output,
                        guitar,
                        b * 0.45,
                        sequence[b][s],
                        1.0
                    );
                }else{
                    console.log(sequence[b][s]);
                    player.queueWaveTable(
                        audioContext, 
                        output,
                        guitar,
                        b * 0.45,
                        sequence[0][0], //Pitch
                        1.0 //Volume
                    );
                }   
            }
        }
    }
};