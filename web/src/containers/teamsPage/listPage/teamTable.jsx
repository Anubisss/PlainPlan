import React from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'

import { Alert } from '../../../components/others'

import './teamTable.css'

const TeamTable = ({ teams }) => {
  if (!teams.length) {
    return <Alert message="You have no teams." warning={ true } />
  }

  return (
    <table className="team-table">
      <thead>
        <tr>
          <th>Team</th>
          <th>Description</th>
        </tr>
      </thead>
      <tbody>
        { teams.map(team => <TeamRow key={ team.id } id={ team.id } name={ team.name } description={ team.description } />) }
      </tbody>
    </table>
  )
}

TeamTable.propTypes = {
  teams: PropTypes.arrayOf(PropTypes.object).isRequired,
}

const TeamRow = ({ id, name, description }) => (
  <tr>
    <td className="cell-name"><Link to={ `teams/${ id }` }>{ name }</Link></td>
    <td>{ description }</td>
  </tr>
)

TeamRow.propTypes = {
  id: PropTypes.number.isRequired,
  name: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
}

export default TeamTable
