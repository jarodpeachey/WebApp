import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withTheme, withStyles } from '@material-ui/core/styles';
import ArrowDropDown from '@material-ui/icons/ArrowDropDown';
import ArrowDropUp from '@material-ui/icons/ArrowDropUp';
import { renderLog } from '../../utils/logging';


class ShowMoreButtons extends React.Component {
  static propTypes = {
    classes: PropTypes.object,
    showMoreId: PropTypes.string.isRequired,
    showMoreButtonsLink: PropTypes.func.isRequired,
    showMoreButtonWasClicked: PropTypes.bool,
  };

  render () {
    renderLog('ShowMoreButtons');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes, showMoreId, showMoreButtonsLink, showMoreButtonWasClicked } = this.props;
    let showMoreText;

    if (showMoreButtonWasClicked) {
      showMoreText = 'show less';
    } else {
      showMoreText = 'show more';
    }

    return (
      <ShowMoreButtonsStyled className="card-child" id={showMoreId} onClick={showMoreButtonsLink}>
        <ShowMoreButtonsText>
          { showMoreText }
          {' '}
          {showMoreButtonWasClicked ? (
            <ArrowDropUp
              classes={{ root: classes.cardFooterIconRoot }}
            />
          ) : (
            <ArrowDropDown
              classes={{ root: classes.cardFooterIconRoot }}
            />
          )}
        </ShowMoreButtonsText>
      </ShowMoreButtonsStyled>
    );
  }
}

const styles = theme => ({
  cardFooterIconRoot: {
    fontSize: 30,
    marginBottom: '.2rem',
    [theme.breakpoints.down('sm')]: {
      fontSize: 18,
    },
  },
});

const ShowMoreButtonsStyled = styled.div`
  border: 0px !important;
  color: #999;
  cursor: pointer;
  display: block !important;
  background: #fff !important;
  font-size: 12px;
  margin-bottom: 0px !important;
  margin-top: 0px !important;
  padding: 0px !important;
  text-align: center !important;
  user-select: none;
  @media (min-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 18px;
  }
  &:hover {
    background-color: rgba(46, 60, 93, 0.15) !important;
    transition-duration: .2s;
  }
  @media print{
    display: none;
  }
`;

const ShowMoreButtonsText = styled.div`
  margin-top: 8px !important;
  padding: 0px !important;
  text-align: center !important;
  &:hover {
    text-decoration: underline;
  }
`;

export default withTheme(withStyles(styles)(ShowMoreButtons));



