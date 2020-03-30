import React from 'react';
import { FaYoutube, FaGithub, FaTwitter } from 'react-icons/fa';
import './s_footer.css';

const Footer = () => {
	return (
	<footer>
		<FaYoutube className='icon' size={20} onClick={() => window.open('https://www.youtube.com/watch?v=HZTN56UPgkM', '_blank')} />
		<FaTwitter className='icon' size={20} onClick={() => window.open('https://twitter.com/ahadcove', '_blank')} />
		<FaGithub className='icon' size={20} onClick={() => window.open('https://github.com/AhadCove/smack-cove', '_blank')} />
	</footer>
)};

export default Footer;
