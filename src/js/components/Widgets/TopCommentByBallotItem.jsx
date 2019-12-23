import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import { styled } from 'linaria/react';
import { withStyles } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import CandidateStore from '../../stores/CandidateStore';
import MeasureStore from '../../stores/MeasureStore';
import VoterGuideStore from '../../stores/VoterGuideStore';
import { extractFirstEndorsementFromPositionList } from '../../utils/positionFunctions';
import { shortenText, stringContains } from '../../utils/textFormat';
import { renderLog } from '../../utils/logging';

class TopCommentByBallotItem extends Component {
  static propTypes = {
    ballotItemWeVoteId: PropTypes.string,
    children: PropTypes.object,
    childChangeIndicator: PropTypes.string,
    classes: PropTypes.object,
    externalUniqueId: PropTypes.string,
    hideMoreButton: PropTypes.bool,
    learnMoreText: PropTypes.string,
    learnMoreUrl: PropTypes.string,
    limitToNo: PropTypes.bool,
    limitToYes: PropTypes.bool,
    onClickFunction: PropTypes.func,
  };

  constructor (props) {
    super(props);
    this.state = {
      // organizationsToFollow: [],
      ballotItemWeVoteId: '',
      endorsementOrganization: {},
      endorsementText: '',
      externalUniqueId: '',
      learnMoreText: '',
      learnMoreUrl: '',
      localUniqueId: '',
    };
  }

