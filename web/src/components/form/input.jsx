import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'

import { NormalizeId } from '../../utils/html'

const Input = ({ name, type, value, onChange, errorMessage, autoComplete }) => {
  const elemId = NormalizeId(name)

  return (
    <div  className={ classNames('group', { error: errorMessage }) }>
      <label htmlFor={ elemId }>{ name }</label>
      { errorMessage && <div className="error-message">{ errorMessage }</div> }
      <input type={ type } id={ elemId } name={ elemId } value={ value } onChange={ onChange } autoComplete={ autoComplete ? autoComplete : elemId } />
    </div>
  )
}

Input.propTypes = {
  name: PropTypes.string.isRequired,
  type: PropTypes.oneOf([ 'text', 'password' ]).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  errorMessage: PropTypes.string,
  autoComplete: PropTypes.string,
}

export default Input
