import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'
import PropTypes from 'prop-types'

import { PageForm, FormInput } from '../../components/pageFlatForm'
import { Post, GetErrorMessage, GetFieldErrorMessages } from '../../utils/fetchApi'

const FormFooter = () => (
  <Fragment>
    Are you new here? <Link to="/register">Create an account</Link>
  </Fragment>
)

const PasswordInputFooter = () => (
  <Fragment>
    <Link to="/forgot-password">Forgot your password?</Link>
  </Fragment>
)

class LogInPage extends Component {
  constructor() {
    super()

    this.state = {
      submitting: false,
      successMessage: '',
      errorMessage: '',
      fieldErrorMessages: {},
      email: '',
      password: '',
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.abortController = new window.AbortController()
  }

  componentWillUnmount() {
    this.abortController.abort()
  }

  handleChange(e) {
    this.setState({ [e.target.name]: e.target.value })
  }
  handleSubmit(e) {
    e.preventDefault()
    if (this.state.submitting === true) {
      return
    }

    this.setState({
      submitting: true,
      successMessage: '',
      errorMessage: '',
      fieldErrorMessages: {},
    })

    const body = {
      email: this.state.email,
      password: this.state.password,
    }

    Post('login', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      let successMessage = ''
      let errorMessage = GetErrorMessage(res.statusCode, res.body.code)

      if (res.statusCode === 201) {
        successMessage = 'You have successfully logged in.'
        setTimeout(() => this.props.onLoggedIn(), 1000)
      }
      else if (res.statusCode === 404) {
        errorMessage = 'Incorrect email or password.'
      }

      this.setState({
        submitting: false,
        successMessage,
        errorMessage,
        fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
      })
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t log in.', err)
      this.setState({
        submitting: false,
        errorMessage: GetErrorMessage(0),
      })
      window.scrollTo(0, 0)
    })
  }

  render() {
    return (
      <PageForm onSubmit={ this.handleSubmit } submitting={ this.state.submitting }
                quote={ true } pageSuccessMessage={ this.state.successMessage } formErrorMessage={ this.state.errorMessage }
                formSubmitButtonText="Log in" footerElement={ <FormFooter /> }>
        <FormInput name="Email" type="email" value={ this.state.email } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.email }
                   autoComplete="email" autoFocus={ true } />
        <FormInput name="Password" type="password" value={ this.state.password } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.password }
                   autoComplete="current-password" footerElement={ <PasswordInputFooter /> } />
      </PageForm>
    )
  }
}

LogInPage.propTypes = {
  onLoggedIn: PropTypes.func.isRequired,
}

export default LogInPage
