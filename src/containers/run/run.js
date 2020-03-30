import React, { useEffect, useState } from 'react';
import * as ml5 from 'ml5-cove';
import { Interval, Clear, Timeout } from 'bettertimers';
import { friendlyNumber } from '../../utils/utils';
import { apiTrigger, apiStop } from '../../utils/api';
import { CoronaModal } from '../../components/modal';
import usePersistedState from '../../utils/persist-state';
import './s_run.css';

let recurseInterval;
const Run = () => {
	const [minConfidence] = usePersistedState('minConfidence', 70);
	const [firstOpen, setFirstOpen] = useState(false);
	const [started, setStarted] = useState(false);
	const [predictions, setPredictions] = useState([]);

	useEffect(() => {
		apiStop();

		if (localStorage.getItem("ml5Specs") === null) {
			setFirstOpen(true);
		}

		return () => {
			apiStop();
			Clear(recurseInterval);
		};
	}, []);


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
			{!started && <div>Click anywhere to Start<br/>Make sure your camera is attached</div>}
			<video id='video' width='640' height='480' autoPlay></video>
			{predictions.length > 0 && (
				<div className='prediction-contain'>
					{predictions[0].label}
					<div>{friendlyNumber(predictions[0].confidence)}%</div>
				</div>
			)}

			{firstOpen && (
				<CoronaModal size={{ width: '80%', height: '80%' }} ctaText='Start Smacking' save={() => setFirstOpen(false)}>
					<div className='center column training-modal-contain'>
						<h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Welcome to Smack Cove!</h1>
						<p style={{ textAlign: 'center', fontWeight: 600, marginBottom: '50px' }}>
							To be fully equipped let's make sure that SmackerCove has everything it needs to help you in this battle
							<br />
							<br />
							It's important that you head to the Training tab in the nav bar before running the Face Touching AI, this is so it's trained on you and your environment
							<br />
							<br />
							A camera is also needed to run Smack Cove
							<br />
							<br />
							If the camera isn't turning on make sure your browser isn't blocking it from being used in the search bar
							<br />
							<br />
							Checkout the <a className='link' href='https://www.youtube.com/watch?v=HZTN56UPgkM' target='_blank'><b>Youtube Video</b></a> to learn how Smack Cove was made and why
							<br />
							<br />
							<iframe width="560" height="315" src="https://www.youtube.com/embed/HZTN56UPgkM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
							<br />
							<br />
							Have fun and feel free to share what you make with <a className='link' href='https://twitter.com/ahadcove' target='_blank'><b>@ahadcove</b></a> on twitter :)
						</p>
					</div>
				</CoronaModal>
			)}
		</div>
	);
};

export default Run;
