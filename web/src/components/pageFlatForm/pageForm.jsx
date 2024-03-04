import React, { Fragment } from 'react'
import PropTypes from 'prop-types'

import './pageForm.css'
import logo from '../../images/logo.png'
import '../../images/full-page-background.jpg'

const Quote = () => (
  <blockquote className="blockquote text-right form-quote">
    <p className="mb-0">I love it when a plan comes together.</p>
    <footer className="blockquote-footer">Col. John 'Hannibal' Smith</footer>
  </blockquote>
)

const Title = ({ title }) => (
  <h1 className="title">{ title }</h1>
)

Title.propTypes = {
  title: PropTypes.string.isRequired,
}

const PageForm = ({ children, loading, onSubmit, submitting, quote, formTitle, formSubtitle,
                    pageSuccessMessage, pageErrorMessage, pageMessageFooterElement,
                    formErrorMessage, formSubmitButtonText, footerElement }) => {
  const quoteOrTitle = quote ? <Quote /> : <Title title={ formTitle } />

  let pageMessage = null
  if (pageSuccessMessage || pageErrorMessage) {
    pageMessage = (
      <div className={ pageSuccessMessage ? "alert alert-success" : "alert alert-danger" } role="alert">
        <h4 className="alert-heading">{ pageSuccessMessage ? "Well done!" : "Error" }</h4>
        <p>{ pageSuccessMessage || pageErrorMessage }</p>
        { pageMessageFooterElement &&
          <Fragment>
            <hr />
            <p className="footer">{ pageMessageFooterElement }</p>
          </Fragment>
        }
      </div>
    )
  }

  let pageMessageOrForm = pageMessage
  if (!pageMessage) {
    pageMessageOrForm = (
      <Fragment>
        { formErrorMessage &&
          <div className="alert alert-danger" role="alert">{ formErrorMessage }</div>
        }
        <form onSubmit={ onSubmit }>
          { children }
          { submitting ? (
            <button type="submit" className="btn btn-block btn-primary pp-btn-primary loading" disabled>
              <span className="fa fa-spinner fa-spin"></span>
            </button>
          ) : (
            <button type="submit" className="btn btn-block btn-primary pp-btn-primary">{ formSubmitButtonText }</button>
          )}
          { footerElement &&
            <footer className="form-footer">
              { footerElement }
            </footer>
          }
        </form>
      </Fragment>
    )
  }
  let subtitleOrNull = null
  if (formSubtitle) {
    subtitleOrNull = <h4 className="subtitle">{ formSubtitle }</h4>
  }

  return (
    <div className="page-flat-form">
      <div className="flat-form-container">
        <div className="brand-container">
          <div className="logo-and-text">
            <img src={ logo } alt="Logo" className="logo" />
            <div className="brand-text">PlainPlan</div>
          </div>
        </div>
        <div className="form-container">
          { quoteOrTitle }
          { subtitleOrNull }
          { loading ? (
            <div className="loading-container">
              <span className="fa fa-spinner fa-spin"></span>
            </div>
          ) : (
            <Fragment>
              { pageMessageOrForm }
            </Fragment>
          )}
        </div>
      </div>
    </div>
  )
}

PageForm.propTypes = {
  children: PropTypes.node.isRequired,
  loading: PropTypes.bool,
  onSubmit: PropTypes.func.isRequired,
  submitting: PropTypes.bool.isRequired,
  quote: PropTypes.bool,
  formTitle: PropTypes.string,
  formSubtitle: PropTypes.string,
  pageSuccessMessage: PropTypes.string,
  pageErrorMessage: PropTypes.string,
  pageMessageFooterElement: PropTypes.element,
  formErrorMessage: PropTypes.string.isRequired,
  formSubmitButtonText: PropTypes.string.isRequired,
  footerElement: PropTypes.element,
}

export default PageForm
