import React, { PureComponent } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Button from '@material-ui/core/Button';
import { withStyles } from '@material-ui/core/styles';
import LocationIcon from '@material-ui/icons/LocationOn';
import PersonIcon from '@material-ui/icons/Person';
import EmailIcon from '@material-ui/icons/Email';
import ffwdLogo from '../../img/global/logos/ffwd-logo.png';
import googleLogo from '../../img/global/logos/google-logo.svg';
import voteDotOrgLogo from '../../img/global/logos/vote_dot_org_logo-530x200.png';
import vipLogo from '../../img/global/logos/vip-logo-1000x208.png';
import { Title, BlueTitle, SubTitle, Video, PlayerContainer } from '../components/Welcome/HeaderWelcome';
import AddressBoxWelcome from '../components/Welcome/AddressBoxWelcome';
import AnalyticsActions from '../actions/AnalyticsActions';
import { cordovaScrollablePaneTopPadding } from '../utils/cordovaOffsets';
import { historyPush, cordovaDot } from '../utils/cordovaUtils';
import WelcomeFooter from '../components/Welcome/WelcomeFooter';
import { renderLog } from '../utils/logging';
import TextBox from '../components/Welcome/TextBox';
import Testimonial from '../components/Widgets/Testimonial';
import { validateEmail } from '../utils/regex-checks';
import VoterActions from '../actions/VoterActions';
import VoterConstants from '../constants/VoterConstants';
import VoterStore from '../stores/VoterStore';
import Section, {
  SectionTitle,
  SectionTitleBold,
  Step,
  StepNumber,
  StepLabel,
  GetStarted,
  DescriptionContainer,
  DescriptionLeftColumn,
  DescriptionImageColumn,
  Description,
  Image,
  Bold,
  NetworkContainer,
  NetworkImage,
  SignUpContainer,
  SignUpMessage,
} from '../components/Welcome/Section';
import WelcomeAppbar from '../components/Navigation/WelcomeAppbar';
import welcomeForVotersImage from '../../img/welcome/WelcomeForVoters-Ballot-20190507.png';

class WelcomeForVoters extends PureComponent {
  static propTypes = {
    classes: PropTypes.object,
    pathname: PropTypes.string,
  };

  constructor (props) {
    super(props);
    this.state = {
      submitEnabled: false,
      newsletterOptInTrue: false,
      voter: {},
      voterEmail: '',
      voterFullName: '',
    };
  }

  componentDidMount () {
    this.onVoterStoreChange();
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
    AnalyticsActions.saveActionWelcomeVisit(VoterStore.electionId());
  }

  componentWillUnmount () {
    this.voterStoreListener.remove();
  }

  onVoterStoreChange () {
    this.setState({
      newsletterOptInTrue: VoterStore.getNotificationSettingsFlagState(VoterConstants.NOTIFICATION_NEWSLETTER_OPT_IN),
      voter: VoterStore.getVoter(),
    });
  }

  updateVoterFullName = (event) => {
    this.setState({
      voterFullName: event.target.value,
    });
  };

  updateVoterEmailAddress = (event) => {
    const isEmailValid = validateEmail(event.target.value);
    let submitEnabled = false;
    if (isEmailValid) {
      submitEnabled = true;
    }

    this.setState({
      voterEmail: event.target.value,
      submitEnabled,
    });
  };

  voterEmailAddressSignUpSave = (event) => {
    // Only proceed after we have a valid email address, which will enable the submit
    if (this.state.submitEnabled) {
      event.preventDefault();
      const sendLinkToSignIn = true;
      VoterActions.voterEmailAddressSave(this.state.voterEmail, sendLinkToSignIn);
      VoterActions.voterFullNameSoftSave('', '', this.state.voterFullName);
      VoterActions.voterUpdateNotificationSettingsFlags(VoterConstants.NOTIFICATION_NEWSLETTER_OPT_IN);
    }
  };

  handleToPageFromMobileNav = (destination) => {
    this.handleShowMobileNavigation(false);
    historyPush(destination);
  };

  render () {
    renderLog('WelcomeForVoters');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes, pathname } = this.props;
    // console.log('WelcomeForVoters, pathname: ', pathname);
    const { voter, newsletterOptInTrue } = this.state;
    const voterIsSignedIn = voter.is_signed_in;

