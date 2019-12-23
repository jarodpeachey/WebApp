import React, { Component } from 'react';
import PropTypes from 'prop-types';
import ReactSVG from 'react-svg';
import CheckCircle from '@material-ui/icons/CheckCircle';
import InfoIcon from '@material-ui/icons/Info';
import ThumbDownIcon from '@material-ui/icons/ThumbDown';
import ThumbUpIcon from '@material-ui/icons/ThumbUp';
import { withStyles, withTheme } from '@material-ui/core/styles';
import { styled } from 'linaria/react';
import FollowToggle from './FollowToggle';
import IssueStore from '../../stores/IssueStore';
import OrganizationStore from '../../stores/OrganizationStore';
import { cordovaDot } from '../../utils/cordovaUtils';
import { isOrganizationInVotersNetwork } from '../../utils/positionFunctions';

class PositionItemScorePopover extends Component {
  static propTypes = {
    classes: PropTypes.object,
    positionItem: PropTypes.object.isRequired,
  };

  constructor (props) {
    super(props);
    this.state = {
      ballotItemDisplayName: '',
      issuesInCommonBetweenOrganizationAndVoter: [],
      issuesInCommonBetweenOrganizationAndVoterLength: 0,
      organizationInVotersNetwork: false,
      organizationOpposes: false,
      organizationSupports: false,
      organizationWeVoteId: '',
      speakerDisplayName: '',
      voterFollowingThisOrganization: false,
    };
  }

