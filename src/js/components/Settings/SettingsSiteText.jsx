import React, { Component } from 'react';
import Helmet from 'react-helmet';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import CreateConfiguredVersion from './CreateConfiguredVersion';
import LoadingWheel from '../LoadingWheel';
import OrganizationActions from '../../actions/OrganizationActions';
import OrganizationStore from '../../stores/OrganizationStore';
import { renderLog } from '../../utils/logging';
import SeeTheseSettingsInAction from './SeeTheseSettingsInAction';
import SettingsAccount from './SettingsAccount';
import VoterStore from '../../stores/VoterStore';

class SettingsSiteText extends Component {
  static propTypes = {
    classes: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      chosenFeaturePackage: 'FREE',
      siteTextButtonsActive: '',
      organizationWeVoteId: '',
      organizationReadyIntroductionText: '',
      organizationReadyIntroductionTextSavedValue: '',
      organizationReadyIntroductionTextChangedLocally: false,
      organizationReadyIntroductionTitle: '',
      organizationReadyIntroductionTitleSavedValue: '',
      organizationReadyIntroductionTitleChangedLocally: false,
      voter: {},
      voterIsSignedIn: false,
    };
  }

  componentDidMount () {
    // console.log("SettingsSiteText componentDidMount");
    this.onVoterStoreChange();
    this.onOrganizationStoreChange();
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.organizationStoreListener.remove();
    this.voterStoreListener.remove();
  }

  onOrganizationStoreChange = () => {
    const { organizationReadyIntroductionTitleChangedLocally, organizationReadyIntroductionTextChangedLocally, organizationWeVoteId } = this.state;
    if (organizationWeVoteId) {
      const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      const organizationReadyIntroductionTitleSavedValue = organization.chosen_ready_introduction_title || '';
      const organizationReadyIntroductionTextSavedValue = organization.chosen_ready_introduction_text || '';
      const chosenFeaturePackage = OrganizationStore.getChosenFeaturePackage();
      this.setState({
        chosenFeaturePackage,
        organizationReadyIntroductionTitleSavedValue,
        organizationReadyIntroductionTextSavedValue,
      });
      // If it hasn't been changed locally, then use the one saved in the API server
      if (!organizationReadyIntroductionTitleChangedLocally) {
        this.setState({
          organizationReadyIntroductionTitle: organizationReadyIntroductionTitleSavedValue || '',
        });
      }
      // If it hasn't been changed locally, then use the one saved in the API server
      if (!organizationReadyIntroductionTextChangedLocally) {
        this.setState({
          organizationReadyIntroductionText: organizationReadyIntroductionTextSavedValue || '',
        });
      }
    }
  };

  onVoterStoreChange = () => {
    const { organizationReadyIntroductionTitleChangedLocally, organizationReadyIntroductionTextChangedLocally } = this.state;
    const voter = VoterStore.getVoter();
    const voterIsSignedIn = voter.is_signed_in;
    this.setState({
      voter,
      voterIsSignedIn,
    });
    const organizationWeVoteId = voter.linked_organization_we_vote_id;
    if (organizationWeVoteId) {
      const organization = OrganizationStore.getOrganizationByWeVoteId(organizationWeVoteId);
      const organizationReadyIntroductionTitleSavedValue = organization.chosen_ready_introduction_title || '';
      const organizationReadyIntroductionTextSavedValue = organization.chosen_ready_introduction_text || '';
      const chosenFeaturePackage = OrganizationStore.getChosenFeaturePackage();
      this.setState({
        chosenFeaturePackage,
        organizationReadyIntroductionTitleSavedValue,
        organizationReadyIntroductionTextSavedValue,
        organizationWeVoteId,
      });
      // If it hasn't been changed locally, then use the one saved in the API server
      if (!organizationReadyIntroductionTitleChangedLocally) {
        this.setState({
          organizationReadyIntroductionTitle: organizationReadyIntroductionTitleSavedValue || '',
        });
      }
      // If it hasn't been changed locally, then use the one saved in the API server
      if (!organizationReadyIntroductionTextChangedLocally) {
        this.setState({
          organizationReadyIntroductionText: organizationReadyIntroductionTextSavedValue || '',
        });
      }
    }
  };

  handleOrganizationReadyIntroductionTextChange = (event) => {
    const { organizationReadyIntroductionText } = this.state;
    // console.log('handleOrganizationReadyIntroductionTextChange, organizationReadyIntroductionText: ', organizationReadyIntroductionText);
    // console.log('handleOrganizationReadyIntroductionTextChange, event.target.value: ', event.target.value);
    if (event.target.value !== organizationReadyIntroductionText) {
      this.setState({
        siteTextButtonsActive: 'organizationReadyIntroductionButtonsActive',
        organizationReadyIntroductionText: event.target.value || '',
        organizationReadyIntroductionTextChangedLocally: true,
      });
    }
  };

  handleOrganizationReadyIntroductionTitleChange = (event) => {
    const { organizationReadyIntroductionTitle } = this.state;
    // console.log('handleOrganizationReadyIntroductionTitleChange, organizationReadyIntroductionTitle: ', organizationReadyIntroductionTitle);
    // console.log('handleOrganizationReadyIntroductionTitleChange, event.target.value: ', event.target.value);
    if (event.target.value !== organizationReadyIntroductionTitle) {
      this.setState({
        siteTextButtonsActive: 'organizationReadyIntroductionButtonsActive',
        organizationReadyIntroductionTitle: event.target.value || '',
        organizationReadyIntroductionTitleChangedLocally: true,
      });
    }
  };

  showReadyIntroductionButtons = () => {
    const { siteTextButtonsActive } = this.state;
    if (siteTextButtonsActive !== 'organizationReadyIntroductionButtonsActive') {
      this.setState({
        siteTextButtonsActive: 'organizationReadyIntroductionButtonsActive',
      });
    }
  };

  onCancelReadyIntroductionButton = () => {
    // console.log('onCancelReadyIntroductionButton');
    const { organizationReadyIntroductionTextSavedValue, organizationReadyIntroductionTitleSavedValue } = this.state;
    this.setState({
      organizationReadyIntroductionText: organizationReadyIntroductionTextSavedValue || '',
      organizationReadyIntroductionTitle: organizationReadyIntroductionTitleSavedValue || '',
      organizationReadyIntroductionTextChangedLocally: false,
      organizationReadyIntroductionTitleChangedLocally: false,
    });
  };

  onSaveReadyIntroductionButton = (event) => {
    // console.log('onSaveReadyIntroductionButton');
    const { organizationReadyIntroductionText, organizationReadyIntroductionTitle, organizationWeVoteId } = this.state;
    OrganizationActions.organizationChosenReadyIntroductionSave(organizationWeVoteId, organizationReadyIntroductionTitle, organizationReadyIntroductionText);
    this.setState({
      organizationReadyIntroductionTextChangedLocally: false,
      organizationReadyIntroductionTitleChangedLocally: false,
    });
    event.preventDefault();
  };

  render () {
    renderLog('SettingsSiteText');  // Set LOG_RENDER_EVENTS to log all renders
    const {
      chosenFeaturePackage,
      organizationWeVoteId, voter, voterIsSignedIn, siteTextButtonsActive,
      organizationReadyIntroductionText, organizationReadyIntroductionTitle,
      organizationReadyIntroductionTextChangedLocally, organizationReadyIntroductionTitleChangedLocally,
    } = this.state;
    const { classes } = this.props;
    if (!voterIsSignedIn) {
      // console.log('voterIsSignedIn is false');
      return <SettingsAccount />;
    } else if (!voter || !organizationWeVoteId) {
      return LoadingWheel;
    }

    return (
      <div>
        <Helmet title="Site Text" />
        <div className="card">
          <div className="card-main">
            <h1 className="h2">Site Text</h1>
            {chosenFeaturePackage === 'FREE' && (
              <>
                <CreateConfiguredVersion />
                <Separator />
              </>
            )}
            <SeeTheseSettingsInAction />
            <Separator />
            <FormControl classes={{ root: classes.formControl }}>
              <InputLabel>&quot;Ready?&quot; Page Introduction</InputLabel>
              <InputLabelHelperText>
                Add introduction title and text to welcome people visiting your site&apos;s &quot;Ready?&quot; page.
              </InputLabelHelperText>
              <TextField
                id="addTitleHereInput"
                onChange={this.handleOrganizationReadyIntroductionTitleChange}
                onClick={this.showReadyIntroductionButtons}
                label="Add Title here..."
                variant="outlined"
                value={organizationReadyIntroductionTitle}
              />
              <TextField
                id="addIntroductionHereInput"
                onChange={this.handleOrganizationReadyIntroductionTextChange}
                onClick={this.showReadyIntroductionButtons}
                label="Add introduction text here..."
                variant="outlined"
                value={organizationReadyIntroductionText}
              />
            </FormControl>
            {siteTextButtonsActive === 'organizationReadyIntroductionButtonsActive' ? (
              <ButtonsContainer>
                <Button
                  classes={{ root: classes.button }}
                  color="primary"
                  disabled={!organizationReadyIntroductionTextChangedLocally && !organizationReadyIntroductionTitleChangedLocally}
                  onClick={this.onCancelReadyIntroductionButton}
                  variant="outlined"
                >
                  Cancel
                </Button>
                <Button
                  id="siteTextSaveButton"
                  color="primary"
                  disabled={!organizationReadyIntroductionTextChangedLocally && !organizationReadyIntroductionTitleChangedLocally}
                  onClick={this.onSaveReadyIntroductionButton}
                  variant="contained"
                >
                  Save
                </Button>
              </ButtonsContainer>
            ) : null}
          </div>
        </div>
      </div>
    );
  }
}

const styles = () => ({
  formControl: {
    width: '100%',
  },
  textField: {
    height: 45,
  },
  button: {
    marginRight: 8,
  },
  goldButton: {
    background: 'linear-gradient(70deg, rgba(219,179,86,1) 14%, rgba(162,124,33,1) 94%)',
    color: 'white',
  },
});

const InputLabel = styled.h4`
  font-size: 14px;
  font-weight: bold;
`;

const InputLabelHelperText = styled.p`
  font-size: 14px;
  font-weight: normal;
`;

const ButtonsContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  width: fit-content;
  width: 100%;
  margin-top: 12px;
`;

const Separator = styled.div`
  width: 100%;
  height: 2px;
  background: #eee;
  margin: 16px 0;
`;

export default withStyles(styles)(SettingsSiteText);