  componentDidMount () {
    // console.log('TopCommentByBallotItem componentDidMount');
    const { ballotItemWeVoteId, externalUniqueId } = this.props;
    const isForCandidate = stringContains('cand', ballotItemWeVoteId);
    const isForMeasure = stringContains('meas', ballotItemWeVoteId);

    if (isForCandidate) {
      const allCachedPositionsForCandidate = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(ballotItemWeVoteId);
      // console.log('componentDidMount allCachedPositionsForCandidate: ', allCachedPositionsForCandidate);
      const limitToYes = true;
      const candidateResults = extractFirstEndorsementFromPositionList(allCachedPositionsForCandidate, limitToYes);
      // console.log('candidateResults.endorsementText: ', candidateResults.endorsementText);

      this.setState({
        ballotItemWeVoteId,
        endorsementOrganization: candidateResults.endorsementOrganization,
        endorsementText: candidateResults.endorsementText,
      });
    }

    if (isForMeasure) {
      const allCachedPositionsForMeasure = MeasureStore.getAllCachedPositionsByMeasureWeVoteId(ballotItemWeVoteId);
      // console.log('TopCommentByBallotItem componentDidMount allCachedPositionsForMeasure: ', allCachedPositionsForMeasure);
      const measureResults = extractFirstEndorsementFromPositionList(allCachedPositionsForMeasure, this.props.limitToYes, this.props.limitToNo);
      // console.log('measureResults.endorsementText: ', measureResults.endorsementText);

      this.setState({
        ballotItemWeVoteId,
        endorsementOrganization: measureResults.endorsementOrganization,
        endorsementText: measureResults.endorsementText,
      });
    }
    this.setState({
      externalUniqueId,
      learnMoreText: this.props.learnMoreText,
      learnMoreUrl: this.props.learnMoreUrl,
      localUniqueId: ballotItemWeVoteId,
    });

    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.measureStoreListener = MeasureStore.addListener(this.onMeasureStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    // console.log('TopCommentByBallotItem componentWillReceiveProps');
    // Do not update the state if the organizationsToFollow list looks the same, and the ballotItemWeVoteId hasn't changed
    const { ballotItemWeVoteId } = nextProps;
    const isForCandidate = stringContains('cand', ballotItemWeVoteId);
    const isForMeasure = stringContains('meas', ballotItemWeVoteId);

    if (isForCandidate) {
      const allCachedPositionsForCandidate = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(ballotItemWeVoteId);
      // console.log('componentWillReceiveProps allCachedPositionsForCandidate: ', allCachedPositionsForCandidate);
      const limitToYes = true;
      const candidateResults = extractFirstEndorsementFromPositionList(allCachedPositionsForCandidate, limitToYes);
      // console.log('candidateResults.endorsementText: ', candidateResults.endorsementText);

      this.setState({
        ballotItemWeVoteId,
        endorsementOrganization: candidateResults.endorsementOrganization,
        endorsementText: candidateResults.endorsementText,
      });
    }

    if (isForMeasure) {
      const allCachedPositionsForMeasure = MeasureStore.getAllCachedPositionsByMeasureWeVoteId(ballotItemWeVoteId);
      // console.log('componentWillReceiveProps allCachedPositionsForMeasure: ', allCachedPositionsForMeasure);
      const measureResults = extractFirstEndorsementFromPositionList(allCachedPositionsForMeasure, this.props.limitToYes, this.props.limitToNo);
      // console.log('measureResults.endorsementText: ', measureResults.endorsementText);

      this.setState({
        ballotItemWeVoteId,
        endorsementOrganization: measureResults.endorsementOrganization,
        endorsementText: measureResults.endorsementText,
      });
    }
    this.setState({
      learnMoreText: nextProps.learnMoreText,
      learnMoreUrl: nextProps.learnMoreUrl,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.props.childChangeIndicator !== nextProps.childChangeIndicator) {
      // console.log('shouldComponentUpdate: this.props.childChangeIndicator', this.props.childChangeIndicator, ', nextProps.childChangeIndicator', nextProps.childChangeIndicator);
      return true;
    }
    if (this.state.endorsementOrganization !== nextState.endorsementOrganization) {
      // console.log('shouldComponentUpdate: this.state.endorsementOrganization', this.state.endorsementOrganization, ', nextState.endorsementOrganization', nextState.endorsementOrganization);
      return true;
    }
    if (this.state.endorsementText !== nextState.endorsementText) {
      // console.log('shouldComponentUpdate: this.state.endorsementText', this.state.endorsementText, ', nextState.endorsementText', nextState.endorsementText);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.measureStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onCandidateStoreChange () {
    const { ballotItemWeVoteId } = this.state;
    const isForCandidate = stringContains('cand', ballotItemWeVoteId);

    if (isForCandidate) {
      const allCachedPositionsForCandidate = CandidateStore.getAllCachedPositionsByCandidateWeVoteId(ballotItemWeVoteId);
      // console.log('onCandidateStoreChange allCachedPositionsForCandidate: ', allCachedPositionsForCandidate);
      const limitToYes = true;
      if (allCachedPositionsForCandidate.length > 0) {
        const results = extractFirstEndorsementFromPositionList(allCachedPositionsForCandidate, limitToYes);
        // console.log('results.endorsementText: ', results.endorsementText);

        this.setState({
          endorsementOrganization: results.endorsementOrganization,
          endorsementText: results.endorsementText,
        });
      }
    }
  }

  onMeasureStoreChange () {
    const { ballotItemWeVoteId } = this.state;
    const isForMeasure = stringContains('meas', ballotItemWeVoteId);
    if (isForMeasure) {
      const allCachedPositionsForMeasure = MeasureStore.getAllCachedPositionsByMeasureWeVoteId(ballotItemWeVoteId);
      // console.log('onMeasureStoreChange allCachedPositionsForMeasure: ', allCachedPositionsForMeasure);
      const results = extractFirstEndorsementFromPositionList(allCachedPositionsForMeasure, this.props.limitToYes, this.props.limitToNo);
      // console.log('results.endorsementText: ', results.endorsementText);

      this.setState({
        endorsementOrganization: results.endorsementOrganization,
        endorsementText: results.endorsementText,
      });
    }
  }

  onVoterGuideStoreChange () {
    this.onCandidateStoreChange();
    this.onMeasureStoreChange();
  }

  onClickFunction = () => {
    const { ballotItemWeVoteId } = this.props;
    if (this.props.onClickFunction && ballotItemWeVoteId) {
      this.props.onClickFunction(ballotItemWeVoteId);
    }
  }

  render () {
    renderLog('TopCommentByBallotItem');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes, hideMoreButton } = this.props;
    const { endorsementOrganization, endorsementText, externalUniqueId, localUniqueId } = this.state;
    if (!endorsementText) {
      // console.log('TopCommentByBallotItem no endorsementText');
      // If we don't have any endorsement text, show the alternate component passed in
      return this.props.children || null;
    }

    const croppedEndorsementTextDesktopTablet = shortenText(endorsementText, 100);
    const croppedEndorsementTextMobile = shortenText(endorsementText, 75);
    const learnMoreText = this.state.learnMoreText ? this.state.learnMoreText : 'more';

    // console.log('GuideList organizationsToFollow: ', this.state.organizationsToFollow);
    //       on_click={this.goToCandidateLink(this.state.oneCandidate.we_vote_id)}
    return (
      <Wrapper onClick={() => this.onClickFunction()}>
        <BallotItemEndorserName>
          {endorsementOrganization}
          .
        </BallotItemEndorserName>
        <BallotItemEndorsementTextDesktop className="u-show-desktop-tablet">
          {' '}
          &quot;
          {croppedEndorsementTextDesktopTablet}
          &quot;
        </BallotItemEndorsementTextDesktop>
        <BallotItemEndorsementTextMobile className="u-show-mobile">
          {' '}
          &quot;
          {croppedEndorsementTextMobile}
          &quot;
        </BallotItemEndorsementTextMobile>
        { hideMoreButton ? null : (
          <span>
            { this.state.learnMoreUrl ? (
              <span>
                {' '}
                <Link to={this.state.learnMoreUrl}>{learnMoreText}</Link>
              </span>
            ) : (
              <Button
                id={`topCommentButtonByBallotItem-${externalUniqueId}-${localUniqueId}`}
                variant="outlined"
                color="primary"
                className="u-float-right"
                classes={{ root: classes.buttonRoot, outlinedPrimary: classes.buttonOutlinedPrimary }}
              >
                {learnMoreText}
              </Button>
            )
            }
          </span>
        )}
      </Wrapper>
    );
  }
}

const styles = theme => ({
  buttonRoot: {
    padding: 4,
    fontSize: 12,
    width: 60,
    height: 30,
    marginTop: 5,
    [theme.breakpoints.down('md')]: {
      width: 60,
      height: 30,
    },
    [theme.breakpoints.down('sm')]: {
      width: 'fit-content',
      minWidth: 50,
      height: 30,
      padding: '0 8px',
      fontSize: 10,
    },
  },
  buttonOutlinedPrimary: {
    background: 'white',
  },
  closeButton: {
    position: 'absolute',
    right: `${theme.spacing(1)}px`,
    top: `${theme.spacing(1)}px`,
  },
});

const Wrapper = styled.div`
  cursor: pointer;
  font-size: 14px;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 16px;
  }
`;

const BallotItemEndorserName = styled.span`
  color: #999;
  font-size: 14px;
  font-weight: 400;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 15px;
  }
`;

const BallotItemEndorsementTextDesktop = styled.span`
  color: #555;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 16px;
  font-weight: 400;
`;

const BallotItemEndorsementTextMobile = styled.span`
  color: #555;
  font-family: 'Source Sans Pro', sans-serif;
  font-size: 16px;
  font-weight: 400;
`;

export default withStyles(styles)(TopCommentByBallotItem);
