var http = require('http');
var url = require('url');
var fs = require('fs');
var quantile = require( 'compute-quantile' );
const jsdom = require("jsdom");
const { JSDOM } = jsdom;

var express = require('express')
var app = express()

app.use(express.static('.'));

var server = app.listen(8080, function () {

    var host = server.address().address
    var port = server.address().port

    console.log('Express app listening at http://%s:%s', host, port)

})

// **********************************************************
// This portion of the code was used to access the API
// using spotify-web-api-node
// URL: https://github.com/thelinmichael/spotify-web-api-node
// The following lines are copied and pasted from the examples
// provided in the page referenced by the URL above
//var SpotifyWebApi = require('spotify-web-api-node');
// 
// var spotifyApi = new SpotifyWebApi({
//   clientId: [redacted],
//   clientSecret: [redacted],
//   redirectUri: '127.0.0.1'
// });

// var clientId = [redacted],
//   clientSecret = [redacted];
// 
// // Create the api object with the credentials
// var spotifyApi = new SpotifyWebApi({
//   clientId: clientId,
//   clientSecret: clientSecret
// });
// 
// // Retrieve an access token.
// spotifyApi.clientCredentialsGrant().then(
//   function(data) {
//     console.log('The access token expires in ' + data.body['expires_in']);
//     console.log('The access token is ' + data.body['access_token']);
// 
//     // Save the access token so that it's used in future calls
//     spotifyApi.setAccessToken(data.body['access_token']);
//   },
//   function(err) {
//     console.log('Something went wrong when retrieving an access token', err);
//   }
// );

//I manually reset this as needed, based on the console output of the 
// function above, which was copied from the documentation accessible
// at this URL: https://github.com/thelinmichael/spotify-web-api-node
//spotifyApi.setAccessToken([redacted]);
// **********************************************************

// Both arrays below have the same keys so that they
// can easily be associated back together.
const all_song_names = {
'one': 'The New Year (Death Cab for Cutie)',
'two': 'Lightness (Death Cab for Cutie)',
'three': 'Title and Registration (Death Cab for Cutie)',
'four': "Expo '86 (Death Cab for Cutie)",
'five': 'The Sound of Settling (Death Cab for Cutie)',
'six':  'Tiny Vessels (Death Cab for Cutie)',
'seven': 'Transatlanticism (Death Cab for Cutie)',
'eight': 'Passenger Seat (Death Cab for Cutie)',
'nine': 'Death of an Interior Decorator (Death Cab for Cutie)',
'ten': 'We Looked Like Giants (Death Cab for Cutie)',
'eleven': 'A Lack of Color (Death Cab for Cutie)',
'twelve': 'Dirty Computer (feat. Brian Wilson) (Janelle Monae)',
'thirteen': 'Crazy, Classic, Life (Janelle Monae)',
'fourteen': 'Take a Byte (Janelle Monae)',
'fifteen': "Jane's Dream (Janelle Monae)",
'sixteen': 'Screwed (feat. Zoë Kravitz) (Janelle Monae)',
'seventeen': 'Django Jane (Janelle Monae)',
'eighteen': 'Pynk (feat. Grimes) (Janelle Monae)',
'nineteen': 'Make Me Feel (Janelle Monae)',
'twenty': 'I Got the Juice (feat. Pharrell Williams) (Janelle Monae)',
'twentyone': 'I Like That (Janelle Monae)',
'twentytwo': "Don't Judge Me (Janelle Monae)",
'twentythree': "Stevie's Dream (Janelle Monae)",
'twentyfour': 'So Afraid (Janelle Monae)',
'twentyfive': 'Americans (Janelle Monae)',
'twentysix': 'MONTERO (Call Me By Your Name) (Lil Nas X)',
'twentyseven': 'DEAD RIGHT NOW (Lil Nas X)',
'twentyeight': 'INDUSTRY BABY (feat. Jack Harlow) (Lil Nas X)',
'twentynine': 'THATS WHAT I WANT (Lil Nas X)',
'thirty': 'THE ART OF REALIZATION (Lil Nas X)',
'thirtyone': 'SCOOP (feat. Doja Cat) (Lil Nas X)',
'thirtytwo': 'ONE OF ME (feat. Elton John) (Lil Nas X)',
'thirtythree': 'LOST IN THE CITADEL (Lil Nas X)',
'thirtyfour': 'DOLLA SIGN SLIME (feat. Megan Thee Stallion) (Lil Nas X)',
'thirtyfive': 'TALES OF DOMINICA (Lil Nas X)',
'thirtysix': 'SUN GOES DOWN (Lil Nas X)',
'thirtyseven': 'VOID (Lil Nas X)',
'thirtyeight': 'DONT WANT IT (Lil Nas X)',
'thirtynine': 'LIFE AFTER SALEM (Lil Nas X)',
'forty': 'AM I DREAMING (feat. Miley Cyrus) (Lil Nas X)'
}

