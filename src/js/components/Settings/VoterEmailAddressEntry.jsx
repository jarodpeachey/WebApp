import React, { Component } from 'react';
import { Alert } from 'react-bootstrap';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Delete from '@material-ui/icons/Delete';
import Paper from '@material-ui/core/Paper';
import Mail from '@material-ui/icons/Mail';
import InputBase from '@material-ui/core/InputBase';
import LoadingWheel from '../LoadingWheel';
import { isCordova } from '../../utils/cordovaUtils';
import { renderLog } from '../../utils/logging';
import OpenExternalWebSite from '../Widgets/OpenExternalWebSite';
import SettingsVerifySecretCode from './SettingsVerifySecretCode';
import VoterActions from '../../actions/VoterActions';
import VoterStore from '../../stores/VoterStore';

class VoterEmailAddressEntry extends Component {
  static propTypes = {
    classes: PropTypes.object,
    inModal: PropTypes.bool,
    toggleOtherSignInOptions: PropTypes.func,
  };

  constructor (props) {
    super(props);
    this.state = {
      disableEmailVerificationButton: false,
      displayEmailVerificationButton: false,
      emailAddressStatus: {
        email_address_already_owned_by_other_voter: false,
        email_address_already_owned_by_this_voter: false,
        email_address_created: false,
        email_address_deleted: false,
        email_address_not_valid: false,
        link_to_sign_in_email_sent: false,
        make_primary_email: false,
        sign_in_code_email_sent: false,
        verification_email_sent: false,
      },
      hideExistingEmailAddresses: false,
      loading: true,
      secretCodeSystemLocked: false,
      showVerifyModal: false,
      voter: VoterStore.getVoter(),
      voterEmailAddress: '',
      voterEmailAddressIsValid: false,
      voterEmailAddressList: [],
      voterEmailAddressListCount: 0,
      voterEmailAddressesVerifiedCount: 0,
    };
  }

  componentDidMount () {
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    // Steve 11/14/19: commenting out the next line: it is expensive and causes trouble in SignInModal, and is almost certainly not needed
    // VoterActions.voterRetrieve();
    VoterActions.voterEmailAddressRetrieve();
  }

  shouldComponentUpdate (nextProps, nextState) {
    if (JSON.stringify(this.state.emailAddressStatus) !== JSON.stringify(nextState.emailAddressStatus)) {
      // console.log('this.state.emailAddressStatus', this.state.emailAddressStatus, ', nextState.emailAddressStatus', nextState.emailAddressStatus);
      return true;
    }
    if (this.state.displayEmailVerificationButton !== nextState.displayEmailVerificationButton) {
      // console.log('this.state.displayEmailVerificationButton', this.state.displayEmailVerificationButton, ', nextState.displayEmailVerificationButton', nextState.displayEmailVerificationButton);
      return true;
    }
    if (this.state.loading !== nextState.loading) {
      // console.log('this.state.loading', this.state.loading, ', nextState.loading', nextState.loading);
      return true;
    }
    if (this.state.secretCodeSystemLocked !== nextState.secretCodeSystemLocked) {
      // console.log('this.state.secretCodeSystemLocked', this.state.secretCodeSystemLocked, ', nextState.secretCodeSystemLocked', nextState.secretCodeSystemLocked);
      return true;
    }
    if (this.state.showError !== nextState.showError) {
      // console.log('this.state.showError', this.state.showError, ', nextState.showError', nextState.showError);
      return true;
    }
    if (this.state.showVerifyModal !== nextState.showVerifyModal) {
      // console.log('this.state.showVerifyModal', this.state.showVerifyModal, ', nextState.showVerifyModal', nextState.showVerifyModal);
      return true;
    }
    if (this.state.voterEmailAddress !== nextState.voterEmailAddress) {
      // console.log('this.state.voterEmailAddress', this.state.voterEmailAddress, ', nextState.voterEmailAddress', nextState.voterEmailAddress);
      return true;
    }
    if (this.state.voterEmailAddressListCount !== nextState.voterEmailAddressListCount) {
      // console.log('this.state.voterEmailAddressListCount', this.state.voterEmailAddressListCount, ', nextState.voterEmailAddressListCount', nextState.voterEmailAddressListCount);
      return true;
    }
    if (this.state.voterEmailAddressesVerifiedCount !== nextState.voterEmailAddressesVerifiedCount) {
      // console.log('this.state.voterEmailAddressesVerifiedCount', this.state.voterEmailAddressesVerifiedCount, ', nextState.voterEmailAddressesVerifiedCount', nextState.voterEmailAddressesVerifiedCount);
      return true;
    }
    // console.log('shouldComponentUpdate false');
    return false;
  }

