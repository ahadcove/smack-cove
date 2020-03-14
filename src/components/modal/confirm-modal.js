import React from 'react';
import './s_modal.css';

const CoronaConfirmModal = ({ children, size = { width: '30%', height: '22%' }, title, message, singleButtom = false, ctaText = 'Yes', proceed, cancelText = 'No', cancel }) => {
	return (
		<div className='modal-contain'>
			<div className='underlay' />
			<div className='overlay' style={{ width: size.width, height: size.height }}>
				<div className='overlay-content' style={{ textAlign: 'left', width: '100%' }}>
					<h1 style={{ marginBottom: '20px' }}>{title}</h1>
					<div>{message}</div>
				</div>
				<div className='modal-button-cntain'>
					{!singleButtom && (
						<div className='btn' onClick={cancel}>
							{cancelText}
						</div>
					)}
					<div className='btn btn-cta' onClick={proceed}>
						{ctaText}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoronaConfirmModal;
