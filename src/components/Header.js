import React from 'react';
import BrandLogo from '../assets/brand.png';

const Header = () => (
	<div className='nav'>
		<img src={BrandLogo} alt='brand' width='150' height='50' />
	</div>
);

export default Header;
