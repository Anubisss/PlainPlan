import React, { Component, Fragment } from 'react'
import { Link } from 'react-router-dom'

import { PageForm, FormInput } from '../../components/pageFlatForm'
import { Post, GetErrorMessage, GetFieldErrorMessages } from '../../utils/fetchApi'

const FormFooter = () => (
  <Fragment>
    Already have an account? <Link to="/log-in">Log in</Link>
  </Fragment>
)

const EmailInputFooter = () => (
  <Fragment>
    By registering, you agree to PlainPlan's <a href="" target="_blank">Terms of Service</a> and <a href="" target="_blank">Privacy Policy</a>.
  </Fragment>
)

class RegisterPage extends Component {
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

    Post('accounts/registration-requests', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      let successMessage = ''
      if (res.statusCode === 201) {
        successMessage = `To finish your registration please check your inbox within the next 2 hours. ` +
                         `We sent you a message to the following email address: ${ this.state.email }`
      }

      this.setState({
        submitting: false,
        successMessage,
        errorMessage: GetErrorMessage(res.statusCode, res.body.code),
        fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
      })
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t create the registration request.', err)
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
                formTitle="Register" pageSuccessMessage={ this.state.successMessage } formErrorMessage={ this.state.errorMessage }
                formSubmitButtonText="Continue" footerElement={ <FormFooter /> }>
        <FormInput name="Email" type="email" value={ this.state.email } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.email }
                   autoComplete="email" autoFocus={ true } footerElement={ <EmailInputFooter/> } />
      </PageForm>
    )
  }
}

export default RegisterPage
