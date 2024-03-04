import React from 'react'
import PropTypes from 'prop-types'

import { NormalizeId } from '../../utils/html'

const FormInput = ({ name, readOnly, type, value, onChange, errorMessage, autoComplete, autoFocus, footerElement }) => {
  const elemId = NormalizeId(name)

  return (
    <div className="control-group">
      <label htmlFor={ elemId } className={ errorMessage ? "error" : "" }>{ name }</label>
      { errorMessage &&
        <div className="error-message">{ errorMessage }</div>
      }
      { readOnly ? (
        <input type={ type } id={ elemId } name={ elemId } value={ value } autoComplete="off" disabled className="disabled" />
      ) : (
        <input type={ type } id={ elemId } name={ elemId } value={ value } onChange={ onChange }
               autoComplete={ autoComplete } spellCheck="false" autoFocus={ autoFocus } className={ errorMessage ? "error" : "" } />
      )}
      { footerElement &&
        <footer className="input-footer">
          { footerElement }
        </footer>
      }
    </div>
  )
}

FormInput.propTypes = {
  name: PropTypes.string.isRequired,
  readOnly: PropTypes.bool,
  type: PropTypes.oneOf([ 'email', 'password', 'text' ]).isRequired,
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func,
  errorMessage: PropTypes.string,
  autoComplete: PropTypes.string,
  autoFocus: PropTypes.bool,
  footerElement: PropTypes.element,
}

export default FormInput
