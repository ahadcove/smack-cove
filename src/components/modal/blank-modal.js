import React from 'react';
import './s_modal.css';

const CoronaModal = ({ children, size = { width: '70%', height: '70%' }, singleButtom = true, ctaText = 'Save', save, cancelText = 'Cancel', cancel }) => {
	return (
		<div className='modal-contain'>
			<div className='underlay' />
			<div className='overlay' style={{ width: size.width, height: size.height }}>
				<div className='overlay-content' style={{ textAlign: 'left', width: '100%' }}>
					{children}
				</div>
				<div className='modal-button-cntain'>
					{!singleButtom && (
						<div className='btn' onClick={cancel}>
							{cancelText}
						</div>
					)}
					<div className='btn btn-cta' onClick={save}>
						{ctaText}
					</div>
				</div>
			</div>
		</div>
	);
};

export default CoronaModal;
