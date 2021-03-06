import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withTheme, withStyles } from '@material-ui/core/styles';
import CandidateStore from '../../stores/CandidateStore';
import ImageHandler from '../ImageHandler';
import ItemActionBar from '../Widgets/ItemActionBar/ItemActionBar';
import ItemPositionStatementActionBar from '../Widgets/ItemPositionStatementActionBar';
import { renderLog } from '../../utils/logging';
import SupportStore from '../../stores/SupportStore';
import { abbreviateNumber, numberWithCommas } from '../../utils/textFormat';
import { historyPush, isCordova } from '../../utils/cordovaUtils';


class CandidateItemForOpinions extends Component {
  constructor (props) {
    super(props);
    this.state = {
      ballotItemDisplayName: '',
      ballotItemWeVoteId: '',
      changeFound: false,
      componentDidMount: false,
      voterOpposesBallotItem: false,
      voterSupportsBallotItem: false,
      voterTextStatement: '',
      oneCandidate: {},
      // shouldFocusCommentArea: false,
      showPositionStatement: false,
    };
    this.togglePositionStatement = this.togglePositionStatement.bind(this);
  }

  componentDidMount () {
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.onCandidateStoreChange();
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
    // console.log('CandidateItemForOpinions componentDidMount, organizationWeVoteId:', organizationWeVoteId);
    const { oneCandidate } = this.props;
    if (oneCandidate) {
      this.setState({
        ballotItemDisplayName: oneCandidate.ballot_item_display_name,
        ballotItemWeVoteId: oneCandidate.we_vote_id,
      });
      const ballotItemStatSheet = SupportStore.getBallotItemStatSheet(oneCandidate.we_vote_id);
      if (ballotItemStatSheet) {
        const {
          voterOpposesBallotItem,
          voterSupportsBallotItem,
          voterTextStatement,
        } = ballotItemStatSheet;
        this.setState({
          voterOpposesBallotItem,
          voterSupportsBallotItem,
          voterTextStatement,
        });
      }
    }
    this.setState({
      componentDidMount: true,
      oneCandidate: this.props.oneCandidate,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.componentDidMount !== nextState.componentDidMount) {
      // console.log('this.state.componentDidMount: ', this.state.componentDidMount, ', nextState.componentDidMount: ', nextState.componentDidMount);
      return true;
    }
    if (this.state.changeFound !== nextState.changeFound) {
      // console.log('this.state.changeFound: ', this.state.changeFound, ', nextState.changeFound: ', nextState.changeFound);
      return true;
    }
    if (this.state.voterOpposesBallotItem !== nextState.voterOpposesBallotItem) {
      // console.log('this.state.voterOpposesBallotItem: ', this.state.voterOpposesBallotItem, ', nextState.voterOpposesBallotItem: ', nextState.voterOpposesBallotItem);
      return true;
    }
    if (this.state.voterSupportsBallotItem !== nextState.voterSupportsBallotItem) {
      // console.log('this.state.voterSupportsBallotItem: ', this.state.voterSupportsBallotItem, ', nextState.voterSupportsBallotItem: ', nextState.voterSupportsBallotItem);
      return true;
    }
    if (this.state.showPositionStatement !== nextState.showPositionStatement) {
      // console.log('this.state.showPositionStatement: ', this.state.showPositionStatement, ', nextState.showPositionStatement: ', nextState.showPositionStatement);
      return true;
    }
    if (this.state.voterTextStatement !== nextState.voterTextStatement) {
      // console.log('this.state.voterTextStatement: ', this.state.voterTextStatement, ', nextState.voterTextStatement: ', nextState.voterTextStatement);
      return true;
    }
    return false;
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('CandidateItemForOpinions caught error: ', `${error} with info: `, info);
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
    this.supportStoreListener.remove();
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have a "Oh snap" page
    return { hasError: true };
  }

  onCandidateStoreChange () {
    const changeFound = false;
    this.setState({
      changeFound,
    });
  }

  onSupportStoreChange () {
    const { ballotItemWeVoteId } = this.state;
    const ballotItemStatSheet = SupportStore.getBallotItemStatSheet(ballotItemWeVoteId);
    if (ballotItemStatSheet) {
      const {
        voterOpposesBallotItem,
        voterSupportsBallotItem,
        voterTextStatement,
      } = ballotItemStatSheet;
      this.setState({
        voterOpposesBallotItem,
        voterSupportsBallotItem,
        voterTextStatement,
      });
    }
  }

  getCandidateLink () {
    // If here, we assume the voter is on the Office page
    const { oneCandidate } = this.props;
    const { we_vote_id: candidateWeVoteId } = oneCandidate;
    if (candidateWeVoteId) {
      return `/candidate/${candidateWeVoteId}/b/btdo`; // back-to-default-office
    }
    return '';
  }

  goToCandidateLink = () => {
    // If here, we assume the voter is on the Office page
    historyPush(this.getCandidateLink());
  }

  togglePositionStatement () {
    const { showPositionStatement } = this.state;
    this.setState({
      showPositionStatement: !showPositionStatement,
      // shouldFocusCommentArea: true,
    });
  }

  render () {
    renderLog('CandidateItemForOpinions');  // Set LOG_RENDER_EVENTS to log all renders
    // const { classes, theme } = this.props;
    const {
      oneCandidate, showPositionStatement,
      voterOpposesBallotItem, voterSupportsBallotItem, voterTextStatement,
    } = this.state;
    if (!oneCandidate || !oneCandidate.we_vote_id) {
      return null;
    }
    // console.log('oneCandidate:', oneCandidate);
    const commentDisplayDesktop = voterSupportsBallotItem || voterOpposesBallotItem || voterTextStatement || showPositionStatement ? (
      <ItemPositionStatementActionBarDesktopWrapper className="d-none d-sm-block u-min-50">
        <ItemPositionStatementActionBar
          ballotItemWeVoteId={this.state.ballotItemWeVoteId}
          ballotItemDisplayName={this.state.ballotItemDisplayName}
          commentEditModeOn={this.state.showPositionStatement}
          externalUniqueId="desktopPositionStatement"
          // shouldFocus={this.state.shouldFocusCommentArea}
          transitioning={this.state.transitioning}
          ballotItemType="CANDIDATE"
          shownInList
        />
      </ItemPositionStatementActionBarDesktopWrapper>
    ) :
      null;

    const commentDisplayMobile = voterSupportsBallotItem || voterOpposesBallotItem || voterTextStatement || showPositionStatement ? (
      <ItemPositionStatementActionBarMobileWrapper className="d-block d-sm-none u-min-50">
        <ItemPositionStatementActionBar
          ballotItemWeVoteId={this.state.ballotItemWeVoteId}
          ballotItemDisplayName={this.state.ballotItemDisplayName}
          externalUniqueId="mobilePositionStatement"
          // shouldFocus={this.state.shouldFocusCommentArea}
          transitioning={this.state.transitioning}
          ballotItemType="CANDIDATE"
          shownInList
          mobile
        />
      </ItemPositionStatementActionBarMobileWrapper>
    ) :
      null;

    const candidatePartyText = oneCandidate.party && oneCandidate.party.length ? `${oneCandidate.party}` : '';
    const avatarCompressed = `card-main__avatar-compressed${isCordova() ? '-cordova' : ''}`;
    return (
      <Wrapper>
        <CandidateTopRow>
          <Candidate>
            {/* Candidate Image */}
            <Link to={this.getCandidateLink()} className="card-main__no-underline">
              <ImageHandler
                className={avatarCompressed}
                sizeClassName="icon-candidate-small u-push--sm "
                imageUrl={oneCandidate.candidate_photo_url_medium}
                alt="candidate-photo"
                kind_of_ballot_item="CANDIDATE"
              />
            </Link>
            {/* Candidate Name */}
            <Link to={this.getCandidateLink()} className="card-main__no-underline">
              <h4 className="card-main__candidate-name card-main__candidate-name-link u-f5">
                {oneCandidate.ballot_item_display_name}
                {candidatePartyText && (
                  <>
                    <br />
                    <span className="card-main__candidate-party-description">{candidatePartyText}</span>
                  </>
                )}
              </h4>
            </Link>
            {!!(oneCandidate.twitter_followers_count) && (
              <TwitterWrapper
                className="u-show-desktop twitter-followers__badge u-cursor--pointer"
                onClick={() => this.goToCandidateLink}
              >
                <span className="fab fa-twitter fa-sm" />
                <span title={numberWithCommas(oneCandidate.twitter_followers_count)}>{abbreviateNumber(oneCandidate.twitter_followers_count)}</span>
              </TwitterWrapper>
            )}
          </Candidate>
        </CandidateTopRow>
        {oneCandidate.twitter_description && (
          <CandidateDescription>
            {oneCandidate.twitter_description}
          </CandidateDescription>
        )}
        {/* Action Buttons: Support/Oppose/Comment */}
        <ItemActionBar
          inModal={this.props.inModal}
          ballotItemDisplayName={oneCandidate.ballot_item_display_name}
          ballotItemWeVoteId={oneCandidate.we_vote_id}
          buttonsOnly
          externalUniqueId={`candidateItemForAddPositions-${oneCandidate.we_vote_id}`}
          positionPublicToggleWrapAllowed={this.props.numberOfCandidatesInList > 1}
          shareButtonHide
          togglePositionStatementFunction={this.togglePositionStatement}
        />
        {commentDisplayDesktop}
        {commentDisplayMobile}
      </Wrapper>
    );
  }
}
CandidateItemForOpinions.propTypes = {
  oneCandidate: PropTypes.object,
  numberOfCandidatesInList: PropTypes.number,
  inModal: PropTypes.bool,
};

const styles = (theme) => ({
  cardHeaderIconRoot: {
    marginTop: '-.3rem',
    fontSize: 20,
    marginLeft: '.3rem',
  },
  cardFooterIconRoot: {
    fontSize: 14,
    margin: '0 0 .1rem .3rem',
    [theme.breakpoints.down('lg')]: {
      marginBottom: '.2rem',
    },
  },
});

const CandidateTopRow = styled.div`
  display: flex;
  flex-flow: row nowrap;
  justify-content: space-between;
`;

const Candidate = styled.div`
  display: flex;
  cursor: pointer;
`;

const CandidateDescription = styled.div`
`;

const ItemPositionStatementActionBarDesktopWrapper = styled.div`
  margin-bottom: 8px;
`;

const ItemPositionStatementActionBarMobileWrapper = styled.div`
  margin-bottom: 4px;
`;

const TwitterWrapper = styled.div`
  margin-left: 15px;
`;

const Wrapper = styled.div`
`;

export default withTheme(withStyles(styles)(CandidateItemForOpinions));
