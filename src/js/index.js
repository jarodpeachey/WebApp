import React from 'react';
import { render } from 'react-dom';
import {
  browserHistory, hashHistory, Router, applyRouterMiddleware,
} from 'react-router';
import { MuiThemeProvider } from '@material-ui/core/styles';
// import { ThemeProvider } from 'styled-components';
import { useScroll } from 'react-router-scroll';
import { isCordova, setGlobalScreenSize } from './utils/cordovaUtils';
import routes from './Root';
import muiTheme from './mui-theme';
import { ThemeProvider } from './linaria-theme';
import { numberOfNeedlesFoundInString } from './utils/search-functions';
import webAppConfig from './config';


// December 2018:  We want to work toward being airbnb style compliant, but for now these are disabled in this file to minimize massive changes
/* eslint global-require: 1 */
/* eslint no-undef: 1 */
/* eslint react/jsx-filename-extension: 1 */

// polyfill
if (!Object.assign) {
  Object.assign = React.__spread;
}

// Adding functions to the String prototype will make stuff like `for (char in str)` break, because it will loop over the substringOccurences property.
// As long as we use `forEach()` or `for (char of str)` then that side effect will be mitigated.
String.prototype.numberOfNeedlesFoundInString = numberOfNeedlesFoundInString; // eslint-disable-line

function startApp () {
  // http://harrymoreno.com/2015/07/14/Deploying-a-React-App-to-Cordova.html
  // eslint-disable-next-line no-undef
  if (window.device && device.platform === 'iOS') {
    // eslint-disable-next-line no-undef
    console.log(`cordova startup device: ${device}`);
    console.log('cordova startup window.screen: ', window.screen);

    // eslint-disable-next-line global-require
    window.$ = require('jquery');

    // prevent keyboard scrolling our view, https://www.npmjs.com/package/cordova-plugin-keyboard
    if (window.Keyboard) {
      console.log('Cordova startupApp keyboard plugin found');
      Keyboard.shrinkView(true); // eslint-disable-line no-undef
      Keyboard.disableScrollingInShrinkView(true); // eslint-disable-line no-undef
    } else console.log('ERROR: Cordova index.js startApp keyboard plugin WAS NOT found');
  }

  render(
    // eslint-disable-next-line react/jsx-filename-extension
    <MuiThemeProvider theme={muiTheme}>
      <ThemeProvider>
        <Router
          history={isCordova() ? hashHistory : browserHistory}
          render={applyRouterMiddleware(useScroll(() => true))}
        >
          {routes()}
        </Router>
      </ThemeProvider>
    </MuiThemeProvider>, document.getElementById('app'),
  );
}

// ServiceWorker setup for Workbox Progressive Web App (PWA)
if ('ENABLE_WORKBOX_SERVICE_WORKER' in webAppConfig &&
    webAppConfig.ENABLE_WORKBOX_SERVICE_WORKER &&
    'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Preload /ballot/vote so that it will be in cache even if the first visit is while offline
    caches.open('WeVoteSVGCache').then((cache) => {
      cache.match('/ballot/vote').then((response) => {
        if (!response) {
          cache.add('/ballot/vote');
        }
      });
    });
    navigator.serviceWorker.register('/sw.js');
  });
}

// If Apache Cordova is available, wait for it to be ready, otherwise start the WebApp
if (isCordova()) {
  document.addEventListener('deviceready', (id) => {
    console.log('Received Cordova Event: ', id.type);
    navigator.splashscreen.hide();
    window.plugins.screensize.get((result) => {
      setGlobalScreenSize(result);
      startApp();
    }, (result) => {
      console.log('pbakondy/cordova-plugin-screensize FAILURE result: ', result);
    });
  }, false);
} else { // browser
  startApp();
}
