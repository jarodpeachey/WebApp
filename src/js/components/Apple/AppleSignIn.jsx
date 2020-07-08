import React, { Component } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import VoterActions from '../../actions/VoterActions';
import { openSnackbar } from '../Widgets/SnackNotifier';
import { renderLog } from '../../utils/logging';
import { isAndroid, isIOS, isWebApp } from '../../utils/cordovaUtils';

class AppleSignIn extends Component {
  static propTypes = {
    closeSignInModal: PropTypes.func,
    signedIn: PropTypes.bool,
  };

  constructor (props) {
    super(props);
    this.signInToApple = this.signInToApple.bind(this);
    if (isWebApp()) {
      this.initializeSignInWithApple();
    }
  }

  // Initialize Sign in with Apple
  signInToApple () {
    console.log('SignInWithApple: Button clicked');
    const { SignInWithApple: { signin } } = window.cordova.plugins;

    // window.voterActionVoterAppleSignInSave = VoterActions.voterAppleSignInSave;
    const voterActionVoterAppleSignInSave = VoterActions.voterAppleSignInSave;

    signin(
      { requestedScopes: [0, 1]},
      (response) => {
        // console.log(`SignInWithApple: ${JSON.stringify(response)}`);
        const { user, email, fullName: { givenName, middleName, familyName } } = response;
        console.log('AppleSignInSave called with email:', email);
        if (!email || email.length === 0) {
          openSnackbar({
            message: 'We Vote does not support "Hide My Email" at this time.',
            duration: 7000,
          });
        }
        voterActionVoterAppleSignInSave(email, givenName, middleName, familyName, user);
        if (this.props.closeSignInModal) {
          this.props.closeSignInModal();
        }
      },
      (err) => {
        // console.error(err);
        console.log(`SignInWithApple: ${JSON.stringify(err)}`);
        if (err.code === '1000') {
          // SignInWithApple: {"code":"1000","localizedFailureReason":"","error":"ASAUTHORIZATION_ERROR","localizedDescription":"The operation couldn’t be completed. (com.apple.AuthenticationServices.AuthorizationError error 1000.)"}
          // iOS takes over and the voter will be taking a break to go to settings to setup AppleID or login to iCloud for the first time on this device.
          // Super edge case outside of testing situations
          openSnackbar({
            message: 'You may need to open Settings, and login to iCloud before proceeding.',
            duration: 7000,
          });
          if (this.props.closeSignInModal) {
            this.props.closeSignInModal();
          }
        }
      },
    )(voterActionVoterAppleSignInSave);
  }

  // Sign in with Apple, for the WebApp -- Requires Oauth Flow through the python server
  // https://developer.apple.com/documentation/sign_in_with_apple/sign_in_with_apple_js/configuring_your_webpage_for_sign_in_with_apple
  initializeSignInWithApple () {
    const head = document.getElementsByTagName('head')[0];
    const script = document.createElement('script');
    script.src = 'https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js';
    script.type = 'text/javascript';
    head.appendChild(script);
    // <meta name="appleid-signin-client-id" content="[CLIENT_ID]">
    let meta = document.createElement('meta');
    meta.name = 'appleid-signin-client-id';
    meta.content = 'us.wevote.webapp';  // https://developer.apple.com/account/resources/identifiers/list
    head.appendChild(meta);
    // <meta name="appleid-signin-scope" content="[SCOPES]">
    meta = document.createElement('meta');
    meta.name = 'appleid-signin-scope';
    meta.content = 'email';
    head.appendChild(meta);
    // <meta name="appleid-signin-redirect-uri" content="[REDIRECT_URI]">
    meta = document.createElement('meta');
    meta.name = 'appleid-signin-redirect-uri';
    meta.content = 'https://api.wevoteusa.org/apis/v1/appleSignInOauthRedirectDestination';  // This has to be a real DNS lookupable domain, and can't be localhost or an ip address
    head.appendChild(meta);
    // <meta name="appleid-signin-state" content="[STATE]">
    meta = document.createElement('meta');
    meta.name = 'appleid-signin-state';
    meta.content = 'NonGuessableValueThatShouldNotBeCheckedIntoGitLikeThisOneIS'; // TODO: ADD ME
    head.appendChild(meta);
    // <meta name="appleid-signin-use-popup" content="true"> <!-- or false defaults to false -->
    meta = document.createElement('meta');
    meta.name = 'appleid-signin-use-popup';
    meta.content = 'true';
    head.appendChild(meta);
  }

