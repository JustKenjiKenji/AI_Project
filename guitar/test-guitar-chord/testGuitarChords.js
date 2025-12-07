var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player = new WebAudioFontPlayer();
			

var bpm = 120;
var N = 4 * 60 / bpm;
var pieceLen = 4 * N;
var beatLen=1/8 * N;
			
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
var fretsCsus2 = [-1, 3,-1,-1, 1,-1];

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

var started = false;
var startTime = 0;
//Drums
player.loader.decodeAfterLoading(audioContext, '_drum_36_6_JCLive_sf2_file'); //drum
player.loader.decodeAfterLoading(audioContext, '_drum_38_6_JCLive_sf2_file'); //snare
player.loader.decodeAfterLoading(audioContext, '_drum_42_6_JCLive_sf2_file'); //hihat

player.loader.decodeAfterLoading(audioContext, '_tone_0320_Chaos_sf2_file'); //Bass
player.loader.decodeAfterLoading(audioContext, '_tone_0300_Chaos_sf2_file'); //Guitar
			
var currentGuitar=_tone_0300_Chaos_sf2_file;		
var currentSnare=_drum_38_6_JCLive_sf2_file;		
var currentSnarePitch=38;

/**Instrument functions*/
function guitar(pitch, duration){
    if(pitch.isArray())
        return {preset:currentGuitar,pitch:pitch,duration:duration*N,volume:0.25};
    else
        return {preset:currentGuitar,pitch:12*4+pitch,duration:duration*N,volume:0.25}
    }

function bass(pitch, duration){
    return {preset:_tone_0320_Chaos_sf2_file,pitch:12*2+pitch,duration:duration*N,volume:0.4};
}

function drum(){return {preset:_drum_36_6_JCLive_sf2_file,pitch:36,duration:1,volume:0.3};}
			
function snare(){return {preset:currentSnare,pitch:currentSnarePitch,duration:1,volume:0.85};}
			
function hihat(){return {preset:_drum_42_6_JCLive_sf2_file,pitch:42,duration:1,volume:0.25};}

function beats(notes) {
	for (var n = 0; n < notes.length; n++) {
		var beat = notes[n];
		for (var i = 0; i < beat.length; i++) {
			if (beat[i].pitch.isArray()) {
				player.queueChord(
                    audioContext, 
                    output, 
                    guitar, 
                    startTime + n * beatLen, 
                    beat[i].pitch,
                    beat[i].duration
                );
            }else{
                player.queueWaveTable(
                    audioContext, 
                    audioContext.destination, 
                    beat[i].preset, 
                    startTime + n * beatLen , 
                    beat[i].pitch, 
                    beat[i].duration, 
                    beat[i].volume
                );
            }
		}
	}
}

function nextPiece() {
	beats([
////////////////////////////////////////////////////////////////////////////////////				
 [guitar(fretsA7,1/8),guitar(G,1/8),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),		drum(),				hihat()]
,[guitar(F,1/8),guitar(As,1/8),		bass(G,1/8),				snare(),	hihat()]
,[									bass(G,1/8),							hihat()]
,[guitar(G,1/4),guitar(C,1/4),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),							hihat()]
,[guitar(G,1/16),					bass(G,1/8),				snare(),	hihat()]
,[guitar(D,1/8),guitar(G,1/8),		bass(G,1/8),							hihat()]
,[									bass(G,1/8),		drum(),				hihat()]
,[guitar(F,1/8),guitar(As,1/8),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),				snare(),	hihat()]
,[guitar(Gs,1/8),guitar(Cs,1/8),	bass(G,1/8),							hihat()]
,[guitar(G,1/4),guitar(C,1/4),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),							hihat()]
,[guitar(G,1/16),					bass(G,1/8),				snare(),	hihat()]
,[									bass(G,1/8),							hihat()]
,[guitar(D,1/8),guitar(G,1/8),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),		drum(),				hihat()]
,[guitar(F,1/8),guitar(As,1/8),		bass(G,1/8),				snare(),	hihat()]
,[									bass(G,1/8),							hihat()]
,[guitar(G,1/8),guitar(C,1/8),		bass(C,1/8),		drum(),				hihat()]
,[									bass(C,1/8),							hihat()]
,[guitar(G,1/16),					bass(C,1/8),				snare(),	hihat()]
,[guitar(F,1/8),guitar(As,1/8),		bass(As,1/4),							hihat()]
,[														drum(),				hihat()]
,[guitar(D,5/8),guitar(G,5/8),		bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),				snare(),	hihat()]
,[									bass(G,1/8),							hihat()]
,[									bass(G,1/8),		drum(),				hihat()]
,[									bass(G,1/8),				snare(),	hihat()]
,[guitar(G,1/16),					bass(F,1/8),				snare(),	hihat()]
,[									bass(Fs,1/8),				snare(),	hihat()]
////////////////////////////////////////////////////////////////////////////////////
	]);
}