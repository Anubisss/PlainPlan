import React from 'react'
import { Link } from 'react-router-dom'

import './footer.css'
import logo from '../../images/logo.png'

const Footer = () => (
  <footer className="footer">
    <div className="main-container">
      <div className="copyright-container">
        &copy; { (new Date()).getFullYear() } PlainPlan
      </div>
      <div className="terms-privacy-help-container">
        <ul>
          <li><Link to="/">Terms</Link></li>
          <li><Link to="/">Privacy</Link></li>
          <li><Link to="/">Help</Link></li>
        </ul>
      </div>
      <div className="logo-container">
        <Link to="/"><img src={ logo } alt="Logo" className="logo" /></Link>
      </div>
      <div className="about-container">
        <ul>
          <li><Link to="/">Contact</Link></li>
          <li><Link to="/">About</Link></li>
        </ul>
      </div>
      <div className="logout-container">
        <Link to="/log-out">Log out</Link>
      </div>
    </div>
  </footer>
)

export default Footer
