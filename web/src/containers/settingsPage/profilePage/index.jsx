import React, { Component } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'

import { BigLoader } from '../../../components/others'
import { Title } from '../../../components/page'
import { Form, Input, Value } from '../../../components/form'
import { CalcAvatarUrl } from '../../../utils/gravatar'
import { Get, Put, GetErrorMessage, GetFieldErrorMessages } from '../../../utils/fetchApi'

import './index.css'

class ProfilePage extends Component {
  constructor() {
    super()

    this.state = {
      loading: true,
      errorMessage: '',
      submitting: false,
      formErrorMessage: '',
      formSuccessMessage: '',
      fieldErrorMessages: {},
      account: null,
    }

    this.handleChange = this.handleChange.bind(this)
    this.handleSubmit = this.handleSubmit.bind(this)

    this.abortController = new window.AbortController()
  }

  componentDidMount() {
    Get('accounts/me')
    .then(res => {
      let errorMessage = ''
      let account = null

      if (res.statusCode === 200) {
        account = res.body.data
        this.props.onAccountNameChange(account.name)
      } else {
        errorMessage = GetErrorMessage(0)
      }

      this.setState({
        loading: false,
        errorMessage,
        account,
      })
    })
    .catch(err => {
      console.error('Can\'t get profile.', err)
      this.setState({
        loading: false,
        errorMessage: GetErrorMessage(0),
      })
    })
  }
  componentWillUnmount() {
    this.abortController.abort()
  }

  handleChange(e) {
    let account = Object.assign({}, this.state.account)
    account[e.target.name] = e.target.value
    this.setState({
      account,
    })
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
      name: this.state.account.name,
      location: this.state.account.location,
      website: this.state.account.website,
    }

    Put('accounts/me', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      if (res.statusCode === 200) {
        this.props.onAccountNameChange(body.name)
      }

      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(res.statusCode, res.body.code),
        formSuccessMessage: res.statusCode === 200 ? 'Your profile has updated.' : '',
        fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
      })
      window.scrollTo(0, 0)
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\' update profile.', err)
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(0),
      })
      window.scrollTo(0, 0)
    })
  }

  render() {
    let createdFormatted = ''
    if (!this.state.loading && !this.state.errorMessage) {
      createdFormatted = moment(this.state.account.created).format('LL')
    }

    return (
      <div className="page-profile">
        <Title text="Profile" />
        { this.state.loading || this.state.errorMessage ? (
          <BigLoader errorMessage={ this.state.errorMessage } />
        ) : (
          <div className="form-container">
            <Form onSubmit={ this.handleSubmit } submitting={ this.state.submitting }
                  errorMessage={ this.state.formErrorMessage } successMessage={ this.state.formSuccessMessage } submitButtonText="Update profile">
              <Input name="Name" type="text" value={ this.state.account.name } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.name } />
              <Input name="Location" type="text" value={ this.state.account.location } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.location } />
              <Input name="Website" type="text" value={ this.state.account.website } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.website } />
              <Value name="Email" value={ this.state.account.email } />
              <Value name="Created" value={ createdFormatted } />
            </Form>
            <div className="avatar-container">
              <label>Picture</label>
              <div className="avatar-description-container">
                <img src={ CalcAvatarUrl(this.state.account.email, 150) } alt="Avatar" className="avatar" />
                <div className="description">You can change your profile picture at <a href="https://gravatar.com/" target="_blank" rel="noopener noreferrer">gravatar.com</a></div>
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }
}

ProfilePage.propTypes = {
  onAccountNameChange: PropTypes.func.isRequired,
}

export default ProfilePage
