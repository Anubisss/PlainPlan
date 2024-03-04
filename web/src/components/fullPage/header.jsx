import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { CalcAvatarUrl } from '../../utils/gravatar'

import './header.css'
import logo from '../../images/logo.png'

const Header = ({ account }) => (
  <header className="header-nav">
    <div className="main-container">
      <div className="logo-container">
        <Link to="/"><img src={ logo } alt="Logo" className="logo" /></Link>
      </div>
      <div className="menu-container">
        <ul>
          <li><Link to="/teams">Teams</Link></li>
          <li><Link to="/">Projects</Link></li>
        </ul>
      </div>
      <div className="profile-container">
        <Link to="/settings/profile">
          <img src={ CalcAvatarUrl(account.email) } alt="Avatar" className="avatar" />
          { account.name }
        </Link>
      </div>
      <div className="logout-container">
        <Link to="/log-out">Log out</Link>
      </div>
    </div>
  </header>
)

Header.propTypes = {
  account: PropTypes.shape({
    email: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
  }).isRequired,
}

export default Header
