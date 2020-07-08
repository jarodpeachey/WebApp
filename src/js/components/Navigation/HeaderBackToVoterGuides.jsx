import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import { withStyles } from '@material-ui/core/styles';
import AppBar from '@material-ui/core/AppBar';
import Button from '@material-ui/core/Button';
import Toolbar from '@material-ui/core/Toolbar';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import PlaceIcon from '@material-ui/icons/Place';
import AppStore from '../../stores/AppStore';
import AppActions from '../../actions/AppActions';
import BallotStore from '../../stores/BallotStore';
import cookies from '../../utils/cookies';
import { isCordova, isWebApp, historyPush } from '../../utils/cordovaUtils';
import EndorsementModeTabs from './EndorsementModeTabs';
import HeaderBackToButton from './HeaderBackToButton';
import HeaderBarProfilePopUp from './HeaderBarProfilePopUp';
import isMobile from '../../utils/isMobile';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import { renderLog } from '../../utils/logging';
import {
  isProperlyFormattedVoterGuideWeVoteId,
  shortenText,
  stringContains,
} from '../../utils/textFormat';
import SignInModal from '../Widgets/SignInModal';
import VoterGuideActions from '../../actions/VoterGuideActions';
import VoterGuideChooseElectionModal from '../VoterGuide/VoterGuideChooseElectionModal';
import VoterSessionActions from '../../actions/VoterSessionActions';
import VoterStore from '../../stores/VoterStore';
import VoterGuideStore from '../../stores/VoterGuideStore';
import { voterPhoto } from '../../utils/voterPhoto';

