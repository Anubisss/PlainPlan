import React, { Component } from 'react'
import PropTypes from 'prop-types'

import { BigLoader } from '../../components/others'
import { Post, GetErrorMessage } from '../../utils/fetchApi'

class LogOutPage extends Component {
  constructor() {
    super()

    this.state = {
      errorMessage: '',
    }

    this.abortController = new window.AbortController()
  }

  componentDidMount() {
    Post('logout', this.abortController.signal)
    .then(res => {
      this.setState({
        errorMessage: GetErrorMessage(0),
      })
      if (res.statusCode !== 201) {
        this.setState({
          errorMessage: GetErrorMessage(0),
        })
      } else {
        this.props.onLoggedOut()
      }
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t log out.', err)
      this.setState({
        errorMessage: GetErrorMessage(0),
      })
    })
  }
  componentWillUnmount() {
    this.abortController.abort()
  }

  render() {
    return <BigLoader errorMessage={ this.state.errorMessage } />
  }
}

LogOutPage.propTypes = {
  onLoggedOut: PropTypes.func.isRequired,
}

export default LogOutPage
