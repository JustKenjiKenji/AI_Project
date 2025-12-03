var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player = new WebAudioFontPlayer();

var ticker = new WebAudioFontTicker();
var queue=[];
			
player.loader.decodeAfterLoading(audioContext, '_drum_36_6_JCLive_sf2_file');
player.loader.decodeAfterLoading(audioContext, '_drum_40_6_JCLive_sf2_file');
player.loader.decodeAfterLoading(audioContext, '_drum_42_6_JCLive_sf2_file');
player.loader.decodeAfterLoading(audioContext, '_drum_46_6_JCLive_sf2_file');

var gainDrums = audioContext.createGain();
gainDrums.connect(audioContext.destination);
gainDrums.gain.value=0.5;
			
const bpm = 130; //Beats per Minute
const N = 4 * 60 / bpm; //Seconds per measure
const pieceLen = 8 * N; //4-Bar musical phase
const beatLen=1/16 * N; //Duration of one 16th-Note in second

function drum(){
    return {gain:gainDrums,preset:_drum_36_6_JCLive_sf2_file,pitch:36,duration:1};
}
			
function snare(){
    return {gain:gainDrums,preset:_drum_40_6_JCLive_sf2_file,pitch:38,duration:1};
}
			
function hihat(){
    return {gain:gainDrums,preset:_drum_42_6_JCLive_sf2_file,pitch:42,duration:1};
}

function pause(){
	ticker.cancel();
}

function start() {
	ticker.playLoop(player, audioContext, 0, ticker.lastPosition, pieceLen, queue);
}

var notes=[
 [hihat(),drum(),		]//1/16
,[hihat()               ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]//16/16
,[hihat()               ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]//32/16
,[hihat()               ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]//48/16
,[hihat()               ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),       ]
,[hihat(),              ]
,[open(),               ]
,[                      ]
,[hihat(),drum(),snare()]
,[hihat(),              ]
,[open(),               ]
,[                      ]
];

for(var n=0;n<notes.length;n++){
	var beat = notes[n];
	for (var i = 0; i < beat.length; i++) {
		if (beat[i]) {
			queue.push({
				destination: beat[i].gain
				, preset: beat[i].preset
				, when: n * beatLen
				, pitch:beat[i].pitch
				, duration:beat[i].duration
				, volume: 0.75
				, slides: []
			});
		}
	}
}