const all_song_ids = {
'one' :'6Glv3rhKQ5Lo8wBzSC4IGA',
'two':'34ErnTqmuACVJ5qquF1Rsa',
'three':'21DVu4p5UmmdpJf3xyF4zF',
'four':'39QVoC07fYWv10aEpCHI3z',
'five': '05QIEmO71D7GJd7FiKExvK',
'six': '1x3nSB02nQEqE7BPBaOCrv',
'seven': '2O7TUK3o55VOWqsVOZO5oq',
'eight':'0eUm2fcFSfWH7m5ap3xvnE',
'nine': '2k7UNbEG8SWv2WyuzPfi11',
'ten':'3n2P7CstOD74Dvw8M8tQa6',
'eleven': '7s7n9zJc3Fl9ggBcLIYaFm',
'twelve':'7nJZ9LplJ3ZAyhQyJCJk0K',
'thirteen': '06EAtSDu3KSoi4fbA3ZjoB',
'fourteen':'5Fw17rh1qEC6YoT32BijNI',
'fifteen':	'0GJZUWxQrzAOvFzqyxK9ng',
'sixteen': '1Z2MfAx1nJ09NzGjodnvRW',
'seventeen': '56RfNBJGUgL1ZFCB1KEJrQ',
'eighteen':'5OpiyfqaQLdtwHd3SfembH',
'nineteen':'5gW5dSy3vXJxgzma4rQuzH',
'twenty':'5Yfq9uugLFchtFymQQWxgt',
'twentyone': '2EznBGrlmx9wBeYgyDojsA',
'twentytwo': '6UQDIIEPzeduwXlZE86SOF',
'twentythree': '0iC4xzAzu0mmA66HdYy7V9',
'twentyfour': '66jMYG0wj6m6oj8LKvteEn',
'twentyfive': '5KE6acpiakjqiIskbWVfxB',
'twentysix':'1SC5rEoYDGUK4NfG82494W',
'twentyseven':'3grVoZ10bm2jUGpo7BxpuF',
'twentyeight':'5Z9KJZvQzH6PFmb8SNkxuk',
'twentynine':'0e8nrvls4Qqv5Rfa2UhqmO',
'thirty':'1BMu5TWvalAGpi5jlhFEBb',
'thirtyone':'6bpq1jGkVz66Q3LYeoXdjZ',
'thirtytwo': '3JR2RztQcOjUQGQSybxDIO',
'thirtythree': '6th8IdY4lYeM0QlSQJhhkp',
'thirtyfour':'7zQirOExB0VR8yWUOqYeio',
'thirtyfive': '5S4PZ7AuYlYiVIVik3wHUf',
'thirtysix': '6btdl1Vl6Ta5lUwUSOFW2H',
'thirtyseven':'3e6ebtUCZ0tZL1J7wvM8Xi',
'thirtyeight':'4vsJWPwWPS27gRM4oLjBNO',
'thirtynine':'6D3t4w54PgLNGQ48R7th7R',
'forty':'6isTQfKXhNO3EyJd9mSxx8'
};				
				
// vibe is either "chill" or "fun" and has been
// manually assigned for this prototype version

// POP
const montero_song = {
	'song_id': '1SC5rEoYDGUK4NfG82494W',
	'danceability': 0.593,
	'energy': 0.503,
	'tempo': 178.781,
	'valence': 0.71,
	'vibe': 'fun'
};

const ind_baby_song = {
	'song_id': '5Z9KJZvQzH6PFmb8SNkxuk',
	'danceability': 0.741,
	'energy': 0.691,
	'tempo': 150.087,
	'valence':0.892,
	'vibe': 'fun'
};

