import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';
import Card from '@material-ui/core/Card';
import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import { withStyles, withTheme } from '@material-ui/core/styles';
import BallotItemSupportOpposeCountDisplay from '../Widgets/BallotItemSupportOpposeCountDisplay';
import { renderLog } from '../../utils/logging';
import MeasureActions from '../../actions/MeasureActions';
import MeasureStore from '../../stores/MeasureStore';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationPositionItem from './OrganizationPositionItem';
import OrganizationStore from '../../stores/OrganizationStore';
import SupportStore from '../../stores/SupportStore';
import { capitalizeString, shortenText } from '../../utils/textFormat';


class VoterGuideMeasureItemCompressed extends Component {
  static propTypes = {
    organizationWeVoteId: PropTypes.string,
    showPositionStatementActionBar: PropTypes.bool,
    // urlWithoutHash: PropTypes.string,
    measureWeVoteId: PropTypes.string.isRequired,
    classes: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      // ballotItemWeVoteId: '',
      componentDidMountFinished: false,
      measureText: '',
      measureWeVoteId: '',
      numberOfOpposePositionsForScore: 0,
      numberOfSupportPositionsForScore: 0,
      organizationWeVoteId: '',
      organizationPositionForMeasure: {},
      organizationPositionForMeasureFound: false,
      showPositionStatement: false,
    };
    this.goToMeasureLink = this.goToMeasureLink.bind(this);
    this.togglePositionStatement = this.togglePositionStatement.bind(this);
  }

  componentDidMount () {
    const { measureWeVoteId, organizationWeVoteId } = this.props;
    // console.log('VoterGuideMeasureItemCompressed onOrganizationStoreChange, organizationWeVoteId: ', organizationWeVoteId, ', measureWeVoteId:', measureWeVoteId);
    const measure = MeasureStore.getMeasure(measureWeVoteId);
    // console.log('componentDidMount, measure:', measure, ', measureWeVoteId: ', measureWeVoteId);
    if (!measure.we_vote_id) {
      MeasureActions.measureRetrieve(measureWeVoteId);
    }
    // if (measureWeVoteId && !BallotStore.positionListHasBeenRetrievedOnce(measureWeVoteId)) {
    //   MeasureActions.positionListForBallotItemPublic(measureWeVoteId); // TODO DALE 2019-09-24
    // }
    if (organizationWeVoteId) {
      const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (!organization.organization_we_vote_id) {
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
      const organizationPositionForMeasure = OrganizationStore.getOrganizationPositionByWeVoteId(organizationWeVoteId, measureWeVoteId);
      const organizationPositionForMeasureFound = !!(organizationPositionForMeasure && organizationPositionForMeasure.position_we_vote_id);
      // console.log('componentDidMount organizationPositionForMeasure:', organizationPositionForMeasure, ', organizationPositionForMeasureFound:', organizationPositionForMeasureFound);
      this.setState({
        organizationPositionForMeasure,
        organizationPositionForMeasureFound,
      });
      // }
      this.setState({
        organization,
      });
    }
    this.setState({
      ballotItemDisplayName: measure.ballot_item_display_name,
      componentDidMountFinished: true,
      measure,
      // measureSubtitle: measure.measure_subtitle,
      measureText: measure.measure_text,
      measureWeVoteId,
      organizationWeVoteId,
    });
    const ballotItemStatSheet = SupportStore.getBallotItemStatSheet(measureWeVoteId);
    if (ballotItemStatSheet) {
      const { numberOfOpposePositionsForScore, numberOfSupportPositionsForScore } = ballotItemStatSheet;
      this.setState({
        numberOfOpposePositionsForScore,
        numberOfSupportPositionsForScore,
      });
    }
    this.measureStoreListener = MeasureStore.addListener(this.onMeasureStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.supportStoreListener = SupportStore.addListener(this.onSupportStoreChange.bind(this));
  }

  componentWillReceiveProps (nextProps) {
    const { measureWeVoteId, organizationWeVoteId } = nextProps;
    const measure = MeasureStore.getMeasure(measureWeVoteId);
    // if (nextProps.measureWeVoteId && !BallotStore.positionListHasBeenRetrievedOnce(nextProps.measureWeVoteId)) {
    //   MeasureActions.positionListForBallotItemPublic(nextProps.measureWeVoteId); // TODO DALE 2019-09-24
    // }
    const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
    if (!organization.organization_we_vote_id) {
      OrganizationActions.organizationRetrieve(organizationWeVoteId);
    }
    this.setState({
      ballotItemDisplayName: measure.ballot_item_display_name,
      measure,
      // measureSubtitle: measure.measure_subtitle,
      measureText: measure.measure_text,
      measureWeVoteId,
      organization,
      organizationWeVoteId,
    });
    const ballotItemStatSheet = SupportStore.getBallotItemStatSheet(measureWeVoteId);
    if (ballotItemStatSheet) {
      const { numberOfOpposePositionsForScore, numberOfSupportPositionsForScore } = ballotItemStatSheet;
      this.setState({
        numberOfOpposePositionsForScore,
        numberOfSupportPositionsForScore,
      });
    }
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.state.componentDidMountFinished === false) {
      // console.log('shouldComponentUpdate: componentDidMountFinished === false');
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId:', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId:', nextState.organizationWeVoteId);
      return true;
    }
    if (this.state.ballotItemDisplayName !== nextState.ballotItemDisplayName) {
      // console.log('this.state.ballotItemDisplayName:', this.state.ballotItemDisplayName, ', nextState.ballotItemDisplayName:', nextState.ballotItemDisplayName);
      return true;
    }
    if (JSON.stringify(this.state.measure) !== JSON.stringify(nextState.measure)) {
      // console.log('this.state.measure:', this.state.measure, ', nextState.measure:', nextState.measure);
      return true;
    }
    if (this.state.organizationPositionForMeasureFound !== nextState.organizationPositionForMeasureFound) {
      // console.log('this.state.organizationPositionForMeasureFound:', this.state.organizationPositionForMeasureFound, ', nextState.organizationPositionForMeasureFound:', nextState.organizationPositionForMeasureFound);
      return true;
    }
    if (this.props.showPositionStatementActionBar !== nextProps.showPositionStatementActionBar) {
      // console.log('this.props.showPositionStatementActionBar change');
      return true;
    }
    if (this.state.showPositionStatement !== nextState.showPositionStatement) {
      // console.log('this.state.showPositionStatement change');
      return true;
    }
    if (this.state.numberOfOpposePositionsForScore !== nextState.numberOfOpposePositionsForScore) {
      // console.log('this.state.numberOfOpposePositionsForScore change');
      return true;
    }
    if (this.state.numberOfSupportPositionsForScore !== nextState.numberOfSupportPositionsForScore) {
      // console.log('this.state.numberOfSupportPositionsForScore change');
      return true;
    }
    // console.log('shouldComponentUpdate no change');
    return false;
  }

  componentWillUnmount () {
    this.measureStoreListener.remove();
    this.organizationStoreListener.remove();
    this.supportStoreListener.remove();
  }

  onMeasureStoreChange () {
    const { measureWeVoteId } = this.state;
    const measure = MeasureStore.getMeasure(measureWeVoteId);
    // console.log('VoterGuideMeasureItemCompressed, onMeasureStoreChange, measure:', measure);
    // if (measureWeVoteId && !BallotStore.positionListHasBeenRetrievedOnce(measureWeVoteId)) {
    //   MeasureActions.positionListForBallotItemPublic(measureWeVoteId); // TODO DALE 2019-09-24
    // }
    this.setState({
      ballotItemDisplayName: measure.ballot_item_display_name,
      measure,
      // measureSubtitle: measure.measure_subtitle,
      measureText: measure.measure_text,
    });
  }

  onSupportStoreChange () {
    const { measureWeVoteId } = this.state;
    // Whenever positions change, we want to make sure to get the latest organization, because it has
    //  position_list_for_one_election and position_list_for_all_except_one_election attached to it
    const ballotItemStatSheet = SupportStore.getBallotItemStatSheet(measureWeVoteId);
    if (ballotItemStatSheet) {
      const { numberOfOpposePositionsForScore, numberOfSupportPositionsForScore } = ballotItemStatSheet;
      this.setState({
        numberOfOpposePositionsForScore,
        numberOfSupportPositionsForScore,
      });
    }
  }

  onOrganizationStoreChange () {
    const { measureWeVoteId, organizationWeVoteId } = this.state;
    // console.log('VoterGuideMeasureItemCompressed onOrganizationStoreChange, organizationWeVoteId: ', organizationWeVoteId, ', measureWeVoteId:', measureWeVoteId);
    if (organizationWeVoteId) {
      const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      const organizationPositionForMeasure = OrganizationStore.getOrganizationPositionByWeVoteId(organizationWeVoteId, measureWeVoteId);
      const organizationPositionForMeasureFound = !!(organizationPositionForMeasure && organizationPositionForMeasure.position_we_vote_id);
      // console.log('organizationPositionForMeasure:', organizationPositionForMeasure, ', organizationPositionForMeasureFound:', organizationPositionForMeasureFound);
      this.setState({
        organization,
        organizationPositionForMeasure,
        organizationPositionForMeasureFound,
      });
    }
  }

  goToMeasureLink (oneMeasureWeVoteId) {
    // We want to update this to open a measure modal
    console.log('goToMeasureLink oneMeasureWeVoteId:', oneMeasureWeVoteId);
  }

  togglePositionStatement () {
    const { showPositionStatement } = this.state;
    this.setState({
      showPositionStatement: !showPositionStatement,
    });
  }

  render () {
    renderLog('VoterGuideMeasureItemCompressed');  // Set LOG_RENDER_EVENTS to log all renders
    let { ballotItemDisplayName } = this.state;
    const { measureText, measureWeVoteId, organization, organizationPositionForMeasure, organizationWeVoteId } = this.state;
    if (!measureWeVoteId) {
      return null;
    }
    const { classes } = this.props;
    let ballotDisplay = [];
    if (ballotItemDisplayName) {
      ballotDisplay = ballotItemDisplayName.split(':');
    }
    // measureSubtitle = capitalizeString(measureSubtitle);
    ballotItemDisplayName = capitalizeString(ballotItemDisplayName);

    return (
      <Card classes={{ root: classes.cardRoot }}>
        <InfoRow>
          <MeasureInfoWrapper onClick={() => { this.goToMeasureLink(measureWeVoteId); }}>
            <Title>
              {ballotDisplay[0]}
              <ArrowForwardIcon
                className="u-show-desktop"
                classes={{ root: classes.cardHeaderIconRoot }}
              />
            </Title>
            <SubTitle>{ballotDisplay[1]}</SubTitle>
            <Info>{shortenText(measureText, 200)}</Info>
          </MeasureInfoWrapper>
          <BallotItemSupportOpposeCountDisplay ballotItemWeVoteId={measureWeVoteId} />
        </InfoRow>
        {organization && organizationPositionForMeasure && organizationPositionForMeasure.position_we_vote_id && (
          <InfoRow>
            {/* Organization Endorsement */}
            <OrganizationPositionItem
              key={organizationPositionForMeasure.position_we_vote_id}
              position={organizationPositionForMeasure}
              organizationWeVoteId={organizationWeVoteId}
              turnOffName
            />
          </InfoRow>
        )}
      </Card>
    );
  }
}

