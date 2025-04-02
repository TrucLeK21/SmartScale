import Navbar from 'react-bootstrap/Navbar';
import bkLogo from '../../assets/bkLogo.svg'
import './NavbarComponent.css'

function NavbarComponent() {
  return (
    <Navbar expand="lg" className="navBar py-0">
        <Navbar.Brand href="#home" className='navBrand m-0 py-0'>
          <img src={bkLogo} className="logo react" alt="React logo" />
          <span className='appName'>BK Health Station</span>
        </Navbar.Brand>
    </Navbar>
  );
}


export default NavbarComponent;