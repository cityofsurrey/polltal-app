import React, { Component } from 'react'
import Radium from 'radium'
import { connect } from 'react-redux'
import { gql, withApollo } from 'react-apollo'
import { bindActionCreators } from 'redux'
import update from 'immutability-helper'
import generate from 'shortid'

import PrimaryButton from 'components/Buttons/PrimaryButton'
import theme from 'theme'

import { actions as surveyActions } from './surveyCreation.module'
import Header from './Header'
import Questions from './Questions'
import Email from './Email'

const styles = {
  root: {
    padding: '40px 15px',
    textAlign: 'center',
    overflowX: 'hidden',
    maxWidth: 460,
    margin: '0 auto',
    '@media (min-width: 1150px)': {
      maxWidth: 625,
    },
  },
  backgroundHeader: {
    position: 'absolute',
    height: 325,
    width: '100%',
    top: 0,
    left: 0,
    zIndex: -1,
    transform: 'scaleX(2)',
    backgroundColor: theme.color.blue.primary,
    borderBottomLeftRadius: '50%',
    borderBottomRightRadius: '50%',
    '@media (min-width: 768px)': {
      height: 440,
      transform: 'scaleX(1.1)',
    },
  },
  generateBtn: {
    margin: '30px 0 20px',
  },
  footerText: {
    padding: '0 50px',
  },
  credits: {
    padding: 50,
  },
}

class SurveyCreation extends Component {
  state = {
    questions: {},
    email: '',
  }

  componentWillMount() {
    this.handleAddQuestions()
  }

  handleCreateSurvey = async () => {
    const { questions } = this.state
    const ids = Object.keys(questions)
    // don't send on empty first question
    if (ids.length === 1 && questions[ids[0]].question === '') return
    const filterEmpty = ids.filter((i) => {
      if (questions[i].question === '') return false
      return true
    })
    const filteredQuestions = filterEmpty.map(i => questions[i])
    const questionsInput = filteredQuestions.map(question => (
      {
        question: question.question,
        options: [{
          optionId: 'verySatisfied',
          label: 'Very Satisfied',
          votes: 0,
        }, {
          optionId: 'satisfied',
          label: 'Satisfied',
          votes: 0,
        }, {
          optionId: 'indifferent',
          label: 'Indifferent',
          votes: 0,
        }, {
          optionId: 'unsatisfied',
          label: 'Unsatisfied',
          votes: 0,
        }, {
          optionId: 'veryUnsatisfied',
          label: 'Very Unsatisfied',
          votes: 0,
        }],
        status: question.released,
      }))
    try {
      const mutation = {
        mutation: gql`
          mutation createFeedback($createInput: FeedbackInput!) {
            createFeedback(input: $createInput) {
                feedback {
                feedbackId
                dashboardId
                votingId
                resultId
                questions {
                  question
                  options {
                    optionId
                    label
                    votes
                  }
                  status
                  questionId
                }
              }
              error
            }
          }
        `,
        variables: {
          createInput: {
            email: this.state.email,
            questions: questionsInput,
          },
        },
      }

      const { data: { error, createFeedback: { feedback: { dashboardId } } } } = await this.props.client.mutate(mutation)
      this.props.history.push(`/dashboard/${dashboardId}`)
    } catch (err) {
      console.log(err)
    }
  }

  handleAddQuestions = () => {
    // generate id for controlled input
    const id = generate()
    this.setState({
      questions: update(this.state.questions, { $merge: {
        [id]: {
          id,
          question: '',
          reponses: [],
          released: true,
        },
      } }),
    })
  }

  handleQuestionChange = (event) => {
    const { value, name } = event.target

    this.setState({
      questions: update(this.state.questions, { [name]: {
        $merge: { question: value },
      } }),
    })
  }

  handleInputChange = (event) => {
    const { value, name } = event.target
    // TODO: error

    this.setState({
      [name]: value,
    })
  }

  render() {
    return (
      <div style={styles.root}>
        <div style={styles.backgroundHeader} />
        <Header />
        <Email email={this.state.email} onChange={this.handleInputChange} />
        <Questions onChange={this.handleQuestionChange} addQuestion={this.handleAddQuestions} questions={this.state.questions} />
        <PrimaryButton style={styles.generateBtn} label="Generate Poll" onClick={this.handleCreateSurvey} />
        <div style={styles.footerText}>By generating your poll, you agree to the Terms of Service.</div>
        <div style={styles.credits}>Designed and Developed by the Polltal team</div>
      </div>
    )
  }
}

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators({ ...surveyActions }, dispatch),
})

export default connect(
  () => ({}),
  mapDispatchToProps,
)(withApollo(Radium(SurveyCreation)))
