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

pitches(fretsCsus2);
pitches(fretsAm);