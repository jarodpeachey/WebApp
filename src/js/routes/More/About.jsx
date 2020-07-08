import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import { cordovaScrollablePaneTopPadding } from '../../utils/cordovaOffsets';
import { cordovaDot } from '../../utils/cordovaUtils';
import AnalyticsActions from '../../actions/AnalyticsActions';
import { renderLog } from '../../utils/logging';
import WelcomeFooter from '../../components/Welcome/WelcomeFooter';
import OpenExternalWebSite from '../../components/Widgets/OpenExternalWebSite';
import Section, {
  Bold,
  DescriptionContainer,
  SectionTitle,
  MemberListContainer,
} from '../../components/Welcome/Section';
import TeamMemberDisplayForList from '../../components/More/TeamMemberDisplayForList';
import ToolBar from './ToolBar';
import VoterStore from '../../stores/VoterStore';
import { weVoteBoard, weVoteFounders, weVoteStaff } from '../../components/More/people';
import WelcomeAppbar from '../../components/Navigation/WelcomeAppbar';
import { Title } from '../../components/Welcome/HeaderWelcome';
import ShowMoreButtons from '../../components/ReadyNoApi/ShowMoreButtons';

class About extends Component {
  static getProps () {
    return {};
  }

  constructor (props) {
    super(props);
    this.state = {
      showAllFounders: false,
      showAllBoard: false,
      showAllStaff: false,
      showMoreButtonWasClickedFounders: false,
      showMoreButtonWasClickedBoard: false,
      showMoreButtonWasClickedStaff: false,
    };
  }

  componentDidMount () {
    AnalyticsActions.saveActionAboutMobile(VoterStore.electionId());
  }

  showMoreButtonsLinkFounders = () => {
    const { showMoreButtonWasClickedFounders, showAllFounders } = this.state;
    this.setState({
      showMoreButtonWasClickedFounders: !showMoreButtonWasClickedFounders,
      showAllFounders: !showAllFounders,
    });
  }

  showMoreButtonsLinkBoard = () => {
    const { showMoreButtonWasClickedBoard, showAllBoard } = this.state;
    this.setState({
      showMoreButtonWasClickedBoard: !showMoreButtonWasClickedBoard,
      showAllBoard: !showAllBoard,
    });
  }

  showMoreButtonsLinkStaff = () => {
    const { showMoreButtonWasClickedStaff, showAllStaff } = this.state;
    this.setState({
      showMoreButtonWasClickedStaff: !showMoreButtonWasClickedStaff,
      showAllStaff: !showAllStaff,
    });
  }



