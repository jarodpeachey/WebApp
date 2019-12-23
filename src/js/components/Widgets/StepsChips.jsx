import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { styled } from 'linaria/react';
import { withTheme } from '../../linaria-theme';


class StepChips extends PureComponent {
  static propTypes = {
    chips: PropTypes.array.isRequired,
    selected: PropTypes.number,
    mobile: PropTypes.bool,
    onSelectStep: PropTypes.func,
  };

  generateChips = () => this.props.chips.map((item, idx) => (
    <React.Fragment key={item}>
      {
        !this.props.mobile ? (
          <Chip
            id={`howItWorksChip${idx}`}
            count={this.props.chips.length}
            selected={this.props.selected === idx}
            onClick={() => this.props.onSelectStep(idx)}
          >
            <ChipIndex selected={this.props.selected === idx}>{idx + 1}</ChipIndex>
            <ChipLabel>{item}</ChipLabel>
          </Chip>
        ) : (
          <ChipIndex
            id={`howItWorksChipMobile${idx}`}
            selected={this.props.selected === idx}
            onClick={() => this.props.onSelectStep(idx)}
          >
            {idx + 1}
          </ChipIndex>
        )
      }
    </React.Fragment>
  ));

  render () {
    return (
      <Wrapper>
        {this.generateChips()}
      </Wrapper>
    );
  }
}

const Wrapper = withTheme(styled.div`
  display: flex;
  flex-flow: row;
  height: 44px;
  width: 100%;
  margin: 16px 0;
  background: ${props => props.theme.colors.grayPale};
  justify-content: space-between;
  border-radius: 64px;
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    background: rgba(255, 255, 255, 0.1);
    height: 32px;
    margin: auto 0;
    padding: 0 4px;
  }
`);

const Chip = withTheme(styled.div`
  display: flex;
  flex-flow: row;
  min-width: 100px;
  width: ${props => `${100 / props.count}%`};
  font-size: 16px;
  height: 36px;
  cursor: pointer;
  background: ${props => (props.selected ? props.theme.colors.brandBlue : props.theme.colors.grayChip)};
  color: ${props => (props.selected ? 'white' : props.theme.colors.brandBlue)};
  border-radius: 64px;
  margin: auto 6px;
  transition: all 150ms ease-in;
  &:hover {
    filter: brightness(98%);
  }
  &:active {
    filter: brightness(102%);
  }
`);

const ChipIndex = withTheme(styled.p`
  margin: auto 6px;
  background: ${props => (props.selected ? props.theme.colors.brandBlue : props.theme.colors.grayPale)};
  border-radius: 64px;
  padding: 2px 9px;
  font-weight: bold;
  transition: all 150ms ease-in;
  cursor: pointer;
  filter: ${({ selected }) => (selected ? 'brightness(150%)' : 'brightness(100%)')};
  @media (max-width: ${props => props.theme.breakpoints.lg}) {
    color: ${props => props.theme.colors.brandBlue};
    background: ${props => (props.selected ? 'white' : 'rgba(255, 255, 255, 0.2)')};
    margin: auto 2px;
    font-size: 14px;
    padding: 2px 8px;
  }
`);

const ChipLabel = styled.p`
  margin: auto;
  font-weight: bold;
  padding-right: 24px;
  transition: all 150ms ease-in;
`;

export default StepChips;
