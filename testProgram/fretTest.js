var guitar = _tone_0280_LesPaul_sf2_file;

var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var output = audioContext.destination;
var player = new WebAudioFontPlayer();

var now = 0;
var C = 0, Cs = 1, 
    D = 2, Ds = 3, 
    E = 4, 
    F = 5, Fs = 6, 
    G = 7, Gs = 8, 
    A = 9, As = 10, 
    B = 11;

var O = 12;
var _6th = E + O*2, 
    _5th = A + O*2,
    _4th = D + O*3, 
    _3rd = G + O*3, 
    _2nd = B + O*3, 
    _1st = E + O*4;
			
var fretsAm = [-1, 0, 2, 2, 1, 0];
var fretsC =  [-1, 3, 2, 0, 1, 0];
var fretsE =  [ 0, 2, 2, 1, 0, 0];
var fretsG =  [ 3, 2, 0, 0, 0, 3];
var fretsDm = [-1,-1, 0, 2, 3, 1];
var fretsA7 = [-1,-1, 2, 2, 2, 3];
var fretsCsus2 = [-1, 3,-1,-1, 1,-1];

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

function cancel(){
	player.cancelQueue(audioContext);
}

//Strings would be really useful to play solos
const buttonPlayedStrings = document.getElementById("playedStrings");
buttonPlayedStrings.onclick = function(){
    player.queueWaveTable(audioContext, output, guitar, now, _6th, 1.5);
    player.queueWaveTable(audioContext, output, guitar, now+4, _5th, 1.6);
    player.queueWaveTable(audioContext, output, guitar, now+8, _4th, 1.7);
    player.queueWaveTable(audioContext, output, guitar, now+12, _3rd, 1.8);
    player.queueWaveTable(audioContext, output, guitar, now+16, _2nd, 1.9);
    player.queueWaveTable(audioContext, output, guitar, now+20, _1st, 2.0);
}

const buttonPlayA = document.getElementById("playA");
buttonPlayA.onclick = function(){
    player.queueChord(
        audioContext, output, guitar, now, pitches(fretsA7), 1
    );
}