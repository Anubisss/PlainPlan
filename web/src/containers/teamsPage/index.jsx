import React from 'react'
import { Switch, Route, Redirect } from 'react-router-dom'

import ListPage from './listPage'
import NewPage from './newPage'

const TeamsPage = () => (
  <Switch>
    <Route exact path="/teams" component={ ListPage } />
    <Route exact path="/teams/new" component={ NewPage } />
    <Redirect to="/teams" />
  </Switch>
)

export default TeamsPage