  render () {
    renderLog('About');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      showMoreButtonWasClickedFounders, showMoreButtonWasClickedBoard, showMoreButtonWasClickedStaff,
      showAllFounders, showAllBoard, showAllStaff,
    } = this.state;
    let showShowMoreButtonFounders = true;
    let showShowMoreButtonBoard = true;
    let showShowMoreButtonStaff = true;
    if (weVoteFounders.length <= 2) { showShowMoreButtonFounders = false; }
    if (weVoteBoard.length <= 2) { showShowMoreButtonBoard = false; }
    if (weVoteStaff.length <= 2) { showShowMoreButtonStaff = false; }
    return (
      <Wrapper padTop={cordovaScrollablePaneTopPadding()}>
        <Helmet title="About We Vote" />
        <WelcomeAppbar pathname="/more/about" />
        <HeaderForAbout>
          <Title>About We Vote</Title>
          <ToolBar />
        </HeaderForAbout>
        <Section noTopMargin>
          <DescriptionContainer>
            <DescriptionLeftColumn>
              We Vote is a nonprofit technology startup, building the next generation of voting tech. We
              {'\''}
              re starting by creating a digital voter guide informed by issues you care about, and people you trust.
              {' '}
              Through our nonpartisan, open source platform, we
              {'\''}
              ll help you become a better voter, up and down the ballot.
            </DescriptionLeftColumn>
            <DescriptionImageColumn>
              <figure>
                <Image
                  alt="We Vote at iOS Dev camp, where we won 'Best App for Good'."
                  title="We Vote at iOS Dev camp, where we won 'Best App for Good'."
                  src={cordovaDot('/img/global/photos/iOSDevCamp2016.png')}
                />
                <AboutFigCaption>We Vote at iOS Dev camp.</AboutFigCaption>
              </figure>
            </DescriptionImageColumn>
          </DescriptionContainer>
        </Section>
        <Section noTopMargin>
          <SectionTitle>
            Our Vision
          </SectionTitle>
          <AboutDescriptionContainer>
            Imagine what would be different if everyone voted in every election...
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            Currently, the U.S. trails most developed nations in voter turnout.
            {' '}
            Only 6 out of 10 eligible voters is expected to cast a ballot this year.
            {' '}
            Improving overall voter participation is a responsibility shared by all of us.
            {' '}
            Even in today
            {'\''}
            s tense political climate, we all can agree that it should be much easier to decide how to vote.
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            Our vision is to build a world where
            &nbsp;
            <Bold>no one misses a voting opportunity</Bold>
            &nbsp;
            because they don
            {'\''}
            t have the info they need to make their individual choice.
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            We are creating easy-to-use tools that cut through the election noise and help voters easily understand what
            {'\''}
            s on their ballot.
            {' '}
            Our open platform empowers voters to create and share voter guides that aggregate
            {' '}
            information and opinions across personal networks.
            {' '}
            So you can help your friends be better voters too.
          </AboutDescriptionContainer>
        </Section>
        <Section variant="dark" rounded>
          <SectionTitle>
            Our Approach
          </SectionTitle>
          <AboutDescriptionContainer>
            We Vote is made of two fully nonpartisan nonprofit organizations (501(c)(3) and 501(c)(4)) based in Oakland, California. Our software is open source, and our work is driven by over 100 volunteers who have contributed so far. Inspired by groups like
            <OpenExternalWebSite
              url="http://codeforsanfrancisco.org/"
              target="_blank"
              body={(
                <span>
                  Code for America&nbsp;
                  <i className="fas fa-external-link-alt" />
                </span>
              )}
            />
            and the
            <OpenExternalWebSite
              url="https://www.mozilla.org/en-US/foundation/"
              target="_blank"
              className="open-web-site open-web-site__no-right-padding"
              body={(
                <span>
                  Mozilla Foundation&nbsp;
                  <i className="fas fa-external-link-alt" />
                </span>
              )}
            />
            , we use technology to make democracy stronger by increasing voter turnout. Our incredible teams of volunteers help us to compile and verify endorsement data from every election.
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            We are purposefully nonpartisan because we know that voters and their networks are complex. Voting decisions are rarely single issue, and we make better decisions when lots of information is present.
          </AboutDescriptionContainer>
        </Section>
        <Section>
          <SectionTitle>
            Our Team
          </SectionTitle>
          <AboutDescriptionContainer>
            <h2 className="h2">Founders</h2>
          </AboutDescriptionContainer>
          <MemberListContainer>
            <div className="row position-relative">
              {showShowMoreButtonFounders && (
                <>
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteFounders[0].name}-${weVoteFounders[0].title[0]}`} teamMember={weVoteFounders[0]} />
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteFounders[1].name}-${weVoteFounders[1].title[0]}`} teamMember={weVoteFounders[1]} />
                </>
              )}
              {(!showShowMoreButtonFounders || showAllFounders) && (
                weVoteFounders.map(teamMember => (
                  <TeamMemberDisplayForList key={`teamDisplay-${teamMember.name}-${teamMember.title[0]}`} teamMember={teamMember} />
                ))
              )}
            </div>
            <div>
              {showShowMoreButtonFounders && (
                <ShowMoreButtons
                showMoreId="showMoreBallotButtons"
                showMoreButtonWasClicked={showMoreButtonWasClickedFounders}
                showMoreButtonsLink={this.showMoreButtonsLinkFounders}
                />
              )}
            </div>
          </MemberListContainer>
          <AboutDescriptionContainer>
            <h2 className="h2">Board Members &amp; Advisers</h2>
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            <div className="row position-relative">
              {showShowMoreButtonBoard && (
                <>
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteBoard[0].name}-${weVoteBoard[0].title[0]}`} teamMember={weVoteBoard[0]} />
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteBoard[1].name}-${weVoteBoard[1].title[0]}`} teamMember={weVoteBoard[1]} />
                </>
              )}
              {(!showShowMoreButtonBoard || showAllBoard) && (
                weVoteBoard.map(teamMember => (
                  <TeamMemberDisplayForList key={`teamDisplay-${teamMember.name}-${teamMember.title[0]}`} teamMember={teamMember} />
                ))
              )}
            </div>
            <div>
              {showShowMoreButtonBoard && (
                <ShowMoreButtons
                  showMoreId="showMoreBallotButtons"
                  showMoreButtonWasClicked={showMoreButtonWasClickedBoard}
                  showMoreButtonsLink={this.showMoreButtonsLinkBoard}
                />
              )}
            </div>
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            <h2 className="h2">Staff &amp; Senior Volunteers</h2>
          </AboutDescriptionContainer>
          <AboutDescriptionContainer>
            <div className="row position-relative">
              {showShowMoreButtonStaff && (
                <>
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteStaff[0].name}-${weVoteStaff[0].title[0]}`} teamMember={weVoteStaff[0]} />
                  <TeamMemberDisplayForList key={`teamDisplay-${weVoteStaff[1].name}-${weVoteStaff[1].title[0]}`} teamMember={weVoteStaff[1]} />
                </>
              )}
              {(!showShowMoreButtonStaff || showAllStaff) && (
                weVoteStaff.map(teamMember => (
                  <TeamMemberDisplayForList key={`teamDisplay-${teamMember.name}-${teamMember.title[0]}`} teamMember={teamMember} />
                ))
              )}
            </div>
            <div>
              {showShowMoreButtonStaff && (
                <ShowMoreButtons
                  showMoreId="showMoreBallotButtons"
                  showMoreButtonWasClicked={showMoreButtonWasClickedStaff}
                  showMoreButtonsLink={this.showMoreButtonsLinkStaff}
                />
              )}
            </div>
          </AboutDescriptionContainer>
        </Section>
        <Section variant="dark" rounded>
          <SectionTitle>
            Our Funders &amp; Champions
          </SectionTitle>
          <AboutDescriptionContainer>
            We are thankful for
            {' '}
            <Link to="/more/credits" onlyActiveOnIndex>
              our volunteers, our board of directors, our funders, and the organizations
              &nbsp;
              <i className="fas fa-external-link-alt" />
            </Link>
            {' '}
            that are critical to our work.
          </AboutDescriptionContainer>
        </Section>
        <Section>
          <SectionTitle>
            Our Story
          </SectionTitle>
          <AboutDescriptionContainer>
            Founded in 2014, the idea of a nonprofit “Yelp for Politics” was born. We Vote would be a community for voters, created by people concerned about where this country is heading.
            {' '}
            Being an open source, volunteer-driven project means anyone can contribute. Kind of like democracy.
          </AboutDescriptionContainer>
        </Section>
        <Section>
          &nbsp;
        </Section>
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
});

const Wrapper = styled.div`
  display: flex;
  flex-flow: column nowrap;
  align-items: center;
  background: white;
  overflow-x: hidden;
  padding-top: ${({ padTop }) => padTop};
`;

const HeaderForAbout = styled.div`
  position: relative;
  height: 230px;
  width: 110%;
  color: white;
  background-image: linear-gradient(to bottom, #415a99, #2d3b5e);
  border-bottom-left-radius: 50% 25%;
  border-bottom-right-radius: 50% 25%;
  padding: 0 2em;
  margin-top: -72px;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    height: 230px;
  }
  @media (max-width: ${({ theme }) => theme.breakpoints.xs}) {
    height: 215px;
  }
`;

const AboutDescriptionContainer = styled.div`
  margin: 1em auto;
  width: 960px;
  max-width: 90vw;
  text-align: left;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    text-align: center;
  }
`;

const DescriptionLeftColumn = styled.div`
  display: flex;
  flex-flow: column;
  padding: 0 20px 0 0;
  width: 65%;
  justify-content: center;
  text-align: left;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    width: 100%;
    text-align: center;
  }
`;

const DescriptionImageColumn = styled.div`
  width: 35%;
  text-align: right;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: 1em 0 0 0;
    text-align: center;
    width: 100%;
  }
`;

const Image = styled.img`
  width: 100%:
`;

const AboutFigCaption = styled.figcaption`
  color: #555 !default;
  font-size: .8rem;
  text-align: center;
`;

export default withStyles(styles)(About);
