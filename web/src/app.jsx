import React, { Component } from 'react'

import Router from './router'
import { Get, GetErrorMessage } from './utils/fetchApi'
import { Loader } from './components/fullPage'

class App extends Component {
  constructor() {
    super()

    this.state = {
      loading: true,
      loggedIn: false,
      errorMessage: '',
      account: null,
    }

    this.handleLoggedIn = this.handleLoggedIn.bind(this)
    this.handleLoggedOut = this.handleLoggedOut.bind(this)
    this.handleAccountNameChange = this.handleAccountNameChange.bind(this)
  }

  componentDidMount() {
    this.getAccount()
  }

  handleLoggedIn() {
    this.setState({
      loading: true,
    })
    this.getAccount()
  }
  handleLoggedOut() {
    this.setState({
      loggedIn: false,
      account: null,
    })
  }
  handleAccountNameChange(name) {
    const account = Object.assign({}, this.state.account)
    account.name = name
    this.setState({
      account,
    })
  }

  getAccount() {
    Get('accounts/me')
    .then(res => {
      let loggedIn = false
      let errorMessage = ''
      let account = null

      switch (res.statusCode) {
        case 200:
          loggedIn = true
          account = res.body.data
          break
        case 401:
          break
        default:
          errorMessage = GetErrorMessage(0)
      }

      this.setState({
        loading: false,
        loggedIn,
        errorMessage,
        account,
      })
    })
    .catch(err => {
      console.error('Can\'t get account me.', err)
      this.setState({
        loading: false,
        errorMessage: GetErrorMessage(0),
      })
    })
  }

  render() {
    if (this.state.loading || this.state.errorMessage) {
      return <Loader errorMessage={ this.state.errorMessage } />
    }
    return <Router loggedIn={ this.state.loggedIn } account={ this.state.account } onLoggedIn={ this.handleLoggedIn } onLoggedOut={ this.handleLoggedOut }
                   onAccountNameChange={ this.handleAccountNameChange } />
  }
}

export default App