const styles = theme => ({
  cardRoot: {
    padding: '16px 16px 8px 16px',
    [theme.breakpoints.down('lg')]: {
      padding: '16px 16px 0 16px',
    },
  },
  endorsementIconRoot: {
    fontSize: 14,
    margin: '.3rem .3rem 0 .5rem',
  },
  cardHeaderIconRoot: {
    marginTop: '-.3rem',
    fontSize: 20,
  },
  cardFooterIconRoot: {
    fontSize: 14,
    margin: '0 0 .1rem .4rem',
  },
});

const InfoRow = styled.div`
  display: flex;
  flex-flow: row wrap;
  justify-content: space-between;
`;

const MeasureInfoWrapper = styled.div`
  display: flex;
  flex-flow: column;
  max-width: 75%;
  cursor: pointer;
  user-select: none;
  padding-right: 8px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    max-width: 70%;
  }
`;

const Title = styled.h1`
  font-size: 18px;
  font-weight: bold;
  margin: .1rem 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 16px;
  }
`;

const SubTitle = styled.h3`
  font-size: 16px;
  font-weight: 300;
  color: #555;
  margin-top: .6rem;
  width: 135%;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    font-size: 13px;
  }
`;

const Info = styled.p`
  font-size: 13px;
  font-weight: 300;
  color: #777;
  width: 135%;
`;

export default withTheme(withStyles(styles)(VoterGuideMeasureItemCompressed));