  componentWillUnmount () {
    this.voterStoreListener.remove();
  }

  onVoterStoreChange () {
    const emailAddressStatus = VoterStore.getEmailAddressStatus();
    const { secret_code_system_locked_for_this_voter_device_id: secretCodeSystemLocked } = emailAddressStatus;
    const secretCodeVerificationStatus = VoterStore.getSecretCodeVerificationStatus();
    const { secretCodeVerified } = secretCodeVerificationStatus;
    // console.log('onVoterStoreChange emailAddressStatus:', emailAddressStatus);
    if (secretCodeVerified) {
      this.setState({
        showVerifyModal: false,
        voterEmailAddress: '',
      });
    } else if (emailAddressStatus.sign_in_code_email_sent) {
      this.setState({
        displayEmailVerificationButton: false,
        emailAddressStatus: {
          sign_in_code_email_sent: false,
        },
        showVerifyModal: true,
      });
    } else if (emailAddressStatus.email_address_already_owned_by_this_voter) {
      this.setState({
        displayEmailVerificationButton: false,
        emailAddressStatus,
        showVerifyModal: false,
      });
    } else {
      this.setState({
        emailAddressStatus,
      });
    }
    const voterEmailAddressList = VoterStore.getEmailAddressList();
    const voterEmailAddressListCount = voterEmailAddressList.length;
    const voterEmailAddressesVerifiedCount = VoterStore.getEmailAddressesVerifiedCount();
    this.setState({
      loading: false,
      secretCodeSystemLocked,
      voter: VoterStore.getVoter(),
      voterEmailAddressList,
      voterEmailAddressListCount,
      voterEmailAddressesVerifiedCount,
    });
  }

  setAsPrimaryEmailAddress (emailWeVoteId) {
    VoterActions.setAsPrimaryEmailAddress(emailWeVoteId);
  }

  voterEmailAddressSave = (event) => {
    // console.log('VoterEmailAddressEntry this.voterEmailAddressSave');
    event.preventDefault();
    const sendLinkToSignIn = true;
    VoterActions.voterEmailAddressSave(this.state.voterEmailAddress, sendLinkToSignIn);
    this.setState({ loading: true });
  };

  sendSignInCodeEmail = (event) => {
    event.preventDefault();
    const { voterEmailAddress, voterEmailAddressIsValid } = this.state;
    if (voterEmailAddressIsValid) {
      VoterActions.sendSignInCodeEmail(voterEmailAddress);
      this.setState({
        emailAddressStatus: {
          email_address_already_owned_by_other_voter: false,
        },
        loading: true,
      });
    } else {
      this.setState({ showError: true });
    }
  };

  reSendSignInCodeEmail = (voterEmailAddress) => {
    // console.log('VoterEmailAddressEntry voterEmailAddress:', voterEmailAddress);
    if (voterEmailAddress) {
      VoterActions.sendSignInCodeEmail(voterEmailAddress);
      this.setState({
        emailAddressStatus: {
          email_address_already_owned_by_other_voter: false,
        },
        loading: true,
        voterEmailAddress,
      });
    }
  };

  displayEmailVerificationButton = () => {
    this.setState({
      displayEmailVerificationButton: true,
    });
  };

  hideEmailVerificationButton = () => {
    const { voterEmailAddress } = this.state;
    if (!voterEmailAddress) {
      // Only hide if no email entered
      this.setState({
        displayEmailVerificationButton: false,
      });
    }
  };