  render () {
    renderLog('AppleSignIn');  // Set LOG_RENDER_EVENTS to log all renders
    const isWeb = isWebApp();
    const { signedIn } = this.props;
    let enabled = true;

    if (isWeb) {
      return (
        <div id="appleid-signin"
             className="signin-button"
             data-color="black"
             data-border="true"
             data-type="sign in"
        />
      );
    }

    if (isAndroid()) {
      console.error('Sign in with Apple is not available on Android');
      return null;
    }

    if (isIOS()) {
      const { device: { version } } = window;
      const floatVersion = parseFloat(version);
      if (floatVersion < 13.0) {
        console.log('Sign in with Apple is not available on iOS < 13, this phone is running: ', floatVersion);
        enabled = false;
      }
    }

    if (signedIn) {
      return (
        <AppleSignedInContainer>
          <AppleLogo signedIn={signedIn} enabled={enabled} />
        </AppleSignedInContainer>
      );
    } else {
      return (
        <AppleSignInContainer enabled={enabled}>
          <AppleSignInButton type="submit"
                             isWeb={isWeb}
                             onClick={() => (enabled ? this.signInToApple() : null)}
          >
            <AppleLogo signedIn={signedIn} enabled={enabled} />
            <AppleSignInText id="appleSignInText" enabled={enabled}>
              Sign in with Apple
            </AppleSignInText>
          </AppleSignInButton>
        </AppleSignInContainer>
      );
    }
  }
}

export default AppleSignIn;

export function AppleLogo (parameters) {
  return (
    <AppleLogoSvg viewBox="0 0 170 170"
                  fill="currentColor"
                  preserveAspectRatio="xMinYMin meet"
                  focusable="false"
                  aria-hidden="true"
                  id="appleLogo"
                  signedIn={parameters.signedIn}
                  enabled={parameters.enabled}
    >
      <title>Apple Logo</title>
      <path
        d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48
        4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.197-2.12-9.973-3.17-14.34-3.17-4.58
        0-9.492 1.05-14.746 3.17-5.262 2.13-9.501 3.24-12.742
        3.35-4.929.21-9.842-1.96-14.746-6.52-3.13-2.73-7.045-7.41-11.735-14.04-5.032-7.08-9.169-15.29-12.41-24.65-3.471-10.11-5.211-19.9-5.211-29.378
        0-10.857 2.346-20.221 7.045-28.068 3.693-6.303 8.606-11.275 14.755-14.925s12.793-5.51 19.948-5.629c3.915
        0 9.049 1.211 15.429 3.591 6.362 2.388 10.447 3.599 12.238 3.599 1.339 0 5.877-1.416 13.57-4.239
        7.275-2.618 13.415-3.702 18.445-3.275 13.63 1.1 23.87 6.473 30.68 16.153-12.19 7.386-18.22
        17.731-18.1 31.002.11 10.337 3.86 18.939 11.23 25.769 3.34 3.17 7.07 5.62 11.22 7.36-.9 2.61-1.85
        5.11-2.86 7.51zM119.11 7.24c0 8.102-2.96 15.667-8.86 22.669-7.12 8.324-15.732 13.134-25.071
        12.375a25.222 25.222 0 0 1-.188-3.07c0-7.778 3.386-16.102 9.399-22.908 3.002-3.446 6.82-6.311
        11.45-8.597 4.62-2.252 8.99-3.497 13.1-3.71.12 1.083.17 2.166.17 3.24z"
      />
    </AppleLogoSvg>
  );
}

const AppleLogoSvg = styled.svg`
  position: absolute;
  left: ${({ signedIn }) => (signedIn ? '29%' : '5%')};
  top: 11px;
  height: 20px;
  color: ${({ enabled }) => (enabled ? '#fff' : 'grey')};
`;

const AppleSignInText = styled.span`
  font-size: 14pt;
  padding: none;
  border: none;
  color: ${({ enabled }) => (enabled ? '#fff' : 'grey')};
`;

const AppleSignInButton = styled.button`
  margin-top: ${({ isWeb }) => (isWeb ? '8px' : '10px')};
  border: none;
  padding-left: 40px;
  background-color: #000;
  color: #fff;
`;

/*
Note, May 21, 2020: Before making changes to these styles, be sure you are compliant with
https://developer.apple.com/design/resources/ or we risk getting rejected by Apple
*/
const AppleSignInContainer  = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  background-color: #000;
  border-color: #000;
  color: ${({ enabled }) => (enabled ? '#fff' : 'grey')};
  display: block;
  margin: 0 auto 11px;
  height: 46px;
  border-radius: 4px;
  overflow: hidden;
  padding: 0 40px;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
  width: 100%;
`;

const AppleSignedInContainer  = styled.div`
  background-color: #000;
  border-color: #000;
  color: #fff;
  margin: 0 auto 11px;
  height: 46px;
  border-radius: 4px;
  max-width: 408px;
  overflow: hidden;
  position: relative;
  width: 46px;
`;
