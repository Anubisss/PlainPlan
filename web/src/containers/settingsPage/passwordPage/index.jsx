import React, { Component } from 'react'

import { Title } from '../../../components/page'
import { Form, Input } from '../../../components/form'
import { Patch, GetErrorMessage, GetFieldErrorMessages } from '../../../utils/fetchApi'

class PasswordPage extends Component {
  constructor() {
    super()

    this.state = {
      submitting: false,
      formErrorMessage: '',
      formSuccessMessage: '',
      fieldErrorMessages: {},
      'current-password': '',
      'new-password': '',
      'new-password-again': '',
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
      formErrorMessage: '',
      formSuccessMessage: '',
      fieldErrorMessages: {},
    })

    const body = {
      passwordCurrent: this.state['current-password'],
      passwordNew: this.state['new-password'],
      passwordNewAgain: this.state['new-password-again'],
    }

    Patch('accounts/me/password', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(res.statusCode, res.body.code),
        formSuccessMessage: res.statusCode === 200 ? 'Your password has changed.' : '',
        fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
      })
      if (res.statusCode === 200) {
        this.setState({
          'current-password': '',
          'new-password': '',
          'new-password-again': '',
        })
      }
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t update password.', err)
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(0),
      })
      window.scrollTo(0, 0)
    })
  }

  render() {
    return (
      <div className="page-password">
        <Title text="Change password" />
        <Form onSubmit={ this.handleSubmit } submitting={ this.state.submitting }
              errorMessage={ this.state.formErrorMessage } successMessage={ this.state.formSuccessMessage } submitButtonText="Update password">
          <Input name="Current password" type="password" value={ this.state['current-password'] } onChange={ this.handleChange }
                 errorMessage={ this.state.fieldErrorMessages['current-password'] } autoComplete="off" />
          <Input name="New password" type="password" value={ this.state['new-password'] } onChange={ this.handleChange }
                 errorMessage={ this.state.fieldErrorMessages['new-password'] } autoComplete="off" />
          <Input name="New password again" type="password" value={ this.state['new-password-again'] } onChange={ this.handleChange }
                 errorMessage={ this.state.fieldErrorMessages['new-password-again'] } autoComplete="off" />
        </Form>
      </div>
    )
  }
}


export default PasswordPage
