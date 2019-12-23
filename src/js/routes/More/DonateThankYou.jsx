import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { styled } from 'linaria/react';
import { withStyles } from '@material-ui/core';
import DonationListForm from '../../components/Donation/DonationListForm';
import { renderLog } from '../../utils/logging';
import WelcomeAppbar from '../../components/Navigation/WelcomeAppbar';
import Section from '../../components/Welcome/Section';
import Footer from '../../components/Welcome/Footer';

class DonateThankYou extends Component {
  render () {
    renderLog('DonateThankYou');  // Set LOG_RENDER_EVENTS to log all renders
    return (
      <Wrapper>
        <Helmet title="Donation Thanks - We Vote" />
        <WelcomeAppbar pathname="/more/pricing" />
        <HeaderForDonate>
          <DonateTitle>Thank you for your donation!</DonateTitle>
        </HeaderForDonate>
        <Section noTopMargin>
          <div className="container-fluid card">
            <DonateCaveat>
              New subscriptions may take a few minutes to appear in this list.  The first payment for new subscriptions may also be delayed.
            </DonateCaveat>
            <div>
              <DonationListForm waitForWebhook />
            </div>
          </div>
        </Section>
        <Footer />
      </Wrapper>
    );
  }
}

const styles = theme => ({
  buttonContained: {
    borderRadius: 32,
    height: 50,
    [theme.breakpoints.down('md')]: {
      height: 36,
    },
  },
});

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background: white;
  overflow-x: hidden;
`;

const HeaderForDonate = styled.div`
  position: relative;
  height: 190px;
  width: 110%;
  color: white;
  background-image: linear-gradient(to bottom, #415a99, #2d3b5e);
  border-bottom-left-radius: 50% 25%;
  border-bottom-right-radius: 50% 25%;
  padding: 0 2em;
  margin-top: -72px;
  text-align: center;
  @media (max-width: ${({ theme }) => theme.breakpoints.lg}) {
    height: 190px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
    height: 150px;
  }
`;

const DonateTitle = styled.h1`
  font-weight: bold;
  font-size: 36px;
  text-align: center;
  margin-top: 3em;
  margin-bottom: 0;
  padding-bottom: 0;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    font-size: 28px;
    margin-top: 3em;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
    font-size: 18px;
    margin-top: 5em;
  }
`;

const DonateCaveat = styled.p`
  font-size: 17px;
  text-align: center;
  margin-top: 1em;
  font-style: italic; 
`;

export default withStyles(styles)(DonateThankYou);

