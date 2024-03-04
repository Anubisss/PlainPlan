import React from 'react'
import PropTypes from 'prop-types'

import './title.css'

const Title = ({ text }) => (
  <h1 className="page-title">{ text }</h1>
)

Title.propTypes = {
  text: PropTypes.string.isRequired,
}

export default Title
