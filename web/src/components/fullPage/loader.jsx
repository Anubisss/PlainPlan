import React from 'react'
import PropTypes from 'prop-types'

import './loader.css'
import logo from '../../images/logo.png'
import '../../images/full-page-background.jpg'

const Loader = ({ errorMessage }) => {
  let spinnerOrError = null
  if (errorMessage) {
    spinnerOrError = (
      <div className="error-container">
        <div className="alert alert-danger" role="alert">
          { errorMessage }
        </div>
      </div>
    )
  } else {
    spinnerOrError = (
      <div className="loading-container">
        <span className="fa fa-spinner fa-spin"></span>
      </div>
    )
  }

  return (
    <div className="fullpage-loading-container">
      <div className="main-container">
        <div className="brand-container">
          <div className="logo-and-text">
            <img src={ logo } alt="Logo" className="logo" />
            <div className="brand-text">PlainPlan</div>
          </div>
        </div>
        { spinnerOrError }
      </div>
    </div>
  )
}

Loader.propTypes = {
  errorMessage: PropTypes.string.isRequired,
}

export default Loader
