import React, { useEffect, useState } from 'react';
import * as ml5 from 'ml5';
import { Interval, Clear } from 'bettertimers';
import * as Mousetrap from 'mousetrap';
import { friendlyNumber } from '../../utils/utils';
import { CoronaModal, CoronaConfirmModal } from '../../components/modal';
import './s_train.css';
import { apiStop } from '../../utils/api';

const LABELS = {
	notTouching: 'not_touching',
	touching: 'touching',
};

let testingInterval;

const Run = ({ bindShortcut, unbindAllShortcuts }) => {
	const [ready, setReady] = useState(false);
	const [firstOpen, setFirstOpen] = useState(true);
	const [saveModalOpen, setSaveModalOpen] = useState(false)
	const [resetModalOpen, setResetModalOpen] = useState(false)
	const [touchCount, setTouchCount] = useState(0);
	const [notTouchCount, setNotTouchCount] = useState(0);
	const [status, setStatus] = useState(null);
	const [testing, setTesting] = useState(false);
	const [training, setTraining] = useState(false);
	const [trained, setTrained] = useState(false);
	const [result, setResult] = useState();
	const [classifier, setClassifier] = useState();

	useEffect(() => {
		apiStop();
		
		return () => {
			apiStop();
			Clear(testingInterval);
		}
	}, []);

	useEffect(() => {
		Mousetrap.bind('right', () => saveImage(LABELS.touching));
		Mousetrap.bind('left', () => saveImage(LABELS.notTouching));

		return () => {
			Mousetrap.reset();
		};
	}, [ready, touchCount, notTouchCount]);

	// Browser may not allow video to play until user interacts with app
	const start = () => {
		setup();
	};

	const setup = async () => {
		// Grab elements, create settings, etc.
		const video = document.getElementById('video');

		// Create a webcam capture
		navigator.mediaDevices.getUserMedia({ video: true }).then((stream) => {
			video.srcObject = stream;
			video.play();
		});

		const featureExtractor = await ml5.featureExtractor('MobileNet');
		const classifier = await featureExtractor.classification(video, { numLabels: 2 });

		try {
			await classifier.loadLocal('indexeddb://model');
			// await classifier.load('./');
			setFirstOpen(false);
			console.log('Model loaded from storage');
		} catch (err) {
			// TODO: get model from url if there isn't one saved
			console.warn('No model exists');
		}


		setClassifier(classifier);
		setReady(true);
		console.log('Ready');
	};

	const saveImage = (label) => {
		if (ready) {
			console.log('saveImage: ', label);

			if (label === LABELS.touching) {
				setTouchCount(touchCount + 1);
			} else {
				setNotTouchCount(notTouchCount + 1);
			}

			// When no image is passed, the video is used
			classifier.addImage(label);
		}
	};

	const train = async () => {
		if (ready) {
			setTraining(true);
			// Retrain the network, may need to be a callback
			await classifier.train((lossValue) => {
				setTrained(false);
				setStatus(`Training - Loss is ${friendlyNumber(lossValue)}`);
				console.log('Loss is', lossValue);
			});

			setTraining(false);
			setTrained(true);
			setStatus('Ready to test');
			console.log('Done Training');
		}
	};

	const testModel = () => {
		console.log('testModel');
		setTesting(true);

		Clear(testingInterval);
		testingInterval = new Interval(() => {
			// Get a prediction for that image
			classifier.classify((err, result) => {
				if (err) {
					console.error('err: ', err);
				}

				setResult(result[0]);
				console.log('Result', result);
			});
		}, 300);
	};

	const stopTesting = () => {
		Clear(testingInterval);
		setTesting(false);
	};
	
	const reset = () => {
		console.log('Resetting model');
		indexedDB.deleteDatabase("tensorflowjs");
		setResetModalOpen(false);
		window.location.reload();
	}

	const save = async(upload = false) => {
		if (upload) {
			console.log('Updload');
		} else {
			console.log('Model Saved');
		}

		// classifier.saveLocal(() => {
		classifier.saveLocal(() => {
			console.log('Model Saved');
			setSaveModalOpen(false);
		}, 'indexeddb://model');

		await classifier.save();
		setSaveModalOpen(false);
	}

	return (
		<div>
			<h1 className='title'>Train your model</h1>
			<div className='status-contain'>{status}</div>
			{!ready && (
				<div className='btn btn-cta' onClick={start}>
					Start Training
				</div>
			)}

			<div className='count-contain' style={{ marginTop: '10px' }}>
				{result && `Result: ${result.label} ${friendlyNumber(result.confidence)}%`}
			</div>
			<div>
				<video id='video' width='640' height='480' autoPlay></video>
			</div>

			{ready && (
				<>
					<div className='count-contain'>
						Touching: {touchCount} - Not Touching: {notTouchCount}
					</div>
					<div>
						{!testing && (
							<>
								<div className='btn' onClick={() => saveImage(LABELS.notTouching)}>
									Not Touching
								</div>
								<div className='btn' onClick={() => saveImage(LABELS.touching)}>
									Touching
								</div>
							</>
						)}
					</div>
					<div>
						{!testing ? (
							<>
								{!!touchCount && !!notTouchCount && !training && (
									<div className='btn' onClick={train}>
										Train
									</div>
								)}
								{trained && (
									<div className='btn' onClick={testModel}>
										Test
									</div>
								)}
							</>
						) : (
							<div className='btn' onClick={stopTesting}>
								Stop
							</div>
						)}
					</div>

					<div style={{ marginTop: '20px' }}>
						{!testing && trained && (
							<div className='btn btn-cta' onClick={() => setSaveModalOpen(true)}>
								Save
							</div>
						)}
					</div>

					<div className='reset-btn'>
						<div className='btn btn-error' onClick={() => setResetModalOpen(true)}>Reset</div>
					</div>
				</>
			)}

			{/* MODALS */}

			{ready && firstOpen && (
				<CoronaModal size={{ width: '80%', height: '80%' }} ctaText='Start My Mission' save={() => setFirstOpen(false)}>
					<div className='center column training-modal-contain'>
						<h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Welcome to the training area of what just may save the world!</h1>
						<p style={{ fontWeight: 600, marginBottom: '50px' }}>
							⦿ To be fully equipped let's make sure that CoronaBot has everything it needs to help you in this battle
							<br />
							<br />
							⦿ You'll want to gather images of you <b>touching</b> and <b>not touching</b> your face
							<br />
							<br />
							⦿ You can collect the data easily by pressing/holding <b>Right</b> for Touching or <b>Left</b> for not touching
							<br />
							<br />
							⦿ After you're done collecting your first batch of ammo you can press <b>Train</b> to load CoronaBot with your images 
							<br />
							<br />
							⦿ Then you'll be able to <b>Test</b> to make sure it's working as it needs to
							<br />
							<br />
							⦿ Last but not least press Save and then head back to the Home page to initiate CoronaBot
							<br />
							<br />
							<br />
							Choose your images wisely, THIS IS A LIFE OR DEATH SITUATION!
						</p>
					</div>
				</CoronaModal>
			)}
			{saveModalOpen && (
				<CoronaConfirmModal
					title='Share'
					message='Do you want to upload your new trained model to improve the CoronaBot? This is only json text not your actual images'
					proceed={() => save(true)}
					cancel={() => save(false)}
				/>
			)}

			{resetModalOpen && (
				<CoronaConfirmModal
					title='Reset'
					message='Are you sure you want to reset your Model? This process is irreversible and will give a higher chance of corona getting to you!'
					proceed={() => reset(true)}
					cancel={() => setResetModalOpen(false)}
				/>
			)}
		</div>
	);
};

export default Run;
