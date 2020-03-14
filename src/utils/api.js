import axios from 'axios';

export const API_TYPES = {
	SOUND: 'sound',
	API: 'api',
};

let audioPlayer;

export const apiTrigger = async () => {
	const apiOn = localStorage.getItem('apiOn');
	const apiType = localStorage.getItem('apiType');
	const apiValue = JSON.parse(localStorage.getItem('apiValue'));
	console.log('apiOn: ', apiOn);
	console.log('apiType: ', apiType);
	console.log('apiValue: ', apiValue);

	if (apiOn) {
		console.log('Triggering api: ', apiType, apiValue);
		if (apiType === API_TYPES.API) {
			await axios(apiValue);
		} else {
			apiStop();

			audioPlayer = new Audio(apiValue.url);
			audioPlayer.play();
		}
	}
}

export const apiStop = () => {
	if (audioPlayer) {
		audioPlayer.pause();
		audioPlayer = null;
	}
}
