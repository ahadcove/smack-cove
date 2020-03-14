import React, { useEffect, useState } from 'react';
import * as ml5 from 'ml5';
import { Interval, Clear, Timeout } from 'bettertimers';
import { friendlyNumber } from '../../utils/utils';
import { apiTrigger, apiStop } from '../../utils/api';
import usePersistedState from '../../utils/persist-state';
import './s_run.css';

let recurseInterval;

const Run = () => {
	useEffect(() => {
		apiStop();

		return () => {
			apiStop();
			Clear(recurseInterval);
		};
	}, []);

	const [minConfidence] = usePersistedState('minConfidence', 70);

	const [started, setStarted] = useState(false);
	const [predictions, setPredictions] = useState([]);

	// Browser may not allow video to play until user interacts with app
	const start = () => {
		setStarted(true);
		setup();
	};

	const setup = async () => {
		// Grab elements, create settings, etc.
		const video = document.getElementById('video');

		// Create a webcam capture
		navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
			video.srcObject = stream;
			video.play();

			// Initialize the Image Classifier method with MobileNet
			// const classifier = await ml5.imageClassifier('MobileNet', video);
			// const classifier = await ml5.imageClassifier('indexeddb://model', video);
			console.log('process.env.PUBLIC_URL: ', process.env.PUBLIC_URL);
			const classifier = await ml5.imageClassifier(process.env.PUBLIC_URL + '/model.json', video);
			
			// const featureExtractor = await ml5.featureExtractor('MobileNet');
			// // const classifier = await featureExtractor.classification(video, { numLabels: 2 });
			// const classifier = await featureExtractor.classification(video);

			try {
				// await classifier.loadLocal('indexeddb://model');
				// classifier.load('./model.json', () => {
				// 	console.log('Model loaded from storage');
					
				// });
			} catch (err) {
				console.warn('No model exists');
			}

			new Timeout(() => {
				recurseVideo(classifier);
			}, 3000);
		});
	};

	const recurseVideo = (classifier) => {
		Clear(recurseInterval);
		recurseInterval = new Interval(async () => {
			try {
				// // Put the image to classify inside a variable
				// const image = document.getElementById('image');

				// Make a prediction with a selected image
				// classifier.classify(image, 5, function(err, results) {
				const results = await classifier.classify();
				console.log('results: ', results);
				// Set the predictions in the state

				checkPrediction(results[0]);
				setPredictions(results);
			} catch (err) {
				console.log('Classify err: ', err);
			}
		}, 1000);
	};

	const checkPrediction = (result) => {
		if (result.label === 'touching' && minConfidence >= result.confidence) {
			apiTrigger();
		}
	};

	return (
		<div onClick={start}>
			<h1 className='title'>Corona Bot</h1>
			{!started && <div>Click anywhere to Start</div>}
			<video id='video' width='640' height='480' autoPlay></video>
			{predictions.length > 0 && (
				<div className='prediction-contain'>
					{predictions[0].label}
					<div>{friendlyNumber(predictions[0].confidence)}%</div>
				</div>
			)}
		</div>
	);
};

export default Run;
