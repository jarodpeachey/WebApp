import React, { PureComponent } from 'react';
import { styled } from 'linaria/react';
import Button from '@material-ui/core/Button';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArrowLeftIcon from '@material-ui/icons/ArrowLeft';
import ArrowRightIcon from '@material-ui/icons/ArrowRight';
import { withTheme } from '../../linaria-theme';
import { cordovaDot } from '../../utils/cordovaUtils';

class AnnotatedSlideshow extends PureComponent {
  static propTypes = {
    slides: PropTypes.object.isRequired,
    selectedStepIndex: PropTypes.number.isRequired,
    onChangeSlide: PropTypes.func,
    classes: PropTypes.object,
  };

  componentDidMount () {
    this.autoAdvanceSlide();
  }

  handleChangeSlide = (advanceIfTrue) => {
    const { selectedStepIndex, slides } = this.props;
    const { length } = Object.keys(slides);
    if ((!advanceIfTrue && selectedStepIndex === 0) || (advanceIfTrue && selectedStepIndex === length - 1)) {
      return;
    }
    // this.handleSlideImage(num);
    this.props.onChangeSlide(advanceIfTrue ? selectedStepIndex + 1 : selectedStepIndex - 1);
    this.autoAdvanceSlide();
  }

  autoAdvanceSlide () {
    clearTimeout(this.timer);
    const { slides, selectedStepIndex } = this.props;
    const data = Object.values(slides);
    const { delayBeforeAdvancingSlide } = data.find(slide => slide.index === selectedStepIndex);
    this.timer = setTimeout(() => {
      this.handleChangeSlide(true);
    }, delayBeforeAdvancingSlide);
  }

  render () {
    const { slides, selectedStepIndex, classes } = this.props;
    const data = Object.values(slides);
    const { length } = data;
    const { title, description, imgSrc } = data.find(slide => slide.index === selectedStepIndex);
    return (
      <Wrapper>
        <SlideShowTitle>{title}</SlideShowTitle>
        <Description>{description}</Description>
        <Slide>
          <Nav disabled={selectedStepIndex === 0} id="howItWorksLeftArrow" onClick={() => this.handleChangeSlide(false)}>
            <ArrowLeftIcon classes={{ root: classes.navIconRoot }} />
          </Nav>
          <Image src={cordovaDot(imgSrc)} />
          <Nav disabled={selectedStepIndex === length - 1} id="howItWorksRightArrow" onClick={() => this.handleChangeSlide(true)}>
            <ArrowRightIcon classes={{ root: classes.navIconRoot }} />
          </Nav>
        </Slide>
        {
          selectedStepIndex < length - 1 && (
            <Button
              color="primary"
              id="howItWorksNext"
              variant="contained"
              classes={{ root: classes.nextButtonRoot }}
              onClick={() => this.handleChangeSlide(true)}
            >
              Next
            </Button>
          )
        }
      </Wrapper>
    );
  }
}

const styles = theme => ({
  navIconRoot: {
    fontSize: 72,
    '&:hover': {
      color: theme.palette.primary.lighter,
    },
  },
  nextButtonRoot: {
    width: '100%',
    [theme.breakpoints.up('lg')]: {
      display: 'none',
    },
  },
});

const Wrapper = withTheme(styled.div`
  display: flex;
  flex-flow: column;
  text-align: left;
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    padding: 1em 0;
  }
`);

const SlideShowTitle = withTheme(styled.h3`
  font-weight: bold;
  font-size: 24px;
  margin-top: 36px;
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    font-size: 20px;
    margin-top: 16px;
  }
`);

const Description = styled.p`
  font-size: 16px;
`;

const Slide = styled.div`
  display: flex;
  flex-flow: row;
  margin: 1em 0 3em 0;
  width: 100%;
  justify-content: space-between;
`;

const Nav = withTheme(styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  margin: auto 0;
  width: 100px;
  height: 100px;
  border-radius: 100rem;
  transition: all 150ms ease-in;
  cursor: ${props => (props.disabled ? 'default' : 'pointer')};
  font-size: 72px;
  background: ${props => (props.disabled ? props.theme.colors.grayPale : theme.colors.grayChip)};
  color: ${props => (props.disabled ? props.theme.colors.grayChip : theme.colors.brandBlue)};
  &:hover {
    filter: ${props => (props.disabled ? '' : 'brightness(102%)')};
  }
  &:active {
    filter: ${props => (props.disabled ? '' : 'brightness(105%)')};
  }
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    display: none;
  }
`);

const Image = withTheme(styled.img`
  width: 640px;
  border: 1px solid #999;
  border-radius: 16px;
  box-shadow: 2px 2px 4px 2px ${props => props.theme.colors.grayLight};
  height: 360px;
  max-width: 90vw;
  transition: all 150ms ease-in;
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    width: 90vw;
    height: calc(90vw * 0.5625);
  }
`);

export default withStyles(styles)(AnnotatedSlideshow);
