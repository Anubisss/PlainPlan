import React, { Fragment, Component } from 'react'
import { BrowserRouter, Switch, Route, Redirect, withRouter } from 'react-router-dom'
import PropTypes from 'prop-types'

import {
  RootPage, TeamsPage, SettingsPage, LogOutPage,
  LogInPage, RegisterPage, FinishRegistrationPage, ForgotPasswordPage, ChangePasswordPage,
} from './containers'
import { Header, PageContainer, Footer } from './components/fullPage'

const LoggedInRoutes = ({ account, onLoggedOut, onAccountNameChange }) => (
  <Fragment>
    <Header account={ account } />
    <PageContainer>
      <Switch>
        <Route exact path="/" component={ RootPage } />
        <Route path="/teams" component={ TeamsPage } />
        <Route path="/settings" render={ props => <SettingsPage { ...props } onAccountNameChange={ onAccountNameChange } /> } />
        <Route exact path="/log-out" render={ props => <LogOutPage { ...props } onLoggedOut={ onLoggedOut } /> } />
        <Redirect to="/" />
      </Switch>
    </PageContainer>
    <Footer />
  </Fragment>
)

LoggedInRoutes.propTypes = {
  account: PropTypes.object.isRequired,
  onLoggedOut: PropTypes.func.isRequired,
  onAccountNameChange: PropTypes.func.isRequired,
}

const LoggedOutRoutes = ({ onLoggedIn }) => (
  <Switch>
    <Route exact path="/log-in" render={ props => <LogInPage { ...props } onLoggedIn={ onLoggedIn } /> } />
    <Route exact path="/register" component={ RegisterPage } />
    <Route exact path="/finish-registration/:uuid" component={ FinishRegistrationPage } />
    <Route exact path="/forgot-password" component={ ForgotPasswordPage } />
    <Route exact path="/change-password/:uuid" component={ ChangePasswordPage } />
    <Redirect to="/log-in" />
  </Switch>
)

LoggedOutRoutes.propTypes = {
  onLoggedIn: PropTypes.func.isRequired,
}

class ScrollToTopComponent extends Component {
  componentDidUpdate(prevProps) {
    if (this.props.location !== prevProps.location) {
      window.scrollTo(0, 0)
    }
  }
  render() {
    return this.props.children
  }
}

const ScrollToTop = withRouter(ScrollToTopComponent)

const Router = ({ loggedIn, account, onLoggedIn, onLoggedOut, onAccountNameChange }) => (
  <BrowserRouter>
    <ScrollToTop>
      { loggedIn ? <LoggedInRoutes account={ account } onLoggedOut={ onLoggedOut } onAccountNameChange={ onAccountNameChange } /> : <LoggedOutRoutes onLoggedIn={ onLoggedIn } /> }
    </ScrollToTop>
  </BrowserRouter>
)

Router.propTypes = {
  loggedIn: PropTypes.bool.isRequired,
  account: PropTypes.object,
  onLoggedIn: PropTypes.func.isRequired,
  onLoggedOut: PropTypes.func.isRequired,
  onAccountNameChange: PropTypes.func.isRequired,
}

export default Router
