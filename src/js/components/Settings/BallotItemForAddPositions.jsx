import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';
import { withStyles, withTheme } from '@material-ui/core';
import { renderLog } from '../../utils/logging';
import MeasureItemForAddPositions from './MeasureItemForAddPositions';
import OfficeItemForAddPositions from './OfficeItemForAddPositions';


class BallotItemForAddPositions extends Component {
  static propTypes = {
    allBallotItemsCount: PropTypes.number,
    ballotItemDisplayName: PropTypes.string.isRequired,
    ballotItemWeVoteId: PropTypes.string.isRequired,
    candidateList: PropTypes.array,
    kindOfBallotItem: PropTypes.string.isRequired,
    measureText: PropTypes.string,
    organization: PropTypes.object,
    organizationWeVoteId: PropTypes.string,
    externalUniqueId: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      candidateListCount: 0,
      kindOfBallotItem: '',
      measureText: '',
    };
  }

  componentDidMount () {
    // console.log('componentDidMount, this.props.candidateList', this.props.candidateList);
    // console.log('componentDidMount, this.props.kindOfBallotItem', this.props.kindOfBallotItem);
    const candidateList = this.props.candidateList || [];
    const candidateListCount = candidateList.length;
    const organizationWeVoteId = (this.props.organization && this.props.organization.organization_we_vote_id) ? this.props.organization.organization_we_vote_id : this.props.organizationWeVoteId;
    this.setState({
      ballotItemWeVoteId: this.props.ballotItemWeVoteId,
      ballotItemDisplayName: this.props.ballotItemDisplayName,
      candidateList,
      candidateListCount,
      kindOfBallotItem: this.props.kindOfBallotItem,
      measureText: this.props.measureText,
      organizationWeVoteId,
      organization: this.props.organization,
    });
  }

  componentWillReceiveProps (nextProps) {
    // console.log('componentDidMount, nextProps.candidateList', nextProps.candidateList);
    // console.log('componentDidMount, nextProps.kindOfBallotItem', nextProps.kindOfBallotItem);
    const candidateList = nextProps.candidateList || [];
    const candidateListCount = candidateList.length;
    const organizationWeVoteId = (nextProps.organization && nextProps.organization.organization_we_vote_id) ? nextProps.organization.organization_we_vote_id : nextProps.organizationWeVoteId;
    this.setState({
      ballotItemWeVoteId: nextProps.ballotItemWeVoteId,
      ballotItemDisplayName: nextProps.ballotItemDisplayName,
      candidateList,
      candidateListCount,
      kindOfBallotItem: nextProps.kindOfBallotItem,
      measureText: nextProps.measureText,
      organizationWeVoteId,
      organization: nextProps.organization,
    });
  }

  shouldComponentUpdate (nextProps, nextState) {
    // This lifecycle method tells the component to NOT render if componentWillReceiveProps didn't see any changes
    if (this.props.allBallotItemsCount !== nextProps.allBallotItemsCount) {
      // console.log('this.props.allBallotItemsCount:', this.props.allBallotItemsCount, ', nextProps.allBallotItemsCount:', nextProps.allBallotItemsCount);
      return true;
    }
    if (this.props.ballotItemWeVoteId !== nextProps.ballotItemWeVoteId) {
      // console.log('this.props.ballotItemWeVoteId:', this.props.ballotItemWeVoteId, ', nextProps.ballotItemWeVoteId:', nextProps.ballotItemWeVoteId);
      return true;
    }
    if (this.props.externalUniqueId !== nextProps.externalUniqueId) {
      // console.log('this.props.externalUniqueId:', this.props.externalUniqueId, ', nextProps.externalUniqueId:', nextProps.externalUniqueId);
      return true;
    }
    if (this.state.candidateListCount !== nextState.candidateListCount) {
      // console.log('this.state.candidateListCount:', this.state.candidateListCount, ', nextState.candidateListCount:', nextState.candidateListCount);
      return true;
    }
    if (this.state.kindOfBallotItem !== nextState.kindOfBallotItem) {
      // console.log('this.state.kindOfBallotItem:', this.state.kindOfBallotItem, ', nextState.kindOfBallotItem:', nextState.kindOfBallotItem);
      return true;
    }
    if (this.state.organizationWeVoteId !== nextState.organizationWeVoteId) {
      // console.log('this.state.organizationWeVoteId:', this.state.organizationWeVoteId, ', nextState.organizationWeVoteId:', nextState.organizationWeVoteId);
      return true;
    }
    // console.log('shouldComponentUpdate no change');
    return false;
  }

  isMeasure () {
    const { kindOfBallotItem } = this.state;
    if (kindOfBallotItem === 'MEASURE') {
      // console.log('isMeasure, kindOfBallotItem:', kindOfBallotItem, ', TRUE');
      return true;
    } else {
      // console.log('isMeasure, kindOfBallotItem:', kindOfBallotItem, ', FALSE');
      return false;
    }
  }

  render () {
    renderLog('BallotItemForAddPositions');  // Set LOG_RENDER_EVENTS to log all renders
    const { ballotItemDisplayName, ballotItemWeVoteId, candidateList, kindOfBallotItem, measureText, organization, organizationWeVoteId } = this.state;
    const { externalUniqueId } = this.props;
    if (!kindOfBallotItem) {
      // console.log('No value in kindOfBallotItem: ', kindOfBallotItem, ', for ballotItemDisplayName: ', ballotItemDisplayName, ', ballotItemWeVoteId:', ballotItemWeVoteId);
      return null;
    }
    return (
      <BallotItemCard className="BallotItem card" key={`ballotItemForAddPositions-${ballotItemWeVoteId}-${externalUniqueId}`}>
        { this.isMeasure() ? (
          <MeasureItemForAddPositions
            ballotItemDisplayName={ballotItemDisplayName}
            ballotItemWeVoteId={ballotItemWeVoteId}
            measureText={measureText}
            key={`measureItem-${externalUniqueId}`}
            organization={organization}
            externalUniqueId={`measureItem-${externalUniqueId}`}
          />
        ) : (
          <OfficeItemForAddPositions
            ballotItemWeVoteId={ballotItemWeVoteId}
            ballotItemDisplayName={ballotItemDisplayName}
            candidateList={candidateList}
            key={`officeItem-${externalUniqueId}`}
            organization={organization}
            organizationWeVoteId={organizationWeVoteId}
            ref={(ref) => { this.ballotItem = ref; }}
            externalUniqueId={`officeItem-${externalUniqueId}`}
          />
        )}
      </BallotItemCard>
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

// Dale to update when I have time to work out the kinks
const BallotItemCard = styled.div`
  $item-padding: 16px;
  background-color: #fff;
  border-radius: 4px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, .2), 0 1px 1px 0 rgba(0, 0, 0, .14), 0 2px 1px -1px rgba(0, 0, 0, .12);
  margin-bottom: 16px;
  overflow-y: none;
  border: none;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    border-radius: 0;
  }
`;

export default withTheme(withStyles(styles)(BallotItemForAddPositions));