class HeaderBackToVoterGuides extends Component {
  static propTypes = {
    classes: PropTypes.object,
    location: PropTypes.object,
    params: PropTypes.object.isRequired,
    pathname: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      profilePopUpOpen: false,
      showNewVoterGuideModal: false,
      showSignInModal: false,
      voter: {},
      voterFirstName: '',
      voterIsSignedIn: false,
    };
    this.toggleAccountMenu = this.toggleAccountMenu.bind(this);
    this.hideAccountMenu = this.hideAccountMenu.bind(this);
    this.hideProfilePopUp = this.hideProfilePopUp.bind(this);
    this.signOutAndHideProfilePopUp = this.signOutAndHideProfilePopUp.bind(this);
    this.toggleProfilePopUp = this.toggleProfilePopUp.bind(this);
    this.toggleSignInModal = this.toggleSignInModal.bind(this);
    this.toggleVoterGuideModal = this.toggleVoterGuideModal.bind(this);
    this.transitionToYourVoterGuide = this.transitionToYourVoterGuide.bind(this);
  }

  componentDidMount () {
    // console.log('HeaderBackToVoterGuides componentDidMount, this.props: ', this.props);
    this.setState({
      voterGuideWeVoteId: this.props.params.voter_guide_we_vote_id,
    });
    let voterGuide;
    if (this.state.voterGuideWeVoteId && isProperlyFormattedVoterGuideWeVoteId(this.state.voterGuideWeVoteId)) {
      voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(this.state.voterGuideWeVoteId);
      if (voterGuide && voterGuide.we_vote_id) {
        this.setState({
          voterGuide,
        });
      }
    }
    this.onVoterStoreChange();
    this.onOrganizationStoreChange();
    this.onBallotStoreChange();
    this.appStoreListener = AppStore.addListener(this.onAppStoreChange.bind(this));
    this.ballotStoreListener = BallotStore.addListener(this.onBallotStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));

    // let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (this.props.params) {
      organizationWeVoteId = this.props.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log('organizationWeVoteId: ', organizationWeVoteId);
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    const weVoteBrandingOffFromUrl = this.props.location.query ? this.props.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    this.setState({
      showNewVoterGuideModal: AppStore.showNewVoterGuideModal(),
      showSignInModal: AppStore.showSignInModal(),
      voter,
      voterFirstName,
      voterIsSignedIn,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
    });
  }

  // eslint-disable-next-line camelcase,react/sort-comp
  UNSAFE_componentWillReceiveProps (nextProps) {
    // WARN: Warning: componentWillReceiveProps has been renamed, and is not recommended for use. See https://fb.me/react-unsafe-component-lifecycles for details.
    // console.log('HeaderBackToVoterGuides componentWillReceiveProps, nextProps: ', nextProps);
    // let officeName;
    let organization = {};
    let organizationWeVoteId;
    if (nextProps.params) {
      organizationWeVoteId = nextProps.params.organization_we_vote_id || '';
      organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      if (organizationWeVoteId && organizationWeVoteId !== '' && !organization.organization_we_vote_id) {
        // Retrieve the organization object
        OrganizationActions.organizationRetrieve(organizationWeVoteId);
      }
    }

    // console.log('organizationWeVoteId: ', organizationWeVoteId);

    const weVoteBrandingOffFromUrl = nextProps.location.query ? nextProps.location.query.we_vote_branding_off : 0;
    const weVoteBrandingOffFromCookie = cookies.getItem('we_vote_branding_off');
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    this.setState({
      voter,
      voterFirstName,
      voterIsSignedIn,
      we_vote_branding_off: weVoteBrandingOffFromUrl || weVoteBrandingOffFromCookie,
      voterGuideWeVoteId: nextProps.params.voter_guide_we_vote_id,
    });

    let voterGuide;
    if (nextProps.params.voter_guide_we_vote_id && isProperlyFormattedVoterGuideWeVoteId(nextProps.params.voter_guide_we_vote_id)) {
      voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(nextProps.params.voter_guide_we_vote_id);
      if (voterGuide && voterGuide.we_vote_id) {
        this.setState({
          voterGuide,
        });
      }
    }
  }

  componentWillUnmount () {
    this.appStoreListener.remove();
    this.ballotStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
    this.voterGuideStoreListener.remove();
  }

  onAppStoreChange () {
    this.setState({
      showNewVoterGuideModal: AppStore.showNewVoterGuideModal(),
      showSignInModal: AppStore.showSignInModal(),
    });
  }

  onBallotStoreChange () {
    // this.setState({ bookmarks: BallotStore.bookmarks });
  }

  onOrganizationStoreChange () {
    this.setState();
  }

  onVoterGuideStoreChange () {
    if (this.state.voterGuideWeVoteId && isProperlyFormattedVoterGuideWeVoteId(this.state.voterGuideWeVoteId)) {
      const voterGuide = VoterGuideStore.getVoterGuideByVoterGuideId(this.state.voterGuideWeVoteId);
      if (voterGuide && voterGuide.we_vote_id) {
        this.setState({
          voterGuide,
        });
      }
    }
  }

  onVoterStoreChange () {
    const voter = VoterStore.getVoter();
    const voterFirstName = VoterStore.getFirstName();
    const voterIsSignedIn = voter.is_signed_in;
    this.setState({
      voter,
      voterFirstName,
      voterIsSignedIn,
    });
  }

  goToVoterGuideDisplay = () => {
    let voterGuideDisplay = '/ballot';
    if (this.state.voterGuide) {
      voterGuideDisplay = `/voterguide/${this.state.voterGuide.organization_we_vote_id}/ballot/election/${this.state.voterGuide.google_civic_election_id}/positions`;
    }
    historyPush(voterGuideDisplay);
  }

  transitionToYourVoterGuide () {
    const { voter } = this.state;
    // Positions for this organization, for this voter / election
    OrganizationActions.positionListForOpinionMaker(voter.linked_organization_we_vote_id, true);

    // Positions for this organization, NOT including for this voter / election
    OrganizationActions.positionListForOpinionMaker(voter.linked_organization_we_vote_id, false, true);
    OrganizationActions.organizationsFollowedRetrieve();
    VoterGuideActions.voterGuideFollowersRetrieve(voter.linked_organization_we_vote_id);
    VoterGuideActions.voterGuidesFollowedByOrganizationRetrieve(voter.linked_organization_we_vote_id);
    this.setState({ profilePopUpOpen: false });
  }

  hideAccountMenu () {
    this.setState({ profilePopUpOpen: false });
  }

  toggleAccountMenu () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  toggleProfilePopUp () {
    const { profilePopUpOpen } = this.state;
    this.setState({ profilePopUpOpen: !profilePopUpOpen });
  }

  closeSignInModal () {
    AppActions.setShowSignInModal(false);
  }

  toggleSignInModal () {
    const { showSignInModal } = this.state;
    this.setState({ profilePopUpOpen: false });
    AppActions.setShowSignInModal(!showSignInModal);
  }

  hideProfilePopUp () {
    this.setState({ profilePopUpOpen: false });
  }

  signOutAndHideProfilePopUp () {
    VoterSessionActions.voterSignOut();
    this.setState({ profilePopUpOpen: false });
  }

  toggleVoterGuideModal () {
    // console.log('toggleVoterGuideModal');
    const { showNewVoterGuideModal } = this.state;
    AppActions.setShowNewVoterGuideModal(!showNewVoterGuideModal);
  }

  render () {
    renderLog('HeaderBackToVoterGuides');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      profilePopUpOpen, showNewVoterGuideModal, showSignInModal,
      voter, voterFirstName, voterIsSignedIn,
    } = this.state;
    const { classes, pathname } = this.props;
    const voterPhotoUrlMedium = voterPhoto(voter);

    let backToLink = '/settings/voterguidelist'; // default
    let backToOrganizationLinkText = 'Voter Guides'; // Back to
    const pathnameLowerCase = pathname.toLowerCase() || '';

    if (stringContains('/settings/menu', pathnameLowerCase)) {
      backToOrganizationLinkText = ''; // Back to 'Your Endorsements'
      if (isWebApp()) {
        backToLink = isMobile() ? '/settings/voterguidesmenu' : '/settings/voterguidelist';
      } else {
        backToLink = '/settings/voterguidesmenu';
      }
    } else if (stringContains('/settings/general', pathnameLowerCase) || stringContains('/settings/positions', pathnameLowerCase)) {
      // const voterGuideWeVoteId = this.props.params.voter_guide_we_vote_id;
      backToOrganizationLinkText = ''; // Back to 'Your Endorsements'
      backToLink = '/settings/voterguidelist';
    } else if (stringContains('/vg/', pathnameLowerCase) && stringContains('/settings', pathnameLowerCase)) {
      backToOrganizationLinkText = ''; // Back to 'Your Endorsements'
      backToLink = '/settings/voterguidelist';
    }
    const electionName = BallotStore.currentBallotElectionName;
    // const atLeastOnePositionFoundForThisElection = positionListForOneElection && positionListForOneElection.length !== 0;

    const changeElectionButtonHtml = (
      <Tooltip title="Change Election" aria-label="Change Election" classes={{ tooltipPlacementBottom: classes.tooltipPlacementBottom }}>
        <span>
          <IconButton
            classes={{ root: classes.iconButtonRoot }}
            id="changeVoterGuideElectionHeaderBar"
            onClick={this.toggleVoterGuideModal}
          >
            <PlaceIcon />
          </IconButton>
          <Button
            color="primary"
            classes={{ root: classes.addressButtonRoot }}
            id="changeVoterGuideElectionHeaderBarText"
            onClick={this.toggleVoterGuideModal}
          >
            <span className="u-show-desktop-tablet">Change Election</span>
            <span className="u-show-mobile-bigger-than-iphone5">Change Election</span>
            <span className="u-show-mobile-iphone5-or-smaller">Election</span>
          </Button>
        </span>
      </Tooltip>
    );

    return (
      <AppBar className={isWebApp() ? 'page-header page-header__voter-guide-creator' : 'page-header page-header__cordova page-header__voter-guide-creator'} color="default">
        <Toolbar className="header-toolbar header-backto-toolbar" disableGutters>
          <HeaderBackToButton
            backToLink={backToLink}
            backToLinkText={backToOrganizationLinkText}
            id="backToLinkTabHeader"
          />

          <div className="header-nav__avatar-wrapper u-cursor--pointer u-flex">
            { changeElectionButtonHtml }
            {voterIsSignedIn ? (
              <span>
                {voterPhotoUrlMedium ? (
                  <div
                    id="profileAvatarHeaderBar"
                    className={`header-nav__avatar-container ${isCordova() ? 'header-nav__avatar-cordova' : undefined}`}
                    onClick={this.toggleProfilePopUp}
                  >
                    <img
                      className="header-nav__avatar"
                      src={voterPhotoUrlMedium}
                      style={{
                        marginLeft: 16,
                      }}
                      height={34}
                      width={34}
                      alt="Your Settings"
                    />
                  </div>
                ) : (
                  <div>
                    <IconButton
                      classes={{ root: classes.iconButtonRoot }}
                      id="profileAvatarHeaderBar"
                      onClick={this.toggleProfilePopUp}
                    >
                      <FirstNameWrapper>
                        {shortenText(voterFirstName, 9)}
                      </FirstNameWrapper>
                      <AccountCircleIcon />
                    </IconButton>
                  </div>
                )
                }
                {profilePopUpOpen && (
                <HeaderBarProfilePopUp
                  hideProfilePopUp={this.hideProfilePopUp}
                  onClick={this.toggleProfilePopUp}
                  profilePopUpOpen={profilePopUpOpen}
                  signOutAndHideProfilePopUp={this.signOutAndHideProfilePopUp}
                  toggleProfilePopUp={this.toggleProfilePopUp}
                  toggleSignInModal={this.toggleSignInModal}
                  transitionToYourVoterGuide={this.transitionToYourVoterGuide}
                  voter={voter}
                  weVoteBrandingOff={this.state.we_vote_branding_off}
                />
                )}
              </span>
            ) : (
              <Button
                className="header-sign-in"
                classes={{ root: classes.headerButtonRoot }}
                color="primary"
                id="signInHeaderBar"
                onClick={this.toggleSignInModal}
                variant="text"
              >
                Sign In
              </Button>
            )}
          </div>
        </Toolbar>
        <VoterGuideTitle className="header-toolbar">
          {electionName}
        </VoterGuideTitle>
        <EndorsementModeSwitch className="header-toolbar">
          <EndorsementModeTabs />
          <PreviewButtonWrapper className="u-show-desktop-tablet">
            <Button
              classes={{ root: classes.previewButton }}
              color="primary"
              id="voterGuideSettingsPositionsSeeFullBallot"
              onClick={this.goToVoterGuideDisplay}
              variant="contained"
            >
              See Preview&nbsp;&nbsp;&gt;
            </Button>
          </PreviewButtonWrapper>
        </EndorsementModeSwitch>
        {showSignInModal && (
          <SignInModal
            show={showSignInModal}
            closeFunction={this.closeSignInModal}
          />
        )}
        {showNewVoterGuideModal && (
          <VoterGuideChooseElectionModal
            show={showNewVoterGuideModal}
            toggleFunction={this.toggleVoterGuideModal}
          />
        )}
      </AppBar>
    );
  }
}

