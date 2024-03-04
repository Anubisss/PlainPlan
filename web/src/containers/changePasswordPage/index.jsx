import React, { Component } from 'react'
import { Link } from 'react-router-dom'

import { PageForm, FormInput } from '../../components/pageFlatForm'
import { IsValidUuidV4 } from '../../utils/uuid'
import { Get, Post, GetErrorMessage, GetFieldErrorMessages } from '../../utils/fetchApi'

class ChangePasswordPage extends Component {
  constructor() {
    super()

    this.state = {
      loading: true,
      submitting: false,
      pageSuccessMessage: '',
      pageErrorMessage: '',
      formErrorMessage: '',
      fieldErrorMessages: {},
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
        pageErrorMessage: 'This is an invalid password reset link.',
      })
    } else {
      Get(`password-resets/${ uuid }`, this.abortController.signal)
      .then(res => {
        let name = ''

        let pageErrorMessage = ''
        switch (res.statusCode) {
          case 200:
            name = res.body.data.name
            break
          case 404:
            pageErrorMessage = 'This password reset link is expired.'
            break
          default:
            pageErrorMessage = GetErrorMessage(res.statusCode, res.body.code)
            break
        }

        this.setState({
          loading: false,
          pageErrorMessage,
          name,
        })
      })
      .catch(err => {
        if (err.name === 'AbortError') {
          return
        }
        console.error('Can\'t get the password reset.', err)
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
      password: this.state.password,
      passwordAgain: this.state['password-again'],
    }

    Post(`password-resets/${ this.props.match.params.uuid }/finish`, this.abortController.signal, JSON.stringify(body))
    .then(res => {
      if (res.statusCode === 404) {
        this.setState({
          submitting: false,
          pageErrorMessage: 'This password reset link is expired.'
        })
      } else {
        this.setState({
          submitting: false,
          pageSuccessMessage: res.statusCode === 201 ? 'Your password is changed. You can log in now.' : '',
          formErrorMessage: GetErrorMessage(res.statusCode, res.body.code),
          fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
        })
      }
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t finish the password reset.', err)
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
      <PageForm loading={ this.state.loading } onSubmit={ this.handleSubmit } submitting={ this.state.submitting } formTitle="Change password" formSubtitle={ this.state.name }
                pageSuccessMessage={ this.state.pageSuccessMessage } pageErrorMessage={ this.state.pageErrorMessage } pageMessageFooterElement={ pageMessageFooterElement }
                formErrorMessage={ this.state.formErrorMessage } formSubmitButtonText="Update">
        <FormInput name="Password" type="password" value={ this.state.password } onChange={ this.handleChange }
                   errorMessage={ this.state.fieldErrorMessages.password } autoComplete="off" autoFocus={ true } />
        <FormInput name="Password again" type="password" value={ this.state['password-again'] } onChange={ this.handleChange }
                   errorMessage={ this.state.fieldErrorMessages['password-again'] } autoComplete="off" />
      </PageForm>
    )
  }
}

export default ChangePasswordPage
