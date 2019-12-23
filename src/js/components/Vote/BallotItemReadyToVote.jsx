import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTheme } from '../../linaria-theme';
import { renderLog } from '../../utils/logging';
import MeasureItemReadyToVote from './MeasureItemReadyToVote';
import OfficeItemReadyToVote from './OfficeItemReadyToVote';

const TYPES = require('keymirror')({
  OFFICE: null,
  MEASURE: null,
});

class BallotItemReadyToVote extends Component {
  static propTypes = {
    kind_of_ballot_item: PropTypes.string.isRequired,
    we_vote_id: PropTypes.string.isRequired,
    ballot_item_display_name: PropTypes.string.isRequired,
    candidate_list: PropTypes.array,
  };

  isMeasure () {
    return this.props.kind_of_ballot_item === TYPES.MEASURE;
  }

  render () {
    renderLog('BallotItemReadyToVote');  // Set LOG_RENDER_EVENTS to log all renders
    return (
      <React.Fragment>
        { this.isMeasure() ? (
          <MeasureItemReadyToVote
            ballotItemDisplayName={this.props.ballot_item_display_name}
            measureWeVoteId={this.props.we_vote_id}
          />
        ) : (
          <OfficeItemReadyToVote
            candidateList={this.props.candidate_list}
          />
        )}
      </React.Fragment>
    );
  }
}

export default withTheme(BallotItemReadyToVote);
