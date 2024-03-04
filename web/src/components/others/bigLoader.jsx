import React from 'react'
import PropTypes from 'prop-types'

import { Alert } from './'

import './bigLoader.css'

const BigLoader = ({ errorMessage }) => (
  <div className="big-loader-container">
    { errorMessage ? (
      <Alert message={ errorMessage } />
    ) : (
      <div className="loading-container">
        <span className="fa fa-spinner fa-spin"></span>
      </div>
    )}
  </div>
)

BigLoader.propTypes = {
  errorMessage: PropTypes.string.isRequired,
}

export default BigLoader
