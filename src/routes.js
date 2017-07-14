import React from 'react'
import { BrowserRouter as Router, Route } from 'react-router-dom'
import { StyleRoot } from 'radium'

import Dashboard from './Dashboard'
import SurveyCreation from './SurveyCreation'
import Voting from './Voting'
import Result from './Result'

const styles = {
  position: 'relative',
}

export default () => (
  <StyleRoot>
    <Router>
      <div style={styles}>
        <Route exact path="/" component={SurveyCreation} />
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/voting/:pollId" component={Voting} />
        <Route path="/result/:pollId" component={Result} />
      </div>
    </Router>
  </StyleRoot>
)