import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import { historyPush } from '../../utils/cordovaUtils';
import { toTitleCase } from '../../utils/textFormat';
import CandidateItemForAddPositions from './CandidateItemForAddPositions';
import CandidateStore from '../../stores/CandidateStore';
import { renderLog } from '../../utils/logging';

// December 2018:  We want to work toward being airbnb style compliant, but for now these are disabled in this file to minimize massive changes
/* eslint no-param-reassign: 0 */

class OfficeItemForAddPositions extends Component {
  static propTypes = {
    ballotItemWeVoteId: PropTypes.string.isRequired,
    ballotItemDisplayName: PropTypes.string.isRequired,
    candidateList: PropTypes.array,
    classes: PropTypes.object,
    organization: PropTypes.object,
    organizationWeVoteId: PropTypes.string,
    theme: PropTypes.object,
    externalUniqueId: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      candidateList: [],
      changeFound: false,
      componentDidMount: false,
      organizationWeVoteId: '',
      showCandidates: true,
    };

    this.getCandidateLink = this.getCandidateLink.bind(this);
    this.getOfficeLink = this.getOfficeLink.bind(this);
    this.goToCandidateLink = this.goToCandidateLink.bind(this);
    this.goToOfficeLink = this.goToOfficeLink.bind(this);
  }

  componentDidMount () {
    this.candidateStoreListener = CandidateStore.addListener(this.onCandidateStoreChange.bind(this));
    this.onCandidateStoreChange();
    const organizationWeVoteId = (this.props.organization && this.props.organization.organization_we_vote_id) ? this.props.organization.organization_we_vote_id : this.props.organizationWeVoteId;
    // console.log('OfficeItemForAddPositions componentDidMount, organizationWeVoteId:', organizationWeVoteId);
    this.setState({
      candidateList: this.props.candidateList,
      organizationWeVoteId,
      componentDidMount: true,
    });
  }

  componentWillReceiveProps (nextProps) {
    const organizationWeVoteId = (nextProps.organization && nextProps.organization.organization_we_vote_id) ? nextProps.organization.organization_we_vote_id : nextProps.organizationWeVoteId;
    // console.log('officeItemCompressed componentWillReceiveProps, organizationWeVoteId:', organizationWeVoteId);
    this.setState({
      candidateList: nextProps.candidateList,
      organizationWeVoteId,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (this.state.componentDidMount !== nextState.componentDidMount) {
      // console.log('this.state.componentDidMount: ', this.state.componentDidMount, ', nextState.componentDidMount: ', nextState.componentDidMount);
      return true;
    }
    if (JSON.stringify(this.state.candidateList) !== JSON.stringify(nextState.candidateList)) {
      console.log('this.state.candidateList:', this.state.candidateList, ', nextState.candidateList:', nextState.candidateList);
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId: ', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId: ', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.changeFound !== nextState.changeFound) {
      // console.log('this.state.changeFound: ', this.state.changeFound, ', nextState.changeFound: ', nextState.changeFound);
      return true;
    }
    if (this.props.ballotItemDisplayName !== nextProps.ballotItemDisplayName) {
      // console.log('this.props.ballotItemDisplayName: ', this.props.ballotItemDisplayName, ', nextProps.ballotItemDisplayName: ', nextProps.ballotItemDisplayName);
      return true;
    }
    if (this.state.showCandidates !== nextState.showCandidates) {
      // console.log('this.state.showCandidates: ', this.state.showCandidates, ', nextState.showCandidates: ', nextState.showCandidates);
      return true;
    }
    // console.log('shouldComponentUpdate no change');
    return false;
  }

  componentWillUnmount () {
    this.candidateStoreListener.remove();
  }

  // See https://reactjs.org/docs/error-boundaries.html
  static getDerivedStateFromError (error) { // eslint-disable-line no-unused-vars
    // Update state so the next render will show the fallback UI, We should have a "Oh snap" page
    return { hasError: true };
  }

  onCandidateStoreChange () {
    const { ballotItemWeVoteId } = this.props;
    const { candidateList } = this.state;
    let changeFound = false;
    if (candidateList && candidateList.length && ballotItemWeVoteId) {
      const newCandidateList = [];
      let newCandidate = {};
      candidateList.forEach((candidate) => {
        if (candidate && candidate.we_vote_id) {
          newCandidate = CandidateStore.getCandidate(candidate.we_vote_id);
          if (newCandidate.ballot_item_display_name && candidate.ballot_item_display_name !== newCandidate.ballot_item_display_name) {
            candidate.ballot_item_display_name = newCandidate.ballot_item_display_name;
            changeFound = true;
          }
          if (newCandidate.candidate_photo_url_medium && candidate.candidate_photo_url_medium !== newCandidate.candidate_photo_url_medium) {
            candidate.candidate_photo_url_medium = newCandidate.candidate_photo_url_medium;
            changeFound = true;
          }
          if (newCandidate.party && candidate.party !== newCandidate.party) {
            candidate.party = newCandidate.party;
            changeFound = true;
          }
          newCandidateList.push(candidate);
        }
      });
      this.setState({
        candidateList: newCandidateList,
        changeFound,
      });
    } else {
      this.setState({
        changeFound,
      });
    }
  }

  getCandidateLink (candidateWeVoteId) {
    if (this.state.organizationWeVoteId) {
      // If there is an organizationWeVoteId, signal that we want to link back to voter_guide for that organization
      return `/candidate/${candidateWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      // If no organizationWeVoteId, signal that we want to link back to default ballot
      return `/candidate/${candidateWeVoteId}/b/btdb/`; // back-to-default-ballot
    }
  }

  getOfficeLink () {
    if (this.state.organizationWeVoteId) {
      // If there is an organizationWeVoteId, signal that we want to link back to voter_guide for that organization
      return `/office/${this.props.ballotItemWeVoteId}/btvg/${this.state.organizationWeVoteId}`;
    } else {
      // If no organizationWeVoteId, signal that we want to link back to default ballot
      return `/office/${this.props.ballotItemWeVoteId}/b/btdb/`; // back-to-default-ballot
    }
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('OfficeItemForAddPositions caught error: ', `${error} with info: `, info);
  }

  goToCandidateLink (candidateWeVoteId) {
    const candidateLink = this.getCandidateLink(candidateWeVoteId);
    historyPush(candidateLink);
  }

  goToOfficeLink () {
    const officeLink = this.getOfficeLink();
    historyPush(officeLink);
  }

  toggleShowCandidates () {
    const { showCandidates } = this.state;
    this.setState({
      showCandidates: !showCandidates,
    });
  }

  render () {
    renderLog('OfficeItemForAddPositions');  // Set LOG_RENDER_EVENTS to log all renders
    let { ballotItemDisplayName } = this.props;
    const { ballotItemWeVoteId, classes, theme, externalUniqueId } = this.props;
    const { candidateList, showCandidates } = this.state;
    ballotItemDisplayName = toTitleCase(ballotItemDisplayName);

    return (
      <div className="card-main office-item" key={`officeItemForAddPositions-${ballotItemWeVoteId}-${externalUniqueId}`}>
        <a // eslint-disable-line
          className="anchor-under-header"
          name={ballotItemWeVoteId}
        />
        <div className="card-main__content">
          {/* Desktop */}
          <div
            id={`officeItemForAddPositionsTopNameLink-${ballotItemWeVoteId}`}
            onClick={() => this.toggleShowCandidates()}
          >
            <Title>
              {ballotItemDisplayName}
              {showCandidates ? (
                <ArrowDropUp
                  classes={{ root: classes.cardHeaderIconRoot }}
                />
              ) :
                (
                  <ArrowDropDown
                    classes={{ root: classes.cardHeaderIconRoot }}
                  />
                )
              }
            </Title>
          </div>
          {/* Display all candidates running for this office */}
          {showCandidates && (
            <Container candidateLength={candidateList.length}>
              { candidateList.map((oneCandidate) => {
                if (!oneCandidate || !oneCandidate.we_vote_id) {
                  return null;
                }
                return (
                  <CandidateInfo
                    brandBlue={theme.palette.primary.main}
                    candidateLength={candidateList.length}
                    id={`officeItemCompressedAddPositions-${oneCandidate.we_vote_id}`}
                    key={`${externalUniqueId}-candidatePreview-${oneCandidate.we_vote_id}`}
                  >
                    <CandidateItemForAddPositions
                      oneCandidate={oneCandidate}
                    />
                  </CandidateInfo>
                );
              })}
            </Container>
          )}
        </div>
      </div>
    );
  }
}

const styles = theme => ({
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

const Container = styled.div`
  display: flex;
  flex-flow: ${({ candidateLength }) => (candidateLength > 2 ? 'row wrap' : 'row')};
  justify-content: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-flow: row wrap;
  }
`;

const Title = styled.div`
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 12px;
  cursor: pointer;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    font-size: 16px;
    margin-bottom: 8px;
  }
`;

const CandidateInfo = styled.div`
  display: flex;
  flex-flow: column;
  padding: 16px 16px 0 16px;
  margin-bottom: 8px;
  overflow-x: hidden;
  transition: all 200ms ease-in;
  border: 1px solid ${({ theme }) => theme.colors.grayBorder};
  width: ${({ candidateLength }) => (candidateLength > 1 ? '48%' : '100%')};
  margin-right: 8px;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    border: 1px solid ${({ theme }) => theme.colors.linkHoverBorder};
    box-shadow: 0 1px 3px 0 rgba(0,0,0,.2), 0 1px 1px 0 rgba(0,0,0,.14), 0 2px 1px -1px rgba(0,0,0,.12);
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    flex-flow: column;
    width: 100%;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    flex-flow: column;
    border: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.grayBorder};
    padding: 16px 0 0 0;
    margin-bottom: 8px;
    width: 100%;
    &:hover {
      border: none;
      border-bottom: 1px solid ${({ theme }) => theme.colors.grayBorder};
      box-shadow: none;
    }
  }
`;

export default withTheme(withStyles(styles)(OfficeItemForAddPositions));
