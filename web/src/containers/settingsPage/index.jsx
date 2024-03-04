import React from 'react'
import PropTypes from 'prop-types'
import { NavLink, Switch, Route, Redirect } from 'react-router-dom'

import ProfilePage from './profilePage'
import PasswordPage from './passwordPage'

import './index.css'

const SettingsPage = ({ onAccountNameChange }) => (
  <div className="page-settings">
    <nav className="navigation-container">
      <h3 className="menu-title">Settings</h3>
      <div className="menu">
        <NavLink to="/settings/profile" className="menu-item" activeClassName="active" exact>Profile</NavLink>
        <NavLink to="/settings/password" className="menu-item" activeClassName="active" exact>Password</NavLink>
      </div>
    </nav>
    <div className="children-container">
      <Switch>
        <Route exact path="/settings/profile" render={ props => <ProfilePage { ...props } onAccountNameChange={ onAccountNameChange } /> } />
        <Route exact path="/settings/password" component={ PasswordPage } />
        <Redirect to="/settings/profile" />
      </Switch>
    </div>
  </div>
)

SettingsPage.propTypes = {
  onAccountNameChange: PropTypes.func.isRequired,
}

export default SettingsPage
