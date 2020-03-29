import React, { useEffect } from 'react';
import { CoronaModal } from '../modal';
import usePersistedState from '../../utils/persist-state';
import './s_settings.css';
import { apiTrigger, apiStop, API_TYPES } from '../../utils/api';

const CoronaSettings = ({ close }) => {
	useEffect(() => {
		apiStop();
		
		return () => {
			apiStop();
		}
	}, []);

	const [apiOn, setApiOn] = usePersistedState('apiOn', false);
	// const [apiType, setApiType] = usePersistedState('apiType', API_TYPES.SOUND);
	const [apiType, setApiType] = usePersistedState('apiType', API_TYPES.API);
	const [apiValue, setApiValue] = usePersistedState('apiValue', null);
	// const [minConfidence, setMinConfidence] = usePersistedState('minConfidence', 70);
	
	let audioRef;

	const changeType = (type) => {
		setApiType(type);
		setApiValue(null);
	}

	const done = () => {
		apiStop();
		close();
	}

	const selectedAudio = (e) => {
		const audioFile = e.target.files[0];

		const audioUrl = URL.createObjectURL(audioFile);
		
		console.log('selectedAudio: ', audioUrl);
		if (audioUrl) {
			setApiValue({ name: audioFile.name, url: audioUrl, volume: 100 });
		}
	}

	const test = async () => {
		apiTrigger();
	}

	return (
				<CoronaModal size={{ width: '80%', height: '80%' }} singleButtom ctaText='Done' save={done}>
					<div className='settings center column training-modal-contain'>
						<div className='test-btn'>
							<div className='btn' onClick={test}>Test</div>
						</div>
						<h1 style={{ marginBottom: '30px', textAlign: 'center' }}>Settings</h1>
						<div style={{ width: '100%', fontWeight: 600, marginBottom: '50px' }}>
							<div className='settings-section'>
								<div className={`btn ${apiOn && 'btn-cta'}`} onClick={() => setApiOn(!apiOn)}>API {apiOn ? 'On' : 'Off'}</div>
							</div>

							{apiOn && (
								<>
									<div className='settings-section'>
										<h3 className='sub-title'>Choose an Api Type</h3>
										<div className='center row' style={{ marginBottom: '20px' }} >
											<div className='switch-btn' style={{ marginRight: '20px' }} ison={(apiType === API_TYPES.SOUND).toString()} onClick={() => changeType(API_TYPES.SOUND)}>Sound</div>
											<div className='switch-btn' ison={(apiType === API_TYPES.API).toString()} onClick={() => changeType(API_TYPES.API)}>API</div>
										</div>
									</div>
									
									<div className='settings-section'>
										<h3 className='sub-title'>{apiType === API_TYPES.API ? 'Enter' : 'Select'} a Value</h3>
										{apiType === API_TYPES.API 
											? <input style={{ width: '60%' }} name='api-value' type='text' maxLength='1000' value={apiValue} onChange={(e) => setApiValue(e.target.value)} placeholder='http://localhost:8200/corona?class=touched' />
											: <>
													<div>{apiValue && apiValue.name && apiValue.name}</div>
													<div>
														<input style={{ visibility: 'hidden', width: 0, height: 0 }} ref={(ref) => audioRef = ref} type='file' accept='audio/*' onChange={selectedAudio} />
													</div>
													<div className='btn btn-cta' onClick={() => audioRef.click()}>Choose Audio</div>
													{/* <input type="file" name="api-value" accept="audio/*"></input> */}
												</>
										}
									</div>
								</>
							)}

						</div>
					</div>
				</CoronaModal>
)};

export default CoronaSettings;
