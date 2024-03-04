import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import './alert.css'

const Alert = ({ message, success, warning }) => (
  <div className={ classNames('pp-alert alert', { error: !success && !warning, success: success, warning: warning }) } role="alert">
    { message }
  </div>
)

Alert.propTypes = {
  message: PropTypes.string.isRequired,
  success: PropTypes.bool,
  warning: PropTypes.bool,
}

export default Alert
