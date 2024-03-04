import React from 'react'
import PropTypes from 'prop-types'

const Value = ({ name, value }) => (
  <div className="group">
    <label>{ name }</label>
    <div className="value">{ value }</div>
  </div>
)

Value.propTypes = {
  name: PropTypes.string.isRequired,
  value: PropTypes.string.isRequired,
}

export default Value
