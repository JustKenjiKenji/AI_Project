var selectedPreset=_tone_0280_LesPaul_sf2_file;
//Creation of WebAudioFontPlayer
var AudioContextFunc = window.AudioContext || window.webkitAudioContext;
var audioContext = new AudioContextFunc();
var player = new WebAudioFontPlayer();


player.adjustPreset(audioContext,selectedPreset);


function startWaveTableNow(pitch) {
	player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime, pitch, 0.4);
	player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime, 69, 0.4);	
	player.queueWaveTable(audioContext, audioContext.destination, selectedPreset, audioContext.currentTime, 50, 0.4);	

}
		
const button = document.getElementById("buttonPlay");
const num = document.getElementById("num");
button.onclick = function(){
    if(num.value != null){
        let usedPitch = num.value;
        startWaveTableNow(usedPitch);
    }
};