    const testimonialAuthor = 'Alissa B., Oakland, California';
    const imageUrl = cordovaDot('/img/global/photos/Alissa_B-128x128.jpg');
    const testimonial = 'Great way to sort through my ballot! My husband and I used We Vote during the last election to learn more about our ballots and make some tough choices. Between following various organizations, and friending a couple of trusted friends, we felt like we had an excellent pool of information to draw from. It was so great!';
    return (
      <Wrapper padTop={cordovaScrollablePaneTopPadding()}>
        <Helmet title="Welcome Voters - We Vote" />
        <WelcomeAppbar pathname={pathname} />
        <HeaderForVoters>
          <Title>
            Plan Your Entire Ballot
            <BlueTitle> in 6 Minutes</BlueTitle>
          </Title>
          <SubTitle>Finally, a simple way to fill out your ballot.</SubTitle>
          <GetStarted>
            <AddressBoxWelcome icon={
              <LocationIcon classes={{ root: classes.locationIcon }} />
            }
            />
            <Button
              variant="contained"
              color="primary"
              classes={{ containedPrimary: classes.viewBallotButton }}
              id="welcomeForVotersViewBallot"
              onClick={() => historyPush('/ballot')}
            >
              View Ballot
            </Button>
          </GetStarted>
        </HeaderForVoters>
        <Section>
          <SectionTitle>
            We Vote is
            <SectionTitleBold> Free &amp; Easy</SectionTitleBold>
          </SectionTitle>
          <Step>
            <StepNumber>1</StepNumber>
            <StepLabel>Choose your interests</StepLabel>
          </Step>
          <Step>
            <StepNumber>2</StepNumber>
            <StepLabel>Follow organizations and people you trust</StepLabel>
          </Step>
          <Step>
            <StepNumber>3</StepNumber>
            <StepLabel>See who endorsed each choice on your ballot</StepLabel>
          </Step>
          <Step>
            <StepNumber>4</StepNumber>
            <StepLabel>Fill out the whole thing in under 6 minutes</StepLabel>
          </Step>
        </Section>
        <Section variant="dark" rounded>
          <SectionTitle>
            Voting Should be
            <SectionTitleBold> Simple</SectionTitleBold>
          </SectionTitle>
          <PlayerContainer>
            <Video
              src="https://player.vimeo.com/video/329164243"
              frameBorder="0"
              allow="fullscreen"
            />
            <script src="https://player.vimeo.com/api/player.js" />
          </PlayerContainer>
          <DescriptionContainer>
            <DescriptionLeftColumn>
              <Description>
                <Bold>We&apos;ve all been there. </Bold>
                Election day is almost here, but besides the President and a few other choices we&apos;ve made, we don&apos;t know how we are going to vote! Between the nonstop misleading TV ads, texts, calls and overflowing mailboxes, who has time to make sense of the madness? There has to be a better way.
              </Description>
              <Description>Now, there is!</Description>
              <Description>We&apos;ll help you confidently fill out your specific ballot with endorsements from organizations and friends you trust, all in one place.</Description>
              <Description>
                <Button
                  variant="contained"
                  color="primary"
                  classes={{ root: classes.buttonMaxWidth, containedPrimary: classes.buttonContained }}
                  id="welcomeForVotersHowItWorksForVoters"
                  onClick={() => historyPush('/how/for-voters')}
                >
                  How it Works For Voters
                </Button>
              </Description>
            </DescriptionLeftColumn>
            <DescriptionImageColumn>
              <Image src={cordovaDot(welcomeForVotersImage)} />
            </DescriptionImageColumn>
          </DescriptionContainer>
        </Section>
        <Section>
          <SectionTitle>Testimonials</SectionTitle>
          <DescriptionContainer>
            <Testimonial
              imageUrl={imageUrl}
              testimonialAuthor={testimonialAuthor}
              testimonial={testimonial}
            />
            {/*
            <Testimonial
              imageUrl={imageUrl}
              testimonialAuthor={testimonialAuthor}
              testimonial={testimonial}
            />
            */}
          </DescriptionContainer>
        </Section>
        <Section variant="dark" rounded={!voterIsSignedIn}>
          <SectionTitle>Our Network</SectionTitle>
          <NetworkContainer>
            <NetworkImage src={cordovaDot(ffwdLogo)} alt="Fast Forward" />
            <NetworkImage src={cordovaDot(googleLogo)} alt="Google" />
            {/* <NetworkImage src={cordovaDot('/img/global/logos/ctcl_logo-200x200.png')} alt="Center for Technology and Civic Life" /> */}
            <NetworkImage src={cordovaDot(voteDotOrgLogo)} alt="Vote.org" />
            <NetworkImage src={cordovaDot(vipLogo)} alt="Voting Information Project" />
          </NetworkContainer>
        </Section>
        {
          !voterIsSignedIn && (
            <Section>
              <SectionTitle>Sign up to get updates about We Vote</SectionTitle>
              <SignUpContainer>
                <TextBox
                  icon={<PersonIcon />}
                  placeholder="Full Name"
                  value={this.state.voterFullName}
                  inputProps={{ onChange: this.updateVoterFullName }}
                />
                <TextBox
                  icon={<EmailIcon />}
                  placeholder="Email"
                  value={this.state.voterEmail}
                  inputProps={{ type: 'email', onChange: this.updateVoterEmailAddress }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  classes={{ root: classes.buttonMaxWidth, containedPrimary: classes.buttonContained }}
                  onClick={this.voterEmailAddressSignUpSave}
                >
                  Sign Up
                </Button>
                {newsletterOptInTrue === 1 && <SignUpMessage>Please check your email for a verification link</SignUpMessage>}
              </SignUpContainer>
            </Section>
          )
        }
        <WelcomeFooter />
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
  buttonMaxWidth: {
    width: '100%',
  },
  iconButton: {
    color: 'white',
  },
  viewBallotButton: {
    borderRadius: 32,
    height: 50,
    [theme.breakpoints.down('md')]: {
      height: 36,
    },
    background: 'linear-gradient(180deg, white, rgb(178, 200, 255))',
    color: '#2e3c5d',
    fontWeight: 'bold',
    paddingLeft: 30,
    paddingRight: 30,
    marginTop: 15,
  },
  locationIcon: {
    color: '#2e3c5d',
  },
});

const HeaderForVoters = styled.div`
  position: relative;
  width: 110%;
  color: white;
  background-image: linear-gradient(to bottom, #415a99, #2d3b5e);
  border-bottom-left-radius: 50% 25%;
  border-bottom-right-radius: 50% 25%;
  padding: 0 2em;
  margin-top: -72px;
`;

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background: white;
  overflow-x: hidden;
  padding-top: ${({ padTop }) => padTop};
`;

export default withStyles(styles)(WelcomeForVoters);
