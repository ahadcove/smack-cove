import React, { useEffect, useState } from 'react';
import * as ml5 from 'ml5-cove';
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
		const video = document.getElementById('video');

		// Create a webcam capture
		navigator.mediaDevices.getUserMedia({ video: true }).then(async (stream) => {
			video.srcObject = stream;
			video.play();

			// Initialize the Image Classifier method with MobileNet
			let classifier;
			if (localStorage.getItem("ml5Specs") === null) {
				classifier = await ml5.imageClassifier(`${process.env.REACT_APP_ROOT_URL}/model.json`, video);
			} else {
				try {
					classifier = await ml5.imageClassifier('indexeddb://model', video);
				} catch (err) {
					// TODO: get model from url if there isn't one saved
					console.error('No model exists');
					classifier = await ml5.imageClassifier(`${process.env.REACT_APP_ROOT_URL}/model.json`, video);
				}
			}

			new Timeout(() => {
				recurseVideo(classifier);
			}, 1000);
		});
	};

	const recurseVideo = (classifier) => {
		Clear(recurseInterval);
		
		recurseInterval = new Interval(async () => {
			try {
				const results = await classifier.classify();
				checkPrediction(results[0]);
				setPredictions(results);
			} catch (err) {
				console.error('Classify err: ', err);
			}
		}, 200);
	};

	const checkPrediction = (result) => {
		if (result.label === 'touching' && ((minConfidence || 70) >= result.confidence)) {
			apiTrigger();
		}
	};

	return (
		<div onClick={start}>
			<h1 className='title'>Smacker Cove</h1>
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
