import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import { Get, GetErrorMessage } from '../../../utils/fetchApi'
import { Title } from '../../../components/page'
import { BigLoader } from '../../../components/others'
import TeamTable from './teamTable'

import './index.css'

class ListPage extends Component {
  constructor() {
    super()

    this.state = {
      loading: true,
      errorMessage: '',
      teams: [],
    }

    this.handleRefreshButtonClick = this.handleRefreshButtonClick.bind(this)

    this.abortController = new window.AbortController()
  }

  componentDidMount() {
    this.loadTeams()
  }
  componentWillUnmount() {
    this.abortController.abort()
  }

  handleRefreshButtonClick() {
    if (this.state.loading) {
      return
    }
    this.loadTeams()
  }

  loadTeams() {
    this.setState({
      loading: true,
      errorMessage: '',
    })

    Get('teams', this.abortController.signal)
    .then(res => {
      this.setState({
        loading: false,
        teams: res.body.data,
        errorMessage: GetErrorMessage(res.statusCode, res.body.code),
      })
    })
    .catch(err => {
      if (err.name === 'AbortError') {
        return
      }
      console.error('Can\'t get the teams.', err)
      this.setState({
        loading: false,
        errorMessage: GetErrorMessage(0),
      })
    })
  }

  render() {
    return (
      <div className="page-teams">
        <Title text="Teams" />
        <div className="action-strip">
          <Link to="teams/new" className="btn btn-success">New team</Link>
          <button type="button" className={ classNames('refresh-button', { refreshing: this.state.loading }) }
                  onClick={ this.handleRefreshButtonClick } disabled={ this.state.loading }>
            <span className={ classNames('fa fa-refresh ', { 'fa-spin': this.state.loading }) }></span>
          </button>
        </div>
        { this.state.loading || this.state.errorMessage ? (
          <BigLoader errorMessage={ this.state.errorMessage } />
        ) : (
          <TeamTable teams={ this.state.teams } />
        )}
      </div>
    )
  }
}

export default ListPage