const want_song = {
	'song_id': '0e8nrvls4Qqv5Rfa2UhqmO',
	'danceability': 0.737,
	'energy': 0.846,
	'tempo': 87.981,
	'valence':0.546,
	'vibe': 'fun'
};

// R&B

const ccc_song = {
	'song_id': '06EAtSDu3KSoi4fbA3ZjoB',
	'danceability': 0.466,
	'energy': 0.706,
	'tempo': 101.009,
	'valence':0.149,
	'vibe': 'chill'
};

const django_song = {
	'song_id':'56RfNBJGUgL1ZFCB1KEJrQ',
	'danceability': 0.833,	
	'energy': 0.624,
	'tempo': 101.96,
	'valence':0.26,
	'vibe': 'chill'
};

const ilt_song = {
	'song_id': '2EznBGrlmx9wBeYgyDojsA',
	'danceability': 0.482,
'energy': 0.453,
'tempo': 134.799,
'valence':0.17,
'vibe':'chill'

};

// Indie Folk

const transa_song = {
	'song_id': '21DVu4p5UmmdpJf3xyF4zF',
	'danceability': 0.752,
	'energy': 0.544,
	'tempo': 115.803,
	'valence':0.723,
	'vibe': 'chill'
};

const ny_song = {
	'song_id': '6Glv3rhKQ5Lo8wBzSC4IGA',
	'danceability': 0.311,
	'energy': 0.742,
'tempo': 123.572,
'valence':0.19,
'vibe': 'chill'
};

const giants_song = {
	'song_id': '3n2P7CstOD74Dvw8M8tQa6',
	'danceability': 0.344,
'energy': 0.776,
'tempo': 87.325,
'valence':0.316,
'vibe': 'chill'
}

		
dance_list = [montero_song['danceability'],
			ind_baby_song['danceability'],
			want_song['danceability'],
			ccc_song['danceability'],
			django_song['danceability'],
			ilt_song['danceability'],
			transa_song['danceability'],
			ny_song['danceability'],
			giants_song['danceability']];

energy_list = [montero_song['energy'],
			ind_baby_song['energy'],
			want_song['energy'],
			ccc_song['energy'],
			django_song['energy'],
			ilt_song['energy'],
			transa_song['energy'],
			ny_song['energy'],
			giants_song['energy']];
			
tempo_list = [montero_song['tempo'],
			ind_baby_song['tempo'],
			want_song['tempo'],
			ccc_song['tempo'],
			django_song['tempo'],
			ilt_song['tempo'],
			transa_song['tempo'],
			ny_song['tempo'],
			giants_song['tempo']];
			
valence_list = [montero_song['valence'],
			ind_baby_song['valence'],
			want_song['valence'],
			ccc_song['valence'],
			django_song['valence'],
			ilt_song['valence'],
			transa_song['valence'],
			ny_song['valence'],
			giants_song['valence']];
	
// Danceability		
var dance_quant_low = quantile(dance_list,0.25);
var dance_quant_med = quantile(dance_list,0.5);
var dance_quant_high = quantile(dance_list,0.75);

// Energy							
var energy_quant_low = quantile(energy_list,0.25);
var energy_quant_med = quantile(energy_list,0.5);
var energy_quant_high = quantile(energy_list,0.75);

// Tempo
var tempo_quant_low = quantile(tempo_list,0.25);
var tempo_quant_med = quantile(tempo_list,0.5);
var tempo_quant_high = quantile(tempo_list,0.75);

// Valence
var valence_quant_low = quantile(valence_list,0.25);
var valence_quant_med = quantile(valence_list,0.5);
var valence_quant_high = quantile(valence_list,0.75);


// *************************************
// POP
// *************************************
//
// Montero
var montero_song_update	= {
'song_id': '1SC5rEoYDGUK4NfG82494W',
'danceability': 0,
'energy': 0,
'tempo': 0,
'valence': 0,
'vibe': 'fun'
};
if(montero_song['danceability'] >= dance_quant_low & montero_song['danceability'] <= dance_quant_med){
	montero_song_update['danceability'] = 'low';
}
else{
	montero_song_update['danceability'] = 'high';
}

if(montero_song['energy'] >= dance_quant_low & montero_song['energy'] <= dance_quant_med){
	montero_song_update['energy'] = 'low';
}
else{
	montero_song_update['energy'] = 'high';
}