  localToggleOtherSignInOptions = () => {
    if (isCordova()) {
      const { hideExistingEmailAddresses } = this.state;
      this.setState({ hideExistingEmailAddresses: !hideExistingEmailAddresses });
      if (this.props.toggleOtherSignInOptions) {
        this.props.toggleOtherSignInOptions();
      }
    }
  };

  onEmailInputBlur = (event) => {
    const { voterEmailAddress } = this.state;
    this.hideEmailVerificationButton();
    this.localToggleOtherSignInOptions();
    if (voterEmailAddress && isCordova()) {
      // When there is a voterEmailAddress value and the keyboard closes, submit
      this.sendSignInCodeEmail(event);
    }
  }

  closeVerifyModal = () => {
    // console.log('VoterEmailAddressEntry closeVerifyModal');
    this.setState({
      displayEmailVerificationButton: false,
      emailAddressStatus: {
        sign_in_code_email_sent: false,
      },
      showVerifyModal: false,
      voterEmailAddress: '',
    });
  };

  updateVoterEmailAddress = (e) => {
    const voterEmailAddress = e.target.value;
    const voterEmailAddressIsValid = true;
    this.setState({
      voterEmailAddress,
      voterEmailAddressIsValid,
    });
  };

  sendVerificationEmail (emailWeVoteId) {
    VoterActions.sendVerificationEmail(emailWeVoteId);
    this.setState({ loading: true });
  }

  removeVoterEmailAddress (emailWeVoteId) {
    VoterActions.removeVoterEmailAddress(emailWeVoteId);
  }

