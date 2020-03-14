import React, { useState } from 'react';
import { BrowserRouter as Router, Link } from 'react-router-dom';
import CoronaSettings from '../settings/settings';
import { MdSettings } from 'react-icons/md';
import './s_nav.css';

const Nav = () => {
	const [openSettingsModal, setOpenSettingsModal] = useState(false);

	return (
	<nav>
		<div>
			<Link to='/'>Home</Link>
			<Link style={{ marginLeft: '10px' }} to='/train'>Train</Link>
		</div>

		<div>
			<MdSettings className='icon' size={20} onClick={() => setOpenSettingsModal(true)} />
		</div>

		{openSettingsModal && <CoronaSettings close={() => setOpenSettingsModal(false)} />}
	</nav>
)};

export default Nav;