if(montero_song['tempo'] >= dance_quant_low & montero_song['tempo'] <= dance_quant_med){
	montero_song_update['tempo'] = 'low';
}
else{
	montero_song_update['tempo'] = 'high';
}
if(montero_song['valence'] >= dance_quant_low & montero_song['valence'] <= dance_quant_med){
	montero_song_update['valence'] = 'low';
}
else{
	montero_song_update['valence'] = 'high';
}

// Industry Baby
var ind_baby_song_update = {
'song_id': '5Z9KJZvQzH6PFmb8SNkxuk',
'danceability': 0,
'energy': 0,
'tempo': 0,
'valence': 0,
'vibe': 'fun'
};
if(ind_baby_song['danceability'] >= dance_quant_low & ind_baby_song['danceability'] <= dance_quant_med){
	ind_baby_song_update['danceability'] = 'low';
}
else{
	ind_baby_song_update['danceability'] = 'high';
}

if(ind_baby_song['energy'] >= dance_quant_low & ind_baby_song['energy'] <= dance_quant_med){
	ind_baby_song_update['energy'] = 'low';
}
else{
	ind_baby_song_update['energy'] = 'high';
}

if(ind_baby_song['tempo'] >= dance_quant_low & ind_baby_song['tempo'] <= dance_quant_med){
	ind_baby_song_update['tempo'] = 'low';
}
else{
	ind_baby_song_update['tempo'] = 'high';
}
if(ind_baby_song['valence'] >= dance_quant_low & ind_baby_song['valence'] <= dance_quant_med){
	ind_baby_song_update['valence'] = 'low';
}
else{
	ind_baby_song_update['valence'] = 'high';
}

// That's What I Want
var want_song_update = {
	'song_id': '0e8nrvls4Qqv5Rfa2UhqmO',
'danceability': 0,
'energy': 0,
'tempo': 0,
'valence': 0,
'vibe': 'fun'
};
if(want_song['danceability'] >= dance_quant_low & want_song['danceability'] <= dance_quant_med){
	want_song_update['danceability'] = 'low';
}
else{
	want_song_update['danceability'] = 'high';
}

if(want_song['energy'] >= dance_quant_low & want_song['energy'] <= dance_quant_med){
	want_song_update['energy'] = 'low';
}
else{
	want_song_update['energy'] = 'high';
}

if(want_song['tempo'] >= dance_quant_low & want_song['tempo'] <= dance_quant_med){
	want_song_update['tempo'] = 'low';
}
else{
	want_song_update['tempo'] = 'high';
}
if(want_song['valence'] >= dance_quant_low & want_song['valence'] <= dance_quant_med){
	want_song_update['valence'] = 'low';
}
else{
	want_song_update['valence'] = 'high';
}

//console.log(montero_song_update);
//console.log(ind_baby_song_update);
//console.log(want_song_update);

// *************************************
// R&B
// *************************************
// Crazy, Classic, Life
var ccc_song_update = {
	'song_id': '06EAtSDu3KSoi4fbA3ZjoB',
'danceability': 0,
'energy': 0,
'tempo': 0,
'valence': 0,
'vibe': 'chill'
};
if(ccc_song['danceability'] >= dance_quant_low & ccc_song['danceability'] <= dance_quant_med){
	ccc_song_update['danceability'] = 'low';
}
else{
	ccc_song_update['danceability'] = 'high';
}

if(ccc_song['energy'] >= dance_quant_low & ccc_song['energy'] <= dance_quant_med){
	ccc_song_update['energy'] = 'low';
}
else{
	ccc_song_update['energy'] = 'high';
}

if(ccc_song['tempo'] >= dance_quant_low & ccc_song['tempo'] <= dance_quant_med){
	ccc_song_update['tempo'] = 'low';
}
else{
	ccc_song_update['tempo'] = 'high';
}
if(ccc_song['valence'] >= dance_quant_low & ccc_song['valence'] <= dance_quant_med){
	ccc_song_update['valence'] = 'low';
}
else{
	ccc_song_update['valence'] = 'high';
}

// Django Jane
var django_song_update = {
	'song_id':'56RfNBJGUgL1ZFCB1KEJrQ',
	'danceability': 0,	
	'energy': 0,
	'tempo': 0,
	'valence':0,
	'vibe': 'chill'
};