  render () {
    renderLog('VoterEmailAddressEntry');  // Set LOG_RENDER_EVENTS true to log all renders
    if (this.state.loading) {
      // console.log('VoterEmailAddressEntry loading: ', this.state.loading);
      return LoadingWheel;
    }

    const { classes } = this.props;
    const {
      disableEmailVerificationButton, displayEmailVerificationButton, emailAddressStatus, hideExistingEmailAddresses,
      secretCodeSystemLocked, showVerifyModal, voterEmailAddress, voterEmailAddressList, voterEmailAddressListCount,
    } = this.state;

    const signInLinkOrCodeSent = (emailAddressStatus.link_to_sign_in_email_sent || emailAddressStatus.sign_in_code_email_sent);
    // console.log('showVerifyModal:', showVerifyModal, ', signInLinkOrCodeSent:', signInLinkOrCodeSent);
    const emailAddressStatusHtml = (
      <span>
        { emailAddressStatus.email_address_not_valid ||
        (emailAddressStatus.email_address_already_owned_by_this_voter && !emailAddressStatus.email_address_deleted && !emailAddressStatus.make_primary_email && !secretCodeSystemLocked) ||
        (emailAddressStatus.email_address_already_owned_by_other_voter && !signInLinkOrCodeSent && !secretCodeSystemLocked) ||
        secretCodeSystemLocked ? (
          <Alert variant="warning">
            { emailAddressStatus.email_address_not_valid && (
              <div>Please enter a valid email address.</div>
            )}
            { emailAddressStatus.email_address_already_owned_by_other_voter && !signInLinkOrCodeSent && !secretCodeSystemLocked && (
              <div>
                That email is already being used by another account.
                <br />
                <br />
                Please click &quot;Send Login Code in an Email&quot; below to sign into that account.
              </div>
            )}
            { emailAddressStatus.email_address_already_owned_by_this_voter && !emailAddressStatus.email_address_deleted && !emailAddressStatus.make_primary_email && !secretCodeSystemLocked ? <div>That email address was already verified by you. </div> : null }
            { secretCodeSystemLocked && (
              <div>
                Your account is locked. Please
                <OpenExternalWebSite
                  url="https://help.wevote.us/hc/en-us/requests/new"
                  target="_blank"
                  body={<span>contact We Vote support for help.</span>}
                />
              </div>
            )}
          </Alert>
          ) : null
        }
        { emailAddressStatus.email_address_created ||
        emailAddressStatus.email_address_deleted ||
        emailAddressStatus.email_ownership_is_verified ||
        emailAddressStatus.verification_email_sent ||
        emailAddressStatus.link_to_sign_in_email_sent ||
        (emailAddressStatus.make_primary_email && (emailAddressStatus.email_address_created || emailAddressStatus.email_address_found || emailAddressStatus.sign_in_code_email_sent) && !secretCodeSystemLocked) ||
        emailAddressStatus.sign_in_code_email_sent ? (
          <Alert variant="success">
            { emailAddressStatus.email_address_created &&
            !emailAddressStatus.verification_email_sent ? <span>Your email address was saved. </span> : null }
            { emailAddressStatus.email_address_deleted ? <span>Your email address was deleted. </span> : null }
            { emailAddressStatus.email_ownership_is_verified ? <span>Your email address was verified. </span> : null }
            { emailAddressStatus.verification_email_sent ? <span>Please check your email. A verification email was sent. </span> : null }
            { emailAddressStatus.link_to_sign_in_email_sent ? <span>Please check your email. A sign in link was sent. </span> : null }
            { emailAddressStatus.make_primary_email && (emailAddressStatus.email_address_created || emailAddressStatus.email_address_found || emailAddressStatus.sign_in_code_email_sent) && !secretCodeSystemLocked ? <span>Your have chosen a new primary email. </span> : null }
            { emailAddressStatus.sign_in_code_email_sent ? <span>Please check your email. A sign in verification code was sent. </span> : null }
          </Alert>
          ) : null
        }
      </span>
    );

    let enterEmailTitle = 'Sign in with Email';
    // let enterEmailExplanation = isWebApp() ? "You'll receive a magic link in your email. Click that link to be signed into your We Vote account." :
    //   "You'll receive a magic link in the email on this phone. Click that link to be signed into your We Vote account.";
    if (this.state.voter && this.state.voter.is_signed_in) {
      enterEmailTitle = 'Add New Email';
      // enterEmailExplanation = isWebApp() ? "You'll receive a magic link in your email. Click that link to verify this new email." :
      //   "You'll receive a magic link in the email on this phone. Click that link to verify this new email.";
    }

    const enterEmailHtml = (
      <div>
        <div className="u-stack--sm u-tl">
          <strong>
            {enterEmailTitle}
          </strong>
          {' '}
          {/* enterEmailExplanation */}
        </div>
        <form className="form-inline">
          <Paper className={classes.root} elevation={1}>
            <Mail />
            <InputBase
              className={classes.input}
              type="email"
              name="voter_email_address"
              id="enterVoterEmailAddress"
              value={voterEmailAddress}
              onBlur={this.onEmailInputBlur}
              onChange={this.updateVoterEmailAddress}
              onFocus={() => { this.displayEmailVerificationButton(); this.localToggleOtherSignInOptions(); }}
              placeholder="Type email here..."
            />
          </Paper>
          {displayEmailVerificationButton && (
            <Button
              className={classes.button}
              color="primary"
              disabled={disableEmailVerificationButton}
              id="voterEmailAddressEntrySendCode"
              onClick={this.sendSignInCodeEmail}
              variant="contained"
            >
              Email Verification Code
            </Button>
          )}
        </form>
      </div>
    );

    let allowRemoveEmail;
    let emailOwnershipIsVerified;
    let isPrimaryEmailAddress;

    // ///////////////////////////////////
    // LIST OF VERIFIED EMAILS
    let verifiedEmailsFound = false;
    const verifiedEmailListHtml = voterEmailAddressList.map((voterEmailAddressFromList) => {
      emailOwnershipIsVerified = !!voterEmailAddressFromList.email_ownership_is_verified;

      if (emailOwnershipIsVerified) {
        verifiedEmailsFound = true;
        allowRemoveEmail = voterEmailAddressFromList.primary_email_address !== true;
        isPrimaryEmailAddress = voterEmailAddressFromList.primary_email_address === true;

        return (
          <div key={voterEmailAddressFromList.email_we_vote_id}>
            <span>{voterEmailAddressFromList.normalized_email_address}</span>

            {isPrimaryEmailAddress && (
              <span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                Primary
              </span>
            )}
            {!isPrimaryEmailAddress && (
              <span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                <span>
                  <a // eslint-disable-line
                    onClick={this.setAsPrimaryEmailAddress.bind(this, voterEmailAddressFromList.email_we_vote_id)}
                  >
                    Make Primary
                  </a>
                  &nbsp;&nbsp;&nbsp;
                </span>
                <span>&nbsp;&nbsp;&nbsp;</span>
                {allowRemoveEmail && (
                  <a // eslint-disable-line
                    onClick={this.removeVoterEmailAddress.bind(this, voterEmailAddressFromList.email_we_vote_id)}
                  >
                    <Delete />
                  </a>
                )}
              </span>
            )}
          </div>
        );
      } else {
        return null;
      }
    });

    // ////////////////////////////////////
    // LIST OF EMAILS TO VERIFY
    let unverifiedEmailsFound = false;
    const toVerifyEmailListHtml = voterEmailAddressList.map((voterEmailAddressFromList) => {
      emailOwnershipIsVerified = !!voterEmailAddressFromList.email_ownership_is_verified;
      if (!emailOwnershipIsVerified) {
        unverifiedEmailsFound = true;
        allowRemoveEmail = !voterEmailAddressFromList.primary_email_address;
        isPrimaryEmailAddress = !!voterEmailAddressFromList.primary_email_address;
        return (
          <div key={voterEmailAddressFromList.email_we_vote_id}>
            <div>
              <span>{voterEmailAddressFromList.normalized_email_address}</span>
              <span>&nbsp;&nbsp;&nbsp;</span>
              {voterEmailAddressFromList.email_ownership_is_verified ?
                null : (
                  <a // eslint-disable-line
                    onClick={() => this.reSendSignInCodeEmail(voterEmailAddressFromList.normalized_email_address)}
                  >
                    Send Verification Again
                  </a>
                )}

              <span>&nbsp;&nbsp;&nbsp;</span>
              {allowRemoveEmail && (
                <a // eslint-disable-line
                  onClick={this.removeVoterEmailAddress.bind(this, voterEmailAddressFromList.email_we_vote_id)}
                >
                  <Delete />
                </a>
              )}
            </div>
          </div>
        );
      } else {
        return null;
      }
    });

    return (
      <Wrapper>
        {!hideExistingEmailAddresses && (
          <div>
            {verifiedEmailsFound && !this.props.inModal ? (
              <EmailSection>
                <span className="h3">
                  Your Email
                  {voterEmailAddressListCount > 1 ? 's' : ''}
                </span>
                {emailAddressStatusHtml}
                {verifiedEmailListHtml}
              </EmailSection>
            ) : (
              <span>
                {emailAddressStatusHtml}
              </span>
            )}
            {unverifiedEmailsFound && !this.props.inModal && (
              <EmailSection>
                <span className="h3">Emails to Verify</span>
                {toVerifyEmailListHtml}
              </EmailSection>
            )}
          </div>
        )}
        <EmailSection>
          {enterEmailHtml}
        </EmailSection>
        {showVerifyModal && (
          <SettingsVerifySecretCode
            show={showVerifyModal}
            closeVerifyModal={this.closeVerifyModal}
            voterEmailAddress={voterEmailAddress}
          />
        )}
      </Wrapper>
    );
  }
}

const styles = {
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%',
    paddingLeft: 8,
    marginBottom: 8,
  },
  input: {
    marginLeft: 8,
    flex: 1,
    padding: 8,
  },
  button: {
    width: '100%',
    padding: '12px',
  },
};

const Wrapper = styled.div`
  margin-top: 32px;
`;

const EmailSection = styled.div`
  margin-top: 18px;
`;

export default withStyles(styles)(VoterEmailAddressEntry);