  componentDidMount () {
    this.issueStoreListener = IssueStore.addListener(this.onIssueStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    const { positionItem } = this.props;
    if (positionItem) {
      const {
        ballot_item_display_name: ballotItemDisplayName,
        is_information_only: organizationProvidingInformationOnly,
        is_oppose_or_negative_rating: organizationOpposes,
        is_support_or_positive_rating: organizationSupports,
        speaker_display_name: speakerDisplayName,
        speaker_we_vote_id: organizationWeVoteId,
      } = positionItem;

      const issuesInCommonBetweenOrganizationAndVoter = IssueStore.getIssuesInCommonBetweenOrganizationAndVoter(organizationWeVoteId) || [];
      const issuesInCommonBetweenOrganizationAndVoterLength = issuesInCommonBetweenOrganizationAndVoter.length;
      const organizationInVotersNetwork = isOrganizationInVotersNetwork(organizationWeVoteId);
      const voterFollowingThisOrganization = OrganizationStore.isVoterFollowingThisOrganization(organizationWeVoteId);
      this.setState({
        ballotItemDisplayName,
        issuesInCommonBetweenOrganizationAndVoter,
        issuesInCommonBetweenOrganizationAndVoterLength,
        organizationInVotersNetwork,
        organizationProvidingInformationOnly,
        organizationOpposes,
        organizationSupports,
        organizationWeVoteId,
        speakerDisplayName,
        voterFollowingThisOrganization,
      });
    }
  }

  componentWillReceiveProps (nextProps) {
    // console.log('componentWillReceiveProps, nextProps: ', nextProps);
    const { positionItem } = nextProps;
    if (positionItem) {
      const {
        ballot_item_display_name: ballotItemDisplayName,
        is_oppose_or_negative_rating: organizationOpposes,
        is_support_or_positive_rating: organizationSupports,
        speaker_display_name: speakerDisplayName,
        speaker_we_vote_id: organizationWeVoteId,
      } = positionItem;

      const issuesInCommonBetweenOrganizationAndVoter = IssueStore.getIssuesInCommonBetweenOrganizationAndVoter(organizationWeVoteId) || [];
      const issuesInCommonBetweenOrganizationAndVoterLength = issuesInCommonBetweenOrganizationAndVoter.length;
      const organizationInVotersNetwork = isOrganizationInVotersNetwork(organizationWeVoteId);
      const voterFollowingThisOrganization = OrganizationStore.isVoterFollowingThisOrganization(organizationWeVoteId);
      this.setState({
        ballotItemDisplayName,
        issuesInCommonBetweenOrganizationAndVoter,
        issuesInCommonBetweenOrganizationAndVoterLength,
        organizationInVotersNetwork,
        organizationOpposes,
        organizationSupports,
        organizationWeVoteId,
        speakerDisplayName,
        voterFollowingThisOrganization,
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if not needed
    if (this.state.ballotItemDisplayName !== nextState.ballotItemDisplayName) {
      // console.log('this.state.ballotItemDisplayName: ', this.state.ballotItemDisplayName, ', nextState.ballotItemDisplayName', nextState.ballotItemDisplayName);
      return true;
    }
    if (this.state.issuesInCommonBetweenOrganizationAndVoterLength !== nextState.issuesInCommonBetweenOrganizationAndVoterLength) {
      // console.log('this.state.issuesInCommonBetweenOrganizationAndVoterLength: ', this.state.issuesInCommonBetweenOrganizationAndVoterLength, ', nextState.issuesInCommonBetweenOrganizationAndVoterLength', nextState.issuesInCommonBetweenOrganizationAndVoterLength);
      return true;
    }
    if (this.state.organizationInVotersNetwork !== nextState.organizationInVotersNetwork) {
      // console.log('this.state.organizationInVotersNetwork: ', this.state.organizationInVotersNetwork, ', nextState.organizationInVotersNetwork', nextState.organizationInVotersNetwork);
      return true;
    }
    if (this.state.organizationOpposes !== nextState.organizationOpposes) {
      // console.log('this.state.organizationOpposes: ', this.state.organizationOpposes, ', nextState.organizationOpposes', nextState.organizationOpposes);
      return true;
    }
    if (this.state.organizationSupports !== nextState.organizationSupports) {
      // console.log('this.state.organizationSupports: ', this.state.organizationSupports, ', nextState.organizationSupports', nextState.organizationSupports);
      return true;
    }
    if (this.state.speakerDisplayName !== nextState.speakerDisplayName) {
      // console.log('this.state.speakerDisplayName: ', this.state.speakerDisplayName, ', nextState.speakerDisplayName', nextState.speakerDisplayName);
      return true;
    }
    if (this.state.voterFollowingThisOrganization !== nextState.voterFollowingThisOrganization) {
      // console.log('this.state.voterFollowingThisOrganization: ', this.state.voterFollowingThisOrganization, ', nextState.voterFollowingThisOrganization', nextState.voterFollowingThisOrganization);
      return true;
    }
    return false;
  }

  componentWillUnmount () {
    this.issueStoreListener.remove();
    this.organizationStoreListener.remove();
  }

  onIssueStoreChange () {
    const { organizationWeVoteId } = this.state;
    const issuesInCommonBetweenOrganizationAndVoter = IssueStore.getIssuesInCommonBetweenOrganizationAndVoter(organizationWeVoteId) || [];
    const organizationInVotersNetwork = isOrganizationInVotersNetwork(organizationWeVoteId);
    this.setState({
      issuesInCommonBetweenOrganizationAndVoter,
      organizationInVotersNetwork,
    });
  }

  onOrganizationStoreChange () {
    const { organizationWeVoteId } = this.state;
    const issuesInCommonBetweenOrganizationAndVoter = IssueStore.getIssuesInCommonBetweenOrganizationAndVoter(organizationWeVoteId) || [];
    const organizationInVotersNetwork = isOrganizationInVotersNetwork(organizationWeVoteId);
    const voterFollowingThisOrganization = OrganizationStore.isVoterFollowingThisOrganization(organizationWeVoteId);
    this.setState({
      issuesInCommonBetweenOrganizationAndVoter,
      organizationInVotersNetwork,
      voterFollowingThisOrganization,
    });
  }

  render () {
    const { classes, positionItem } = this.props;
    // console.log('PositionItemScorePopover render, positionItem:', positionItem);
    if (!positionItem) {
      return null;
    }
    const {
      ballotItemDisplayName, issuesInCommonBetweenOrganizationAndVoter, organizationInVotersNetwork,
      organizationProvidingInformationOnly, organizationOpposes, organizationSupports, organizationWeVoteId,
      speakerDisplayName, voterFollowingThisOrganization,
    } = this.state;
    return (
      <PopoverWrapper>
        <PopoverHeader>
          <PopoverTitleText>
            {speakerDisplayName}
            &rsquo;s Opinion
          </PopoverTitleText>
        </PopoverHeader>
        <PopoverDescriptionText>
          <PositionSummaryWrapper>
            {organizationSupports && !organizationInVotersNetwork && (
              <SupportButNotPartOfScore>
                <ThumbUpIcon classes={{ root: classes.endorsementIcon }} />
              </SupportButNotPartOfScore>
            )}
            {organizationSupports && organizationInVotersNetwork && (
              <SupportAndPartOfScore>
                +1
              </SupportAndPartOfScore>
            )}
            {organizationOpposes && !organizationInVotersNetwork && (
              <OpposeButNotPartOfScore>
                <ThumbDownIcon classes={{ root: classes.endorsementIcon }} />
              </OpposeButNotPartOfScore>
            )}
            {organizationOpposes && organizationInVotersNetwork && (
              <OpposeAndPartOfScore>
                -1
              </OpposeAndPartOfScore>
            )}
            {organizationProvidingInformationOnly && (
              <InformationOnly>
                <InfoIcon classes={{ root: classes.informationOnlyIcon }} />
              </InformationOnly>
            )}
            <OrganizationSupportsOrOpposesText>
              {speakerDisplayName}
              {' '}
              {organizationSupports && (
                <span>
                  supports
                  {' '}
                  {ballotItemDisplayName}
                  .
                </span>
              )}
              {organizationOpposes && (
                <span>
                  opposes
                  {' '}
                  {ballotItemDisplayName}
                  .
                </span>
              )}
              {organizationProvidingInformationOnly && (
                <span>
                  has this commentary, but no endorsement.
                </span>
              )}
            </OrganizationSupportsOrOpposesText>
          </PositionSummaryWrapper>
          {organizationInVotersNetwork ? (
            <>
              <OrganizationAddsToYourPersonalScoreExplanation>
                This opinion
                {' '}
                {organizationSupports && (
                  <span>
                    adds +1 to your personal score because:
                  </span>
                )}
                {organizationOpposes && (
                  <span>
                    subtracts -1 from your personal score because:
                  </span>
                )}
              </OrganizationAddsToYourPersonalScoreExplanation>
              {voterFollowingThisOrganization && (
                <ScoreExplanationWrapper>
                  <CheckCircle className="following-icon" />
                  <ScoreExplanationText>
                    You follow
                    {' '}
                    {speakerDisplayName}
                  </ScoreExplanationText>
                </ScoreExplanationWrapper>
              )}
              {issuesInCommonBetweenOrganizationAndVoter.map(issue => (
                <ScoreExplanationWrapper key={`issueInScore-${issue.issue_we_vote_id}`}>
                  <PopoverTitleIcon>
                    <ReactSVG
                      src={cordovaDot(`/img/global/svg-icons/issues/${issue.issue_icon_local_path}.svg`)}
                      svgStyle={{ fill: '#555', padding: '1px 1px 1px 0px' }}
                    />
                  </PopoverTitleIcon>
                  <ScoreExplanationText>
                    You both care about
                    {' '}
                    {issue.issue_name}
                  </ScoreExplanationText>
                </ScoreExplanationWrapper>
              ))}
            </>
          ) : (
            <>
              <FollowOrganizationText>
                Follow
                {' '}
                <strong>
                  {speakerDisplayName}
                </strong>
                {' '}
                {organizationSupports && (
                  <span>
                    to add +1 to your personal score.
                  </span>
                )}
                {organizationOpposes && (
                  <span>
                    to subtract -1 from your personal score.
                  </span>
                )}
                {organizationProvidingInformationOnly && (
                  <span>
                    to see more of their opinions.
                  </span>
                )}
              </FollowOrganizationText>
              <FollowOrganizationToggleContainer>
                <FollowToggle organizationWeVoteId={organizationWeVoteId} lightModeOn hideDropdownButtonUntilFollowing />
              </FollowOrganizationToggleContainer>
            </>
          )}
        </PopoverDescriptionText>
      </PopoverWrapper>
    );
  }
}

const styles = () => ({
  endorsementIcon: {
    width: 12,
    height: 12,
  },
  informationOnlyIcon: {
    width: 16,
    height: 16,
  },
});

const FollowOrganizationText = styled.div`
  margin-top: 10px;
`;

const FollowOrganizationToggleContainer = styled.div`
  margin-top: 10px;
`;

const OrganizationSupportsOrOpposesText = styled.div`
`;

const PopoverWrapper = styled.div`
  overflow-x: hidden;
  width: 100%;
  height: 100%;
  position: relative;
  right: 12px;
  bottom: 8px;
  border-radius: 3px;
  margin-left: 12px;
  margin-top: 8px;
`;

const OrganizationAddsToYourPersonalScoreExplanation = styled.div`
  color: #999;
  font-weight: 200;
  margin-top: 4px;
`;

const PositionSummaryWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
`;

const PopoverHeader = styled.div`
  background: ${({ theme }) => theme.colors.brandBlue};
  padding: 4px 8px;
  min-height: 35px;
  color: white;
  display: flex;
  justify-content: flex-start;
  align-items: center;
  border-radius: 4px;
  border-bottom-right-radius: 0;
  border-bottom-left-radius: 0;
`;

const PopoverTitleIcon = styled.span`
  font-weight: bold;
  font-size: 16px;
`;

const PopoverTitleText = styled.div`
  font-size: 14px;
  font-weight: bold;
  margin-left: 8px;
  margin-right: 20px;
`;

const PopoverDescriptionText = styled.div`
  padding: 8px;
`;

const ScoreExplanationWrapper = styled.div`
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  margin-top: 6px;
`;

const ScoreExplanationText = styled.div`
  margin-left: 4px;
`;

const SupportAndPartOfScore = styled.div`
  color: white;
  background: ${({ theme }) => theme.colors.supportGreenRgb};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: right;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
  @media print{
    border: 2px solid grey;
  }
`;

const OpposeAndPartOfScore = styled.div`
  color: white;
  background: ${({ theme }) => theme.colors.opposeRedRgb};
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: right;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
  @media print{
    border: 2px solid grey;
  }
`;

const SupportButNotPartOfScore = styled.div`
  color: ${({ theme }) => theme.colors.supportGreenRgb};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  border: 2px solid ${({ theme }) => theme.colors.supportGreenRgb};
  float: left;
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
`;

const OpposeButNotPartOfScore = styled.div`
  color: ${({ theme }) => theme.colors.opposeRedRgb};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: left;
  border: 2px solid ${({ theme }) => theme.colors.opposeRedRgb};
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
`;

const InformationOnly = styled.div`
  color: ${({ theme }) => theme.colors.grayMid};
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  min-width: 20px;
  height: 20px;
  border-radius: 5px;
  float: left;
  border: 2px solid ${({ theme }) => theme.colors.grayMid};
  font-size: 10px;
  font-weight: bold;
  margin-right: 6px;
`;

export default withTheme(withStyles(styles)(PositionItemScorePopover));