const styles = theme => ({
  headerBadge: {
    right: -15,
    top: 9,
  },
  padding: {
    padding: `0 ${theme.spacing(2)}px`,
  },
  addressButtonRoot: {
    '&:hover': {
      backgroundColor: 'transparent',
    },
    color: 'rgba(17, 17, 17, .5)',
    outline: 'none !important',
    paddingRight: 20,
    [theme.breakpoints.down('sm')]: {
      paddingTop: 6,
      marginLeft: 2,
      paddingLeft: 0,
    },
  },
  headerButtonRoot: {
    paddingTop: 2,
    paddingBottom: 2,
    '&:hover': {
      backgroundColor: 'transparent',
    },
    color: 'rgb(6, 95, 212)',
    marginLeft: '1rem',
    outline: 'none !important',
    [theme.breakpoints.down('sm')]: {
      marginLeft: 12,
      paddingLeft: 0,
    },
  },
  iconButtonRoot: {
    marginTop: 4,
    paddingTop: 2,
    paddingRight: 0,
    paddingBottom: 2,
    paddingLeft: 0,
    color: 'rgba(17, 17, 17, .4)',
    outline: 'none !important',
    '&:hover': {
      backgroundColor: 'transparent',
    },
  },
  previewButton: {
    height: 27,
    marginBottom: 3,
    padding: '2px 16px',
  },
  tooltipPlacementBottom: {
    marginTop: 0,
  },
  outlinedPrimary: {
    minWidth: 36,
    marginRight: '.5rem',
    [theme.breakpoints.down('md')]: {
      padding: 2,
    },
  },
  tabRoot: {
    minWidth: 130,
  },
  indicator: {
    height: 4,
  },
});

const FirstNameWrapper = styled.div`
  font-size: 14px;
  padding-right: 4px;
`;

const PreviewButtonWrapper = styled.div`
  margin-right: 30px;
`;

const VoterGuideTitle = styled.div`
  align-items: left;
  margin-left: 30px;
  width: 100%;
`;

const EndorsementModeSwitch = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  margin-left: 30px;
  width: 100%;
`;

export default withStyles(styles)(HeaderBackToVoterGuides);
