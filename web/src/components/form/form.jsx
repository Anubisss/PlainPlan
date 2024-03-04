import React from 'react'
import PropTypes from 'prop-types'
import classNames from 'classnames'
import { Link } from 'react-router-dom'

import { Alert } from '../others'

import './form.css'

const Form = ({ children, onSubmit, submitting, errorMessage, successMessage, submitButtonText, cancelLinkTo }) => (
  <form onSubmit={ onSubmit } className="pp-form">
    { errorMessage && <Alert message={ errorMessage } /> }
    { successMessage && <Alert message={ successMessage } success /> }
    { children }
    <div className="button-container">
      <button type="submit" className={ classNames('btn pp-btn', { loading: submitting }) } disabled={ submitting }>
        { submitButtonText }
        { submitting && <span className="fa fa-spinner fa-spin"></span> }
      </button>
      { cancelLinkTo && <Link to={ cancelLinkTo } className="cancel-link">Cancel</Link> }
    </div>
  </form>
)

Form.propTypes = {
  children: PropTypes.node.isRequired,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  errorMessage: PropTypes.string.isRequired,
  successMessage: PropTypes.string.isRequired,
  submitButtonText: PropTypes.string.isRequired,
  cancelLinkTo: PropTypes.string,
}

export default Form
