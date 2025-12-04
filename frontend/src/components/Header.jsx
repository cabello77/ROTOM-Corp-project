import { Link } from "react-router-dom";
import './Header.css';

function Header({ buttons = [] }) {
  return (
    <header className="app-header">
      <div className="app-header-content">
        <div className="app-header-nav">
          <Link to="/" className="app-logo" style={{ fontFamily: "Dancing Script, cursive", fontSize: "96px"}}>
            Plotline
          </Link>
          <div className="app-nav-buttons">
            {buttons.map((button, index) => (
              <Link
                key={index}
                to={button.path}
                className="app-nav-button"
              >
                {button.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;