if(django_song['danceability'] >= dance_quant_low & django_song['danceability'] <= dance_quant_med){
	django_song_update['danceability'] = 'low';
}
else{
	django_song_update['danceability'] = 'high';
}

if(django_song['energy'] >= dance_quant_low & django_song['energy'] <= dance_quant_med){
	django_song_update['energy'] = 'low';
}
else{
	django_song_update['energy'] = 'high';
}

if(django_song['tempo'] >= dance_quant_low & django_song['tempo'] <= dance_quant_med){
	django_song_update['tempo'] = 'low';
}
else{
	django_song_update['tempo'] = 'high';
}
if(django_song['valence'] >= dance_quant_low & django_song['valence'] <= dance_quant_med){
	django_song_update['valence'] = 'low';
}
else{
	django_song_update['valence'] = 'high';
}

// I Like That
var ilt_song_update = {
	'song_id': '2EznBGrlmx9wBeYgyDojsA',
	'danceability': 0,
'energy': 0,
'tempo': 0,
'valence':0,
'vibe':'chill'
};

if(ilt_song['danceability'] >= dance_quant_low & ilt_song['danceability'] <= dance_quant_med){
	ilt_song_update['danceability'] = 'low';
}
else{
	ilt_song_update['danceability'] = 'high';
}

if(ilt_song['energy'] >= dance_quant_low & ilt_song['energy'] <= dance_quant_med){
	ilt_song_update['energy'] = 'low';
}
else{
	ilt_song_update['energy'] = 'high';
}

if(ilt_song['tempo'] >= dance_quant_low & ilt_song['tempo'] <= dance_quant_med){
	ilt_song_update['tempo'] = 'low';
}
else{
	ilt_song_update['tempo'] = 'high';
}
if(ilt_song['valence'] >= dance_quant_low & ilt_song['valence'] <= dance_quant_med){
	ilt_song_update['valence'] = 'low';
}
else{
	ilt_song_update['valence'] = 'high';
}

// console.log(ccc_song_update);
// console.log(django_song_update);
// console.log(ilt_song_update);

// *************************************
// Indie Folk
// *************************************
// Transatlanticism
var transa_song_update = {
	'song_id': '21DVu4p5UmmdpJf3xyF4zF',
	'danceability': 0,
	'energy': 0,
	'tempo': 0,
	'valence':0,
	'vibe': 'chill'
};

if(transa_song['danceability'] >= dance_quant_low & transa_song['danceability'] <= dance_quant_med){
	transa_song_update['danceability'] = 'low';
}
else{
	transa_song_update['danceability'] = 'high';
}

if(transa_song['energy'] >= dance_quant_low & transa_song['energy'] <= dance_quant_med){
	transa_song_update['energy'] = 'low';
}
else{
	transa_song_update['energy'] = 'high';
}

if(transa_song['tempo'] >= dance_quant_low & transa_song['tempo'] <= dance_quant_med){
	transa_song_update['tempo'] = 'low';
}
else{
	transa_song_update['tempo'] = 'high';
}
if(transa_song['valence'] >= dance_quant_low & transa_song['valence'] <= dance_quant_med){
	transa_song_update['valence'] = 'low';
}
else{
	transa_song_update['valence'] = 'high';
}

// The New Year
var ny_song_update = {
	'song_id': '6Glv3rhKQ5Lo8wBzSC4IGA',
	'danceability': 0,
	'energy': 0,
'tempo': 0,
'valence':0,
'vibe': 'chill'
};

if(ny_song['danceability'] >= dance_quant_low & ny_song['danceability'] <= dance_quant_med){
	ny_song_update['danceability'] = 'low';
}
else{
	ny_song_update['danceability'] = 'high';
}

if(ny_song['energy'] >= dance_quant_low & ny_song['energy'] <= dance_quant_med){
	ny_song_update['energy'] = 'low';
}
else{
	ny_song_update['energy'] = 'high';
}

if(ny_song['tempo'] >= dance_quant_low & ny_song['tempo'] <= dance_quant_med){
	ny_song_update['tempo'] = 'low';
}
else{
	ny_song_update['tempo'] = 'high';
}
if(ny_song['valence'] >= dance_quant_low & ny_song['valence'] <= dance_quant_med){
	ny_song_update['valence'] = 'low';
}
else{
	ny_song_update['valence'] = 'high';
}

