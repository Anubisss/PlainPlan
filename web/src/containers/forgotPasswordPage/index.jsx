import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

import { PageForm, FormInput } from '../../components/pageFlatForm'
import { Post, GetErrorMessage, GetFieldErrorMessages } from '../../utils/fetchApi'

const FormFooter = () => (
  <Fragment>
    <div>Already have an account? <Link to="/log-in">Log in</Link></div>
    <div>Are you new here? <Link to="/register">Create an account</Link></div>
  </Fragment>
)

class ForgotPasswordPage extends Component {
  constructor() {
    super()

    this.state = {
      submitting: false,
      successMessage: '',
      errorMessage: '',
      fieldErrorMessages: {},
      email: '',
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.abortController = new window.AbortController()
  }

  componentWillUnmount() {
    this.abortController.abort()
  }

  handleChange(e) {
    this.setState({ email: e.target.value })
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
    }

    Post('password-resets', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      let successMessage = ''
      if (res.statusCode === 201) {
        successMessage = 'We sent you a message with a link to change your password. ' +
                         'Please check your inbox within the next 60 minutes.'
      }

      const fieldErrorMessages = GetFieldErrorMessages(res.statusCode, res.body)
      if (res.statusCode === 404) {
        fieldErrorMessages.email = 'This account doesn\'t exist.'
      }

      this.setState({
        submitting: false,
        successMessage,
        errorMessage: GetErrorMessage(res.statusCode, res.body.code),
        fieldErrorMessages,
      })
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t create the password reset.', err)
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
                formTitle="Reset passsword" pageSuccessMessage={ this.state.successMessage } formErrorMessage={ this.state.errorMessage }
                formSubmitButtonText="Continue" footerElement={ <FormFooter /> }>
        <FormInput name="Email" type="email" value={ this.state.email } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.email }
                   autoComplete="email" autoFocus={ true } />
      </PageForm>
    )
  }
}

export default ForgotPasswordPage
