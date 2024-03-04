import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { PageForm, FormInput } from '../../components/pageFlatForm'
import { IsValidUuidV4 } from '../../utils/uuid'
import { Get, Post, GetErrorMessage, GetFieldErrorMessages } from '../../utils/fetchApi'

class FinishRegistrationPage extends Component {
  constructor() {
    super()

    this.state = {
      loading: true,
      submitting: false,
      pageSuccessMessage: '',
      pageErrorMessage: '',
      formErrorMessage: '',
      fieldErrorMessages: {},
      email: '',
      name: '',
      password: '',
      'password-again': '',
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.abortController = new window.AbortController()
  }

  componentDidMount() {
    const { uuid } = this.props.match.params

    if (!IsValidUuidV4(uuid)) {
      this.setState({
        loading: false,
        pageErrorMessage: 'This link contains an invalid registration request.',
      })
    } else {
      Get(`accounts/registration-requests/${ uuid }`, this.abortController.signal)
      .then(res => {
        let email = ''

        let pageErrorMessage = ''
        switch (res.statusCode) {
          case 200:
            email = res.body.data.email
            break
          case 404:
            pageErrorMessage = 'This registration request link is expired.'
            break
          default:
            pageErrorMessage = GetErrorMessage(res.statusCode, res.body.code)
            break
        }

        this.setState({
          loading: false,
          pageErrorMessage,
          email,
        })
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          return
        }
        console.error('Can\'t get the registration request.', err)
        this.setState({
          loading: false,
          pageErrorMessage: GetErrorMessage(0),
        })
      })
    }
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
      pageSuccessMessage: '',
      formErrorMessage: '',
      fieldErrorMessages: {},
    })

    const body = {
      uuid: this.props.match.params.uuid,
      name: this.state.name,
      password: this.state.password,
      passwordAgain: this.state['password-again'],
    }

    Post('accounts', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      const fieldErrorMessages = GetFieldErrorMessages(res.statusCode, res.body)
      if (fieldErrorMessages.uuid === 'invalid') {
        this.setState({
          submitting: false,
          pageErrorMessage: 'This registration request link is expired.'
        })
      } else {
        this.setState({
          submitting: false,
          pageSuccessMessage: res.statusCode === 201 ? 'Your registration is complete. You can log in now.' : '',
          formErrorMessage: GetErrorMessage(res.statusCode, res.body.code),
          fieldErrorMessages,
        })
      }
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t finish the registration.', err)
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(0),
      })
      window.scrollTo(0, 0)
    })
  }

  render() {
    const pageMessageFooterElement = this.state.pageSuccessMessage ? <Link to="/log-in">Log in</Link> : null

    return (
      <PageForm loading={ this.state.loading } onSubmit={ this.handleSubmit } submitting={ this.state.submitting } formTitle="Finish registration"
                pageSuccessMessage={ this.state.pageSuccessMessage } pageErrorMessage={ this.state.pageErrorMessage } pageMessageFooterElement={ pageMessageFooterElement }
                formErrorMessage={ this.state.formErrorMessage } formSubmitButtonText="Finish">
        <FormInput name="Email" readOnly={ true } type="email" value={ this.state.email } />
        <FormInput name="Name" type="text" value={ this.state.name } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.name }
                   autoComplete="name" autoFocus={ true } />
        <FormInput name="Password" type="password" value={ this.state.password } onChange={ this.handleChange }
                   errorMessage={ this.state.fieldErrorMessages.password } autoComplete="off" />
        <FormInput name="Password again" type="password" value={ this.state['password-again'] } onChange={ this.handleChange }
                   errorMessage={ this.state.fieldErrorMessages['password-again'] } autoComplete="off" />
      </PageForm>
    )
  }
}

export default FinishRegistrationPage
