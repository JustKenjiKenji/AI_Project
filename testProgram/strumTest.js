// Initialize the player and load the instrument
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player = new WebAudioFontPlayer();

var output = audioContext.destination;
var guitar = _tone_0280_LesPaul_sf2_file;
player.loader.decodeAfterLoading(audioContext, guitar);



// Define your strum pattern with timings and velocities
var C = 0, Cs = 1, 
    D = 2, Ds = 3, 
    E = 4, 
    F = 5, Fs = 6, 
    G = 7, Gs = 8, 
    A = 9, As = 10, 
    B = 11;

var O = 12;
var _6th = E + O*3, 
    _5th = A + O*3,
    _4th = D + O*4, 
    _3rd = G + O*4, 
    _2nd = B + O*4, 
    _1st = E + O*5;

var fretsAm = [-1, 0, 2, 2, 1, 0];
var fretsC =  [-1, 3, 2, 0, 1, 0];
var fretsE =  [ 0, 2, 2, 1, 0, 0];
var fretsG =  [ 3, 2, 0, 0, 0, 3];
var fretsDm = [-1,-1, 0, 2, 3, 1];
var fretsA7 = [-1,-1, 2, 2, 2, 3];

player.loader.decodeAfterLoading(audioContext, guitar);


function pitches(frets) {
	var p = [];
	if (frets[0] > -1) p.push(_6th + frets[0]);
	if (frets[1] > -1) p.push(_5th + frets[1]);
	if (frets[2] > -1) p.push(_4th + frets[2]);
	if (frets[3] > -1) p.push(_3rd + frets[3]);
	if (frets[4] > -1) p.push(_2nd + frets[4]);
    if (frets[5] > -1) p.push(_1st + frets[5]);
    console.log(p);
	return p;
}

const pattern = [
  { time: 0, type: 'down', notes: pitches(fretsAm) },
  { time: 0.25, type: 'up', notes: pitches(fretsAm) },
  { time: 0.50, type: 'down', notes: pitches(fretsAm) },
  { time: 0.75, type: 'up', notes: pitches(fretsAm) },
  { time: 1, type: 'down', notes: pitches(fretsA7) },
  { time: 1.25, type: 'up', notes: pitches(fretsA7) }
];

var now = 0;
/*
player.queueStrumDown(audioContext, output, guitar, now, pitches(fretsAm), 1.5)
*/
// Play the pattern
function playSequence() {
  var time = now;
  pattern.forEach(event => {
    if (event.type === 'down') {
      player.queueStrumDown(audioContext, output, guitar, time, event.notes, 0.7 );
    } else if (event.type === 'up') {
      player.queueStrumUp(audioContext, output, guitar, time, event.notes, 0.6 );
    }
    time += 0.29;
  });
}

// Call playSequence() at the desired time to start the sequence
const button = document.getElementById("playStrum");
button.onclick = function(){
    playSequence();
    console.log("Hello button");
}