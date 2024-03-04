import React, { Component } from 'react'
import { withRouter } from 'react-router-dom'

import { Title } from '../../../components/page'
import { Form, Input } from '../../../components/form'
import { Post, GetErrorMessage, GetFieldErrorMessages } from '../../../utils/fetchApi'

import './index.css'

class NewPage extends Component {
  constructor() {
    super()

    this.state = {
      errorMessage: '',
      submitting: false,
      formErrorMessage: '',
      fieldErrorMessages: {},
      name: '',
      description: '',
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
      fieldErrorMessages: {},
    })

    const body = {
      name: this.state.name,
      description: this.state.description,
    }

    Post('teams', this.abortController.signal, JSON.stringify(body))
    .then(res => {
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(res.statusCode, res.body.code),
        fieldErrorMessages: GetFieldErrorMessages(res.statusCode, res.body),
      })

      if (res.statusCode === 201) {
        this.props.history.push('/teams')
      } else {
        window.scrollTo(0, 0)
      }
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t create team.', err)
      this.setState({
        submitting: false,
        formErrorMessage: GetErrorMessage(0),
      })
      window.scrollTo(0, 0)
    })
  }

  render() {
    return (
      <div className="page-teams-new">
        <Title text="Create a new team" />
        <Form onSubmit={ this.handleSubmit } submitting={ this.state.submitting }
              errorMessage={ this.state.formErrorMessage } successMessage='' submitButtonText="Create team" cancelLinkTo="/teams">
          <Input name="Name" type="text" value={ this.state.name } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.name } />
          <Input name="Description" type="text" value={ this.state.description } onChange={ this.handleChange } errorMessage={ this.state.fieldErrorMessages.description } />
        </Form>
      </div>
    )
  }
}

export default withRouter(NewPage)
