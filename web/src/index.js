import React from 'react'
import ReactDOM from 'react-dom'

import 'abortcontroller-polyfill/dist/polyfill-patch-fetch'

import 'bootstrap/dist/css/bootstrap.css'
import 'font-awesome/css/font-awesome.min.css'

import './sass/global.css'

import App from './app'

ReactDOM.render(<App />, document.getElementById('app-root'))