var giants_song_update = {
	'song_id': '3n2P7CstOD74Dvw8M8tQa6',
	'danceability': 0,
'energy': 0,
'tempo': 0,
'valence':0,
'vibe': 'chill'
}

if(giants_song['danceability'] >= dance_quant_low & giants_song['danceability'] <= dance_quant_med){
	giants_song_update['danceability'] = 'low';
}
else{
	giants_song_update['danceability'] = 'high';
}

if(giants_song['energy'] >= dance_quant_low & giants_song['energy'] <= dance_quant_med){
	giants_song_update['energy'] = 'low';
}
else{
	giants_song_update['energy'] = 'high';
}

if(giants_song['tempo'] >= dance_quant_low & giants_song['tempo'] <= dance_quant_med){
	giants_song_update['tempo'] = 'low';
}
else{
	giants_song_update['tempo'] = 'high';
}
if(giants_song['valence'] >= dance_quant_low & giants_song['valence'] <= dance_quant_med){
	giants_song_update['valence'] = 'low';
}
else{
	giants_song_update['valence'] = 'high';
}

all_songs = [montero_song_update, ind_baby_song_update,want_song_update,
			ccc_song_update,django_song_update,ilt_song_update,
			transa_song_update,ny_song_update,giants_song_update];
			
//console.log(all_songs);

lively_party = [];
chill_party = [];

