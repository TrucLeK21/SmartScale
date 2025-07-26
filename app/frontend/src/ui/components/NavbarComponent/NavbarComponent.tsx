import Navbar from 'react-bootstrap/Navbar';
import bkLogo from '../../../assets/bkLogo.svg';
import './NavbarComponent.css'
import { useNavigate } from 'react-router-dom';


function NavbarComponent() {
  const navigate = useNavigate();

  return (
      <Navbar expand="lg" className="navBar py-0">
        <Navbar.Brand onClick={() => navigate('/')} className="navBrand" style={{ cursor: 'pointer' }}>
          <div className="brandLeft">
            <img src={bkLogo} className="logo react" alt="React logo" />
            <span className="appName">BK Health Station</span>
          </div>
        </Navbar.Brand>
      </Navbar>
  );
}


export default NavbarComponent;