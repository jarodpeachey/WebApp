import React, { Component } from 'react';
import styled from 'styled-components';
import PropTypes from 'prop-types';
import Tooltip from '@material-ui/core/Tooltip';
import { withStyles } from '@material-ui/core/styles';
import SettingsIcon from '@material-ui/icons/Settings';
import { isCordova, isIOsSmallerThanPlus, isIPad } from '../../utils/cordovaUtils';
import ShareButtonDesktopTablet from '../../components/Share/ShareButtonDesktopTablet';
import DelayedLoad from '../../components/Widgets/DelayedLoad';
import { shortenText } from '../../utils/textFormat';
// import webAppConfig from '../../config';

/* eslint-disable no-nested-ternary */


class BallotTitleHeader extends Component {
  static propTypes = {
    electionName: PropTypes.string,
    electionDayTextObject: PropTypes.object,
    scrolled: PropTypes.bool,
    toggleSelectBallotModal: PropTypes.func,
    classes: PropTypes.object,
  };

  render () {
    // const nextReleaseFeaturesEnabled = webAppConfig.ENABLE_NEXT_RELEASE_FEATURES === undefined ? false : webAppConfig.ENABLE_NEXT_RELEASE_FEATURES;
    const { classes, electionName, electionDayTextObject, scrolled } = this.props;

    if (isCordova() && isIOsSmallerThanPlus() && electionName) {
      return (
        <h1 className="ballot__header__title__cordova">
          <div className="ballot__header__title__cordova-text">
            <span>
              {shortenText(electionName, 26)}
              {!electionDayTextObject && (
                <DelayedLoad waitBeforeShow={1000}>
                  <>
                    {' '}
                    Not Found
                  </>
                </DelayedLoad>
              )}
            </span>
            {electionDayTextObject && (
              <>
                {' '}
                <span className="u-gray-mid u-no-break">{electionDayTextObject}</span>
              </>
            )}
          </div>
        </h1>
      );
    } else if (isCordova() && electionName) {
      return (
        <Wrapper scrolled={scrolled} ipad={isIPad()}>
          <Title>
            <ElectionName scrolled={scrolled}>
              <span className="u-show-mobile-iphone5-or-smaller">
                {shortenText(electionName, 26)}
              </span>
              <span className="u-show-mobile-bigger-than-iphone5">
                {shortenText(electionName, 30)}
              </span>
              <span className="u-show-desktop-tablet">
                {electionName}
              </span>
              {!electionDayTextObject && (
                <DelayedLoad waitBeforeShow={1000}>
                  <>
                    {' '}
                    Not Found
                  </>
                </DelayedLoad>
              )}
            </ElectionName>
            {electionDayTextObject && (
              <>
                {' '}
                <span className="d-none d-sm-inline">&mdash;</span>
                {' '}
                <ElectionDate scrolled={scrolled}
                              className="u-gray-mid u-no-break"
                >
                  {electionDayTextObject}
                </ElectionDate>
              </>
            )}
          </Title>
          {electionDayTextObject && (
            <ShareButtonWrapper>
              <ShareButtonDesktopTablet />
            </ShareButtonWrapper>
          )}
        </Wrapper>
      );
    } else if (electionName) {
      return (
        <Wrapper>
          <Tooltip title="Change my election" aria-label="Change Election" classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }}>
            <Title onClick={this.props.toggleSelectBallotModal} id="ballotTitleHeaderSelectBallotModal">
              <ElectionName scrolled={scrolled}>
                <span className="u-show-mobile-iphone5-or-smaller">
                  {shortenText(electionName, 22)}
                </span>
                <span className="u-show-mobile-bigger-than-iphone5">
                  {shortenText(electionName, 30)}
                </span>
                <span className="u-show-desktop-tablet">
                  {electionName}
                </span>
                <SettingsIconWrapper>
                  <SettingsIcon classes={{ root: classes.settingsIcon }} />
                </SettingsIconWrapper>
                {!electionDayTextObject && (
                  <DelayedLoad waitBeforeShow={1000}>
                    <>
                      {' '}
                      Not Found
                    </>
                  </DelayedLoad>
                )}
              </ElectionName>
              {electionDayTextObject && (
                <>
                  {' '}
                  <DelayedLoad waitBeforeShow={1000}>
                    <span className="d-none d-sm-inline">&mdash;</span>
                  </DelayedLoad>
                  {' '}
                  <ElectionDate>{electionDayTextObject}</ElectionDate>
                </>
              )}
            </Title>
          </Tooltip>
          {electionDayTextObject && (
            <ShareButtonWrapper>
              <ShareButtonDesktopTablet />
            </ShareButtonWrapper>
          )}
        </Wrapper>
      );
    } else {
      return (
        <span className="u-push--sm" onClick={this.props.toggleSelectBallotModal} id="ballotTitleHeaderSelectBallotModalLoadingElection">
          Choose Election...
          <SettingsIconWrapper>
            <SettingsIcon classes={{ root: classes.settingsIcon }} />
          </SettingsIconWrapper>
        </span>
      );
    }
  }
}

const styles = {
  settingsIcon: {
    color: '#999',
    marginTop: '-5px',
    marginLeft: '3px',
    width: 16,
    height: 16,
  },
  tooltipPlacementBottom: {
    marginTop: 0,
  },
};

const Wrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  margin-top: ${props => (props.ipad ? '12px' : (props.scrolled ? '12px' : 0))};
`;

const Title = styled.h1`
  cursor: pointer;
  margin: 0;
  @media (min-width: 576px) {

  }
`;

const ElectionName = styled.span`
  font-size: 16px;
  font-weight: bold;
  @media (min-width: 576px) {
    font-size: 16px;
    font-weight: bold;
  }
`;

const ElectionDate = styled.span`
  font-size: 14px;
  @media (min-width: 576px) {
    font-size: 16px;
  }
`;

const SettingsIconWrapper = styled.span`
`;

const ShareButtonWrapper = styled.div`
  display: none;
  margin-left: auto;
  margin-top: 4px;
  @media (min-width: 576px) {
    display: block;
  }
`;

export default withStyles(styles)(BallotTitleHeader);