// For a lively party, prioritize "fun" vibe, high danceability, high energy, high valence
// For a chill party, prioritize "chill" vibe, low energy, low tempo, low valence
for(i in all_songs){
	//console.log(all_songs[i]);
	//console.log(all_songs[i]['vibe']);
	if(all_songs[i]['vibe']=='fun' & all_songs[i]['danceability']=='high'){
		lively_party.push(all_songs[i]);
		//console.log(all_songs[i]);
		}
	else if(all_songs[i]['vibe']=='fun' & all_songs[i]['energy']=='high'){
		lively_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
	else if(all_songs[i]['vibe']=='fun' & all_songs[i]['tempo']=='high'){
		lively_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
	else if(all_songs[i]['vibe']=='fun' & all_songs[i]['valence']=='high'){
		lively_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
	else if(all_songs[i]['vibe']=='chill' & all_songs[i]['danceability']=='low'){
		chill_party.push(all_songs[i]);
		//console.log(all_songs[i]);
		}
	else if(all_songs[i]['vibe']=='chill' & all_songs[i]['energy']=='low'){
		chill_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
	else if(all_songs[i]['vibe']=='chill' & all_songs[i]['tempo']=='low'){
		chill_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
	else if(all_songs[i]['vibe']=='chill' & all_songs[i]['valence']=='low'){
		chill_party.push(all_songs[i]);
		//console.log(all_songs[i]);
	}
}

//console.log(lively_party);
//console.log(chill_party);

//console.log(Object.values(all_song_ids)[1]);

lively_party_song_list = [];
chill_party_song_list = [];

for(i in all_song_ids){
	for(j in lively_party){
		if(String(all_song_ids[String(i)]) == String(lively_party[j]['song_id'])){
			//console.log(all_song_names[i]);
			lively_party_song_list.push(all_song_names[i]);
		}
	}
}

for(i in all_song_ids){
	for(j in chill_party){
		if(String(all_song_ids[String(i)]) == String(chill_party[j]['song_id'])){
			//console.log(all_song_names[i]);
			chill_party_song_list.push(all_song_names[i]);
		}
	}
}

console.log(lively_party_song_list);
// This returns:
// [
//   'MONTERO (Call Me By Your Name) (Lil Nas X)',
//   'INDUSTRY BABY (feat. Jack Harlow) (Lil Nas X)',
//   'THATS WHAT I WANT (Lil Nas X)'
// ]
console.log(chill_party_song_list);
// This returns:
// [
//   'Title and Registration (Death Cab for Cutie)',
//   'Crazy, Classic, Life (Janelle Monae)',
//   'I Like That (Janelle Monae)'
// ]

/* ******************************************
	THE CODE BELOW WAS EITHER USED TO OBTAIN 
	THE DATA USED ABOVE OR HAS BEEN INCLUDED
	WITH COMMENTARY TO SHOW MY THOUGHT 
	PROCESS.
	IN FUTURE VERSIONS,
	THIS WOULD BE PART OF AN AUTOMATED PROCESS.
	******************************************
*/ 
//
// This array was going to be used to access the Spotify 
// API at an album level to get the album ids.
// The idea was that these album ids would be used
// to gather the song ids, which would in turn be used to 
// obtain the audio analysis properties that go into the
// proposed MixML tags.
// 
// For this prototype, song ids were manually entered into
// the arrays above rather than following this process.
// The dataset was also reduced to three albums for this
// prototype/demo version. The final albums that were included
// are Transatlanticism (indie folk), Dirty Computer (R&B), 
// and Montero (pop).
//
// Album IDs in order:
// Transatlanticism, Giver Taker, Punisher,
// Beyonce, Ctrl, Dirty Computer.
// Montero, Sour
// album_codes = ['2sfLsbSsDm780Llr9NWHQz','5UWRaW0ui40kohTv4PyBEc', '6Pp6qGEywDdofgFC1oFbSH',
// '2UJwKSBUz6rtW4QLK74kQu','76290XdXVF9rPzGdNRWdCh','2PjlaxlMunGOUvcRzlTbtE',
// '6pOiDiuDQqrmo5DbG0ZubR','6s84u2TUpR3wdUv4NgKA2j']
//
// This function was never finished, but the idea was to
// iterate through the album codes to build an array of all
// the song information returned from the API request.
// function chooseAlbumGetSongs(album_code){
//   spotifyApi.getAlbumTracks(album_code).then(
//   function(data) {
//     //console.log('Artist albums', data.body);
//     console.log(data.body)
//       return(data.body);
//   },
//   function(err) {
//     console.error(err);
//     return('NA');
//   }
// );
// }
//
// This function also was never finished, but the idea was to
// iterate through the output from the function above to 
// narrow down the data about the songs.
// The final version of this function would have stored
// all the song IDs and names in two arrays, as has been manually
// done in the main portion of the code in the section above
// with the arrays all_song_names and all_song_ids.
// function buildSongArray(code_list){
// 	const all_songs = [];
// 	for (x in code_list){
// 		all_songs.push(chooseAlbumGetSongs(x));
// 	}
// 	console.log(all_songs);
// 	return(all_songs);
// }
//
// Gathering the song information for each album step by step.
// This was done before the list of albums was narrowed down.
//chooseAlbumGetSongs('2sfLsbSsDm780Llr9NWHQz');
//chooseAlbumGetSongs('5UWRaW0ui40kohTv4PyBEc');
// chooseAlbumGetSongs('6Pp6qGEywDdofgFC1oFbSH');
// chooseAlbumGetSongs('2UJwKSBUz6rtW4QLK74kQu');
// chooseAlbumGetSongs('76290XdXVF9rPzGdNRWdCh');
// chooseAlbumGetSongs('2PjlaxlMunGOUvcRzlTbtE');
// chooseAlbumGetSongs('6pOiDiuDQqrmo5DbG0ZubR');
// chooseAlbumGetSongs('6s84u2TUpR3wdUv4NgKA2j');
//
// This was an attempt at an alternative approach
// to the function buildSongArray()
// for(a in album_codes){
// 	chooseAlbumGetSongs(a)
// }
// 
// Below is the code I used to get the audio analysis features for each song
// I was having trouble writing functions in node, so I was unable to use a 
// function to accomplish this, which is what I would have preferred to
// copying and pasting and wasting space

// Indie Folk choice: Title and Registration
// R&B choice: Crazy Classic Life
// Pop choice: Montero
// 
// Title and Registration
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['three']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 
// Crazy Classic Life
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['thirteen']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 				
// Montero (Call Me By Your Name)		
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['twentysix']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});

// Needed more data
// Indie Folk choice: The New Year
// R&B choice: Django Jane
// Pop choice: Industry Baby
// The New Year
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['one']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 
// // Django Jane
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['seventeen']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 				
// // Industry Baby
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['twentyeight']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 				
// // Indie Folk choice: We Looked Like Giants
// // R&B choice: I Like That
// // Pop choice: That's What I Want
// 
// // We Looked Like Giants
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['ten']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 
// // I Like That
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['twentyone']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 				
// // That's What I Want
// spotifyApi.getAudioFeaturesForTrack(all_song_ids['twentynine']).then(
// 			function(data){
// 				console.log(data.body['id']);
// 				console.log('danceability: ' + data.body['danceability']);
// 				console.log('energy: ' + data.body['energy']);
// 				console.log('tempo: '+ data.body['tempo']);
// 				console.log('valence:' + data.body['valence']);
// 				console.log('**********');
// 				},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				});
// 

// The code below represents some attempts at writing functions rather
// than executing repetitive blocks of code sequentially
// function audioProps(song_id){
// 	spotifyApi.getAudioFeaturesForTrack(song_id).then(
// 		function(data){
// 			//console.log(data.body);
// // 			console.log(data.body['danceability']);
// // 			console.log(data.body['energy']);
// // 			console.log(data.body['tempo']);
// // 			console.log(data.body['valence']);
// 			aud_feats = {
// 			'danceability':data.body['danceability'],
// 			'energy': data.body['energy'],
// 			'tempo': data.body['tempo'],
// 			'valence': data.body['valence']
// 			};
// 			console.log(aud_feats);
// 			return aud_feats;
// // 			console.log(aud_feats = {
// // 			'danceability':data.body['danceability'],
// // 			'energy': data.body['energy'],
// // 			'tempo': data.body['tempo'],
// // 			'valence': data.body['valence']
// // 			});
// 			// return({
// // 			'song_id':data.body['id'],
// // 			'danceability':data.body['danceability'],
// // 			'energy': data.body['energy'],
// // 			'tempo': data.body['tempo'],
// // 			'valence': data.body['valence']
// // 			});
// 		},
// 		function(err){
// 			console.log('Something went wrong!\n', err);
// 			//aud_feats = 'NA';
// 			//return aud_feats;
// 		}
// 	)
// 	//return aud_feats;
// };

//var dance_array = new Array(40); //[];

// function xyz(song_array){
// 	var dance_array = new Array;
// 	for(var i = 0; i < 40; i++){
// // spotifyApi.getAudioFeaturesForTrack(Object.values(all_song_ids)[0]).then(
// // spotifyApi.getAudioFeaturesForTrack(all_song_ids['two']).then(
// 		spotifyApi.getAudioFeaturesForTrack(Object.values(all_song_ids)[i]).then(
// 			function(data){
// 				dance_array.push(data.body['danceability']);
// 				//return dance_array;
// 				},
			//console.log(dance_array);
			//return dance_array;
			//console.log(dance_array);
			//console.log(data.body);
// 			console.log(data.body['danceability']);
// 			console.log(data.body['energy']);
// 			console.log(data.body['tempo']);
// 			console.log(data.body['valence']);
			// aud_feats = {
// 			'danceability':data.body['danceability'],
// 			'energy': data.body['energy'],
// 			'tempo': data.body['tempo'],
// 			'valence': data.body['valence']
// 			};
			//console.log(aud_feats);
			//dance_array[i] = data.body['danceability'];
			//console.log(dance_array[i]);
			//return(dance_array);
			//return aud_feats;
// 			console.log(aud_feats = {
// 			'danceability':data.body['danceability'],
// 			'energy': data.body['energy'],
// 			'tempo': data.body['tempo'],
// 			'valence': data.body['valence']
// 			});
			// return({
// 			'song_id':data.body['id'],
// 			'danceability':data.body['danceability'],
// 			'energy': data.body['energy'],
// 			'tempo': data.body['tempo'],
// 			'valence': data.body['valence']
// 			});
// 		},
// 			function(err){
// 				console.log('Something went wrong!\n', err);
// 				}
// 			aud_feats = 'NA';
// 			return aud_feats;
// 		}
// 	);
// 	}
// 	return dance_array;	
// }


// console.log(xyz(all_song_ids)); //returns an empty array
// var x = xyz(all_song_ids);
// console.log(x); //also an empty array

// spotifyApi.getAudioFeaturesForTrack(Object.values(all_song_ids)[1]).then(
// 		function(data){
// 			dance_array.push(data.body['danceability']);
// 			return(callback(dance_array));
// 		},
// 		function(err){
// 			console.log('Something went wrong!\n', err);
// 		}
// 	);