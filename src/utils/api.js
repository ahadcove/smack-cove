import axios from 'axios';

export const API_TYPES = {
	SOUND: 'sound',
	API: 'api',
};

let audioPlayer;

export const apiTrigger = async () => {
	const apiOn = localStorage.getItem('apiOn');
	const apiType = localStorage.getItem('apiType');
	const apiValue = localStorage.getItem('apiValue');

	if (apiOn) {
		if (apiType === API_TYPES.API) {
			await axios(apiValue);
		} else {
			apiStop();

			audioPlayer = new Audio(JSON.parse(apiValue).url);
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
