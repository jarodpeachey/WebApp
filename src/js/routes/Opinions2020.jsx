import React, { Component } from 'react';
import { Link } from 'react-router';
import PropTypes from 'prop-types';
import ReactSVG from 'react-svg';
import uniqBy from 'lodash-es/uniqBy';
import { withStyles } from '@material-ui/core/styles';
import Card from '@material-ui/core/Card';
import BallotIcon from '@material-ui/icons/Ballot';
import styled from 'styled-components';
import AnalyticsActions from '../actions/AnalyticsActions';
import BallotItemForOpinions from '../components/OpinionsAndBallotItems/BallotItemForOpinions';
import BallotActions from '../actions/BallotActions';
import BallotStore from '../stores/BallotStore';
import CandidateSearchItemForOpinions from '../components/OpinionsAndBallotItems/CandidateSearchItemForOpinions';
import { renderLog } from '../utils/logging';
import FilterBase from '../components/Filter/FilterBase';
import groupIcon from '../../img/global/svg-icons/group-icon.svg';
import { cordovaDot } from '../utils/cordovaUtils';
import LoadingWheel from '../components/LoadingWheel';
import NumberOfItemsFound from '../components/Widgets/NumberOfItemsFound';
import OrganizationActions from '../actions/OrganizationActions';
import organizationIcon from '../../img/global/svg-icons/organization-icon.svg';
import OrganizationStore from '../stores/OrganizationStore';
import OpinionsAndBallotItemsFilter from '../components/Filter/OpinionsAndBallotItemsFilter';
import ShowMoreItems from '../components/Widgets/ShowMoreItems';
import { arrayContains, stringContains } from '../utils/textFormat';
import VoterGuideDisplayForListForOpinions from '../components/OpinionsAndBallotItems/VoterGuideDisplayForListForOpinions';
import VoterGuideStore from '../stores/VoterGuideStore';
import VoterStore from '../stores/VoterStore';


const groupedFilters = [
  // {
  //   filterName: 'showFederalRaceFilter',
  //   filterDisplayName: 'Federal',
  //   filterId: 'federalRaceFilter',  // thumbUpFilter
  // },
];

const islandFilters = [
  {
    filterName: 'showOrganizationsFilter',
    icon: <ReactSVG src={cordovaDot(organizationIcon)} svgStyle={{ backgroundColor: '#fff', borderRadius: '3px', fill: '#555', width: '16px', height: '16px' }} alt="Visible to Public" />,
    filterDisplayName: 'Organizations',
    filterId: 'islandFilterOrganizations',
  },
  {
    filterName: 'showPublicFiguresFilter',
    icon: <ReactSVG src={cordovaDot(groupIcon)} svgStyle={{ backgroundColor: '#fff', borderRadius: '3px', fill: '#555', width: '16px', height: '16px' }} alt="Visible to Public" />,
    filterDisplayName: 'Public Figures',
    filterId: 'islandFilterOrganizations',
  },
  {
    filterName: 'showBallotItemsFilter',
    icon: <BallotIcon />,
    filterDisplayName: 'Ballot',
    filterId: 'islandFilterBallotItems',
  },
];

class Opinions2020 extends Component {
  static propTypes = {
    classes: PropTypes.object,
    params: PropTypes.object,
  };

  constructor (props) {
    super(props);
    this.state = {
      allBallotItems: [],
      allBallotItemSearchResults: [],
      allOrganizationSearchResults: [],
      ballotItemWeVoteIdsAlreadyFoundList: [],
      ballotSearchResults: [],
      currentSelectedBallotFilters: [], // So we know when the ballot filters change
      filteredOpinionsAndBallotItems: [],
      isSearching: false,
      localAllBallotItemsHaveBeenRetrieved: {},
      localPositionListHasBeenRetrieved: {},
      numberOfBallotItemsToDisplay: 5,
      organizationWeVoteIdsAlreadyFoundList: [],
      searchText: '',
      searchTextDefault: '',
      selectedFiltersAddDefault: [],
      stateCodeFromIpAddress: '',
      stateCodeToRetrieve: '',
      totalNumberOfBallotItems: 0,
      allVoterGuides: [],
    };
    this.onScroll = this.onScroll.bind(this);
  }

  componentDidMount () {
    this.setState({
      numberOfBallotItemsToDisplay: 5,
    });
    this.ballotStoreListener = BallotStore.addListener(this.onBallotStoreChange.bind(this));
    this.organizationStoreListener = OrganizationStore.addListener(this.onOrganizationStoreChange.bind(this));
    this.voterGuideStoreListener = VoterGuideStore.addListener(this.onVoterGuideStoreChange.bind(this));
    this.voterStoreListener = VoterStore.addListener(this.onVoterStoreChange.bind(this));

    const { searchTextDefault, selectedFilter } = this.props.params;
    const selectedFiltersAddDefault = ['sortByAlphabetical'];
    // console.log('selectedFilter:', selectedFilter);
    if (selectedFilter) {
      // Options: showBallotItemsFilter, showOrganizationsFilter, showPublicFiguresFilter
      selectedFiltersAddDefault.push(selectedFilter);
      this.setState({
        selectedFiltersAddDefault,
      });
    }
    if (searchTextDefault) {
      AnalyticsActions.saveActionSearchOpinions(VoterStore.electionId());
      // Options: showBallotItemsFilter, showOrganizationsFilter, showPublicFiguresFilter
      this.setState({
        isSearching: true,
        searchTextDefault,
      });
    }

    // Ballot Items
    const localGoogleCivicElectionId = VoterStore.electionId();
    const allBallotItemsFlattened = BallotStore.getAllBallotItemsFlattened(localGoogleCivicElectionId);
    // Voter Guides
    const voterGuidesToFollowAll = VoterGuideStore.getVoterGuidesToFollowAll();
    const voterGuidesVoterIsFollowing = VoterGuideStore.getVoterGuidesVoterIsFollowing();
    const allVoterGuidesBeforeFilter = voterGuidesToFollowAll.concat(voterGuidesVoterIsFollowing);
    const allVoterGuides = uniqBy(allVoterGuidesBeforeFilter, 'organization_we_vote_id');

    const allOpinionsAndBallotItems = allVoterGuides.concat(allBallotItemsFlattened);
    // console.log('Opinions2020, onBallotStoreChange allBallotItemsFlattened:', allBallotItemsFlattened);
    this.setState({
      allBallotItems: allBallotItemsFlattened,
      allOpinionsAndBallotItems,
      allVoterGuides,
      filteredOpinionsAndBallotItems: allOpinionsAndBallotItems,
      totalNumberOfBallotItems: allOpinionsAndBallotItems.length,
    });

    if (!BallotStore.ballotFound) {
      // console.log('WebApp doesn't know the election or have ballot data, so ask the API server to return best guess');
      BallotActions.voterBallotItemsRetrieve(0, '', '');
    }
    OrganizationActions.organizationsFollowedRetrieve();

    window.addEventListener('scroll', this.onScroll);
  }

  componentDidUpdate (prevProps, prevState) {
    // console.log('Opinions2020 componentDidUpdate');
    // Whenever a voter goes from "Add Endorsements" to "Endorsed or Opposed" we want to refresh the position list
    const { currentSelectedBallotFilters } = this.state;
    const { stateCodeToRetrieve } = this.state;
    const { currentSelectedBallotFilters: previousSelectedBallotFilters } = prevState;
    const localGoogleCivicElectionId = VoterStore.electionId();
    const { localAllBallotItemsHaveBeenRetrieved } = this.state;
    // If the ballot filters have changed, reset the numberOfBallotItemsToDisplay
    if (currentSelectedBallotFilters && previousSelectedBallotFilters) {
      if (JSON.stringify(currentSelectedBallotFilters) !== JSON.stringify(previousSelectedBallotFilters)) {
        this.setState({
          numberOfBallotItemsToDisplay: 5,
        });
      }
    }
    // console.log('componentDidUpdate stateCodeToRetrieve:', stateCodeToRetrieve);
    if (localGoogleCivicElectionId && stateCodeToRetrieve) {
      if (!localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId]) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId] = {};
      }
      if (!localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve]) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] = false;
      }
      const doNotRetrieveAllBallotItems = localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] || BallotStore.allBallotItemsHaveBeenRetrievedForElection(localGoogleCivicElectionId, stateCodeToRetrieve);
      if (!doNotRetrieveAllBallotItems) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] = true;
        this.setState({
          localAllBallotItemsHaveBeenRetrieved,
        });
        // console.log('componentDidUpdate BallotActions.allBallotItemsRetrieve:', localGoogleCivicElectionId, stateCodeToRetrieve);
        BallotActions.allBallotItemsRetrieve(localGoogleCivicElectionId, stateCodeToRetrieve);
      }
    }
  }

  // NOTE FROM DALE 2019-08-12 shouldComponentUpdate gets in the way of the filtering system
  // shouldComponentUpdate (nextProps, nextState) {
  // }

  componentWillUnmount () {
    this.ballotStoreListener.remove();
    this.organizationStoreListener.remove();
    this.voterGuideStoreListener.remove();
    this.voterStoreListener.remove();
    if (this.ballotItemTimer) {
      clearTimeout(this.ballotItemTimer);
      this.ballotItemTimer = null;
    }
    window.removeEventListener('scroll', this.onScroll);
  }

  onBallotStoreChange () {
    const { allBallotItemSearchResults, allOrganizationSearchResults, allVoterGuides, ballotItemWeVoteIdsAlreadyFoundList } = this.state;
    const localGoogleCivicElectionId = VoterStore.electionId();
    // console.log('onBallotStoreChange, localGoogleCivicElectionId:', localGoogleCivicElectionId);
    const allBallotItemsFlattened = BallotStore.getAllBallotItemsFlattened(localGoogleCivicElectionId);
    let ballotItemWeVoteIdsAlreadyFoundChanged = false;
    // console.log('Opinions2020, onBallotStoreChange allBallotItemsFlattened:', allBallotItemsFlattened);
    for (let count = 0; count < allBallotItemsFlattened.length; count++) {
      if (!arrayContains(allBallotItemsFlattened[count].we_vote_id, ballotItemWeVoteIdsAlreadyFoundList)) {
        ballotItemWeVoteIdsAlreadyFoundList.push(allBallotItemsFlattened[count].we_vote_id);
        ballotItemWeVoteIdsAlreadyFoundChanged = true;
      }
      if (allBallotItemsFlattened[count].candidate_list) {
        for (let count2 = 0; count2 < allBallotItemsFlattened[count].candidate_list.length; count2++) {
          if (!arrayContains(allBallotItemsFlattened[count].candidate_list[count2].we_vote_id, ballotItemWeVoteIdsAlreadyFoundList)) {
            ballotItemWeVoteIdsAlreadyFoundList.push(allBallotItemsFlattened[count].candidate_list[count2].we_vote_id);
            ballotItemWeVoteIdsAlreadyFoundChanged = true;
          }
        }
      }
    }

    // Anything coming back from search?
    const ballotItemSearchResultsList = BallotStore.ballotItemSearchResultsList();
    // console.log('ballotItemSearchResultsList:', ballotItemSearchResultsList);
    if (ballotItemSearchResultsList && ballotItemSearchResultsList.length) {
      // Figure out which of these organizations has already been retrieved so we are only adding new
      const newBallotItemSearchResults = ballotItemSearchResultsList.filter(ballotItem => !arrayContains(ballotItem.we_vote_id, ballotItemWeVoteIdsAlreadyFoundList));
      // console.log('newBallotItemSearchResults:', newBallotItemSearchResults);

      // Figure out the organizations we already have voterGuides for so we don't duplicate
      if (newBallotItemSearchResults.length) {
        let newBallotItem;
        const newBallotItems = [];
        for (let count = 0; count < newBallotItemSearchResults.length; count++) {
          ballotItemWeVoteIdsAlreadyFoundList.push(newBallotItemSearchResults[count].we_vote_id);
          ballotItemWeVoteIdsAlreadyFoundChanged = true;
          if (arrayContains('cand', newBallotItemSearchResults[count].we_vote_id)) {
            newBallotItem = {
              ballot_item_display_name: newBallotItemSearchResults[count].ballot_item_display_name,
              candidate_photo_url_medium: newBallotItemSearchResults[count].candidate_photo_url_medium,
              kind_of_ballot_item: 'CANDIDATE',
              twitter_description: newBallotItemSearchResults[count].twitter_description || '',
              twitter_followers_count: newBallotItemSearchResults[count].twitter_followers_count || 0,
              twitter_handle: newBallotItemSearchResults[count].twitter_handle,
              state_code: newBallotItemSearchResults[count].state_code,
              we_vote_id: newBallotItemSearchResults[count].we_vote_id,
            };
          } else if (arrayContains('meas', newBallotItemSearchResults[count].we_vote_id) || arrayContains('meas', newBallotItemSearchResults[count].measure_we_vote_id)) {
            newBallotItem = {
              ballot_item_display_name: newBallotItemSearchResults[count].ballot_item_display_name,
              google_civic_election_id: newBallotItemSearchResults[count].google_civic_election_id,
              kind_of_ballot_item: 'MEASURE',
              measure_text: newBallotItemSearchResults[count].measure_text,
              race_office_level: 'Measure',
              state_code: newBallotItemSearchResults[count].state_code,
              // twitter_followers_count: newBallotItemSearchResults[count].organization_twitter_followers_count || 0,
              // twitter_handle: newBallotItemSearchResults[count].organization_twitter_handle,
              // voter_guide_display_name: newBallotItemSearchResults[count].organization_name,
              // voter_guide_image_url_medium: newBallotItemSearchResults[count].organization_photo_url_medium,
              // voter_guide_owner_type: newBallotItemSearchResults[count].organization_owner_type || '',
              we_vote_id: newBallotItemSearchResults[count].we_vote_id || newBallotItemSearchResults[count].measure_we_vote_id,
            };
          } else {
            newBallotItem = {
              ballot_item_display_name: newBallotItemSearchResults[count].ballot_item_display_name,
              candidate_list: newBallotItemSearchResults[count].candidate_list || [],
              kind_of_ballot_item: 'OFFICE',
              race_office_level: '',
              state_code: newBallotItemSearchResults[count].state_code,
              // twitter_followers_count: newBallotItemSearchResults[count].organization_twitter_followers_count || 0,
              // twitter_handle: newBallotItemSearchResults[count].organization_twitter_handle,
              // voter_guide_display_name: newBallotItemSearchResults[count].organization_name,
              // voter_guide_image_url_medium: newBallotItemSearchResults[count].organization_photo_url_medium,
              // voter_guide_owner_type: newBallotItemSearchResults[count].organization_owner_type || '',
              we_vote_id: newBallotItemSearchResults[count].we_vote_id,
            };
          }
          newBallotItems.push(newBallotItem);
          allBallotItemSearchResults.push(newBallotItem);
        }
        this.setState({
          allBallotItemSearchResults,
        });
      }
      if (ballotItemWeVoteIdsAlreadyFoundChanged) {
        this.setState({
          ballotItemWeVoteIdsAlreadyFoundList,
        });
      }
    }
    const allOpinionsAndBallotItems = allVoterGuides.concat(allBallotItemsFlattened, allBallotItemSearchResults, allOrganizationSearchResults);  // , allBallotItemSearchResults
    this.setState({
      allBallotItems: allBallotItemsFlattened,
      allOpinionsAndBallotItems,
      filteredOpinionsAndBallotItems: allOpinionsAndBallotItems,
      totalNumberOfBallotItems: allOpinionsAndBallotItems.length,
    });
  }

  onOrganizationStoreChange () {
    const {
      linkedOrganizationWeVoteId, localAllBallotItemsHaveBeenRetrieved,
      localPositionListHasBeenRetrieved,
    } = this.state;
    let { stateCodeFromIpAddress } = this.state;
    const localGoogleCivicElectionId = VoterStore.electionId();
    // console.log('onOrganizationStoreChange, linkedOrganizationWeVoteId: ', linkedOrganizationWeVoteId);
    if (!linkedOrganizationWeVoteId) {
      const voter = VoterStore.getVoter();
      // console.log('onOrganizationStoreChange, voter: ', voter);
      if (voter && voter.we_vote_id) {
        const newLinkedOrganizationWeVoteId = voter.linked_organization_we_vote_id;
        // console.log('onOrganizationStoreChange, newLinkedOrganizationWeVoteId: ', newLinkedOrganizationWeVoteId);
        if (newLinkedOrganizationWeVoteId) {
          this.setState({
            linkedOrganizationWeVoteId: newLinkedOrganizationWeVoteId,
          });
          OrganizationActions.organizationRetrieve(newLinkedOrganizationWeVoteId);
        }
      }
      if (voter && voter.state_code_from_ip_address) {
        stateCodeFromIpAddress = voter.state_code_from_ip_address;
        if (stateCodeFromIpAddress) {
          this.setState({
            stateCodeFromIpAddress,
          });
        }
      }
    } else {
      const organization = OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId);
      // Positions for this organization, for this election
      // console.log('onOrganizationStoreChange, voterGuide: ', voterGuide, ', organization:', organization);
      if (localGoogleCivicElectionId && organization && organization.organization_we_vote_id) {
        const doNotRetrievePositionList = localPositionListHasBeenRetrieved[localGoogleCivicElectionId] || OrganizationStore.positionListForOpinionMakerHasBeenRetrievedOnce(localGoogleCivicElectionId, organization.organization_we_vote_id);
        if (!doNotRetrievePositionList) {
          // console.log('CALLING positionListForOpinionMaker');
          localPositionListHasBeenRetrieved[localGoogleCivicElectionId] = true;
          this.setState({
            localPositionListHasBeenRetrieved,
          });
          OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, false, true, localGoogleCivicElectionId);
          OrganizationActions.positionListForOpinionMaker(organization.organization_we_vote_id, true, false, localGoogleCivicElectionId);
        }
      }
    }
    // console.log('Opinions2020 onOrganizationStoreChange voterGuide:', voterGuide);
    let stateCodeToRetrieve = '';
    if (stateCodeFromIpAddress) {
      stateCodeToRetrieve = stateCodeFromIpAddress.toLowerCase();
      this.setState({
        stateCodeToRetrieve,
      });
    }
    // console.log('onOrganizationStoreChange stateCodeToRetrieve:', stateCodeToRetrieve);
    if (localGoogleCivicElectionId && stateCodeToRetrieve) {
      if (!localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId]) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId] = {};
      }
      if (!localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve]) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] = false;
      }
      const doNotRetrieveAllBallotItems = localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] || BallotStore.allBallotItemsHaveBeenRetrievedForElection(localGoogleCivicElectionId, stateCodeToRetrieve);
      if (!doNotRetrieveAllBallotItems) {
        localAllBallotItemsHaveBeenRetrieved[localGoogleCivicElectionId][stateCodeToRetrieve] = true;
        this.setState({
          localAllBallotItemsHaveBeenRetrieved,
        });
        BallotActions.allBallotItemsRetrieve(localGoogleCivicElectionId, stateCodeToRetrieve);
      }
    }
    // Anything coming back from search?
    const organizationSearchResultsList = OrganizationStore.getOrganizationSearchResultsList();
    // console.log('organizationSearchResultsList:', organizationSearchResultsList);
    const { allOrganizationSearchResults, organizationWeVoteIdsAlreadyFoundList } = this.state;
    if (organizationSearchResultsList && organizationSearchResultsList.length) {
      // Figure out which of these organizations has already been retrieved so we are only adding new
      const newOrganizationSearchResults = organizationSearchResultsList.filter(org => !arrayContains(org.organization_we_vote_id, organizationWeVoteIdsAlreadyFoundList));
      // console.log('newOrganizationSearchResults:', newOrganizationSearchResults);

      // Figure out the organizations we already have voterGuides for so we don't duplicate
      if (newOrganizationSearchResults.length) {
        let newOrganization;
        const newOrganizations = [];
        for (let count = 0; count < newOrganizationSearchResults.length; count++) {
          organizationWeVoteIdsAlreadyFoundList.push(newOrganizationSearchResults[count].organization_we_vote_id);
          newOrganization = {
            organization_we_vote_id: newOrganizationSearchResults[count].organization_we_vote_id,
            twitter_description: newOrganizationSearchResults[count].organization_twitter_description || '',
            twitter_followers_count: newOrganizationSearchResults[count].organization_twitter_followers_count || 0,
            twitter_handle: newOrganizationSearchResults[count].organization_twitter_handle,
            voter_guide_display_name: newOrganizationSearchResults[count].organization_name,
            voter_guide_image_url_medium: newOrganizationSearchResults[count].organization_photo_url_medium,
            voter_guide_owner_type: newOrganizationSearchResults[count].organization_owner_type || '',
            we_vote_id: newOrganizationSearchResults[count].organization_we_vote_id,
          };
          newOrganizations.push(newOrganization);
          allOrganizationSearchResults.push(newOrganization);
        }
        const { allBallotItems, allBallotItemSearchResults, allVoterGuides } = this.state;
        const allOpinionsAndBallotItems = allBallotItems.concat(allBallotItemSearchResults, allVoterGuides, newOrganizations);
        this.setState({
          allOpinionsAndBallotItems,
          allOrganizationSearchResults,
          organizationWeVoteIdsAlreadyFoundList,
        });
      }
    }
  }

  onVoterGuideStoreChange () {
    const { allBallotItems, allBallotItemSearchResults, allOrganizationSearchResults } = this.state;
    const voterGuidesToFollowAll = VoterGuideStore.getVoterGuidesToFollowAll();
    const voterGuidesVoterIsFollowing = VoterGuideStore.getVoterGuidesVoterIsFollowing();
    const allVoterGuidesBeforeFilter = voterGuidesToFollowAll.concat(voterGuidesVoterIsFollowing);
    // console.log('allVoterGuidesBeforeFilter:', allVoterGuidesBeforeFilter);
    const allVoterGuides = uniqBy(allVoterGuidesBeforeFilter, 'organization_we_vote_id');
    // console.log('allVoterGuides:', allVoterGuides);
    const allOpinionsAndBallotItems = allBallotItems.concat(allBallotItemSearchResults, allVoterGuides, allOrganizationSearchResults);
    this.setState({
      allOpinionsAndBallotItems,
      allVoterGuides,
    });
  }

  onVoterStoreChange () {
    // Get Voter and Voter's Organization
    const voter = VoterStore.getVoter();
    let linkedOrganizationWeVoteId;
    // console.log('onVoterStoreChange, voter:', voter);
    if (voter && voter.we_vote_id) {
      linkedOrganizationWeVoteId = voter.linked_organization_we_vote_id;
      if (linkedOrganizationWeVoteId) {
        this.setState({
          linkedOrganizationWeVoteId,
        });
        const organization = OrganizationStore.getOrganizationByWeVoteId(linkedOrganizationWeVoteId);
        if (organization && organization.organization_we_vote_id) {
          this.onOrganizationStoreChange();
        } else {
          OrganizationActions.organizationRetrieve(linkedOrganizationWeVoteId);
        }
      }
    }
    if (voter && voter.state_code_from_ip_address) {
      const stateCodeFromIpAddress = voter.state_code_from_ip_address;
      if (stateCodeFromIpAddress) {
        this.setState({
          stateCodeFromIpAddress,
        });
      }
    }
    // console.log('onVoterStoreChange, linkedOrganizationWeVoteId: ', linkedOrganizationWeVoteId);
  }

  onScroll () {
    const showMoreItemsElement =  document.querySelector('#showMoreItemsId');
    // console.log('showMoreItemsElement: ', showMoreItemsElement);
    if (showMoreItemsElement) {
      const {
        numberOfBallotItemsToDisplay, totalNumberOfBallotItems,
      } = this.state;

      // console.log('window.height: ', window.innerHeight);
      // console.log('Window Scroll: ', window.scrollY);
      // console.log('Bottom: ', showMoreItemsElement.getBoundingClientRect().bottom);
      // console.log('numberOfBallotItemsToDisplay: ', numberOfBallotItemsToDisplay);
      // console.log('totalNumberOfBallotItems: ', totalNumberOfBallotItems);
      if (numberOfBallotItemsToDisplay < totalNumberOfBallotItems) {
        if (showMoreItemsElement.getBoundingClientRect().bottom <= window.innerHeight) {
          this.increaseNumberOfBallotItemsToDisplay();
        }
      }
    }
  }

  onFilteredItemsChangeFromBallotItemsFilterBase = (filteredOpinionsAndBallotItems, currentSelectedBallotFilters) => {
    // console.log('onFilteredItemsChangeFromBallotItemsFilterBase, currentSelectedBallotFilters: ', currentSelectedBallotFilters);
    this.setState({
      currentSelectedBallotFilters,
      filteredOpinionsAndBallotItems,
    });
  }

  onSearchLocal = (searchText, filteredItems) => {
    window.scrollTo(0, 0);
    this.setState({
      ballotSearchResults: filteredItems,
      searchText,
    });
  };

  handleToggleSearch = (isSearching) => {
    // console.log('Opinions2020 handleToggleSearch PRIOR isSearching:', isSearching, ', clear searchTextDefault');
    // const { ballotWithItemsFromCompletionFilterType } = this.state;
    // let totalNumberOfBallotItems;
    this.setState({
      isSearching: !isSearching,
    });
    // If prior isSearching was true, clear the searchTextDefault
    if (isSearching) {
      this.setState({
        searchTextDefault: '',
      });
    }
  };

  increaseNumberOfBallotItemsToDisplay = () => {
    let { numberOfBallotItemsToDisplay } = this.state;
    // console.log('Number of ballot items before increment: ', numberOfBallotItemsToDisplay);

    numberOfBallotItemsToDisplay += 5;
    // console.log('Number of ballot items after increment: ', numberOfBallotItemsToDisplay);

    clearTimeout(this.ballotItemTimer);
    this.ballotItemTimer = setTimeout(() => {
      this.setState({
        numberOfBallotItemsToDisplay,
      });
    }, 500);
  }

  componentDidCatch (error, info) {
    // We should get this information to Splunk!
    console.error('Opinions2020 caught error: ', `${error} with info: `, info);
  }

  render () {
    renderLog('Opinions2020');  // Set LOG_RENDER_EVENTS to log all renders
    const { classes } = this.props;
    const localGoogleCivicElectionId = VoterStore.electionId();
    const {
      allOpinionsAndBallotItems, ballotSearchResults,
      filteredOpinionsAndBallotItems, isSearching,
      numberOfBallotItemsToDisplay,
      searchText, searchTextDefault, selectedFiltersAddDefault,
      stateCodeToRetrieve,
    } = this.state;
    if (!allOpinionsAndBallotItems) {
      return LoadingWheel;
    }
    // console.log('Opinions2020 render, isSearching:', isSearching, ', searchText:', searchText, ', searchTextDefault:', searchTextDefault);
    const atLeastOneFoundWithTheseFilters = (filteredOpinionsAndBallotItems && filteredOpinionsAndBallotItems.length);
    let numberOfBallotItemsDisplayed = 0;
    let totalNumberOfBallotItems = 0;
    if (atLeastOneFoundWithTheseFilters) {
      totalNumberOfBallotItems = filteredOpinionsAndBallotItems.length;
    }
    let totalNumberOfBallotSearchResults = 0;
    if (ballotSearchResults && ballotSearchResults.length) {
      totalNumberOfBallotSearchResults = ballotSearchResults.length;
    }
    let searchTextString = '';
    // const { classes } = this.props;
    // console.log('filteredOpinionsAndBallotItems: ', filteredOpinionsAndBallotItems);
    // console.log('atLeastOneFoundWithTheseFilters: ', atLeastOneFoundWithTheseFilters);
    return (
      <div className="container">
        <Card className="card">
          <div className="card-main">
            <FilterBaseWrapper>
              <FilterBase
                key="addPositionsFilterBase"
                groupedFilters={groupedFilters}
                islandFilters={islandFilters}
                allItems={allOpinionsAndBallotItems}
                numberOfItemsFoundNode={(
                  <NumberOfItemsFound
                    numberOfItemsTotal={isSearching ? totalNumberOfBallotSearchResults : totalNumberOfBallotItems}
                  />
                )}
                onSearch={this.onSearchLocal}
                onFilteredItemsChange={this.onFilteredItemsChangeFromBallotItemsFilterBase}
                opinionsAndBallotItemsSearchMode
                onToggleSearch={this.handleToggleSearch}
                searchOnOwnLine
                searchTextDefault={searchTextDefault}
                searchTextLarge
                selectedFiltersDefault={selectedFiltersAddDefault}
                totalNumberOfItemsFound={isSearching ? totalNumberOfBallotSearchResults : totalNumberOfBallotItems}
                voterGuidePositionSearchMode
              >
                {/* props get added to this component in FilterBase */}
                <OpinionsAndBallotItemsFilter
                  filtersPassedInOnce={stateCodeToRetrieve ? [stateCodeToRetrieve.toUpperCase()] : []}
                  googleCivicElectionId={localGoogleCivicElectionId}
                />
              </FilterBase>
            </FilterBaseWrapper>
            {/* {(isSearching && searchText) && ( */}
            {/*  <SearchTitle> */}
            {/*    Searching for &quot; */}
            {/*    {searchText} */}
            {/*    &quot; */}
            {/*  </SearchTitle> */}
            {/* )} */}
          </div>
        </Card>
        {((!isSearching && atLeastOneFoundWithTheseFilters && filteredOpinionsAndBallotItems && filteredOpinionsAndBallotItems.length) || (isSearching && ballotSearchResults && ballotSearchResults.length)) ? (
          <div>
            <CardChildListGroup className="card-child__list-group">
              {(isSearching ? ballotSearchResults : filteredOpinionsAndBallotItems).map((oneBallotItemOrOrganization) => {
                // console.log('oneBallotItemOrOrganization: ', oneBallotItemOrOrganization);
                if (!oneBallotItemOrOrganization.we_vote_id) {
                  // console.log('MISSING we_vote_id');
                  return null;
                }
                // console.log('numberOfBallotItemsDisplayed:', numberOfBallotItemsDisplayed, ", numberOfBallotItemsToDisplay:", numberOfBallotItemsToDisplay);
                if (numberOfBallotItemsDisplayed >= numberOfBallotItemsToDisplay) {
                  return null;
                }
                numberOfBallotItemsDisplayed += 1;
                // console.log('AFTER return nulls, searchText: ', searchText);
                let foundInItemsAlreadyShown = 0;
                let searchWordAlreadyShown = 0;
                if (searchText) {
                  const wordsArray = searchText.split(' ');
                  searchTextString = wordsArray.map((oneItem) => {
                    const foundInStringItem = `${searchWordAlreadyShown ? ' or ' : ''}"${oneItem}"`;
                    searchWordAlreadyShown += 1;
                    return foundInStringItem;
                  });
                }
                const isCandidate = stringContains('cand', oneBallotItemOrOrganization.we_vote_id);
                const isMeasure = stringContains('meas', oneBallotItemOrOrganization.we_vote_id);
                const isOffice = stringContains('off', oneBallotItemOrOrganization.we_vote_id);
                const isOrganizationFromSearch = stringContains('org', oneBallotItemOrOrganization.we_vote_id);
                let isVoterGuide = false;
                if (isOffice || isMeasure) {
                  // console.log('BALLOT_ITEM-oneBallotItemOrOrganization', oneBallotItemOrOrganization);
                } else if (isCandidate) {
                  // console.log('CANDIDATE-oneBallotItemOrOrganization', oneBallotItemOrOrganization);
                } else if (isOrganizationFromSearch) {
                  // console.log('ORG-oneBallotItemOrOrganization', oneBallotItemOrOrganization);
                } else {
                  // console.log('VOTER_GUIDE-oneBallotItemOrOrganization', oneBallotItemOrOrganization);
                  isVoterGuide = true;
                }
                return (
                  <div key={`addNewPositionKey-${oneBallotItemOrOrganization.we_vote_id}`}>
                    {!!(isSearching && searchTextString && oneBallotItemOrOrganization.foundInArray && oneBallotItemOrOrganization.foundInArray.length) && (
                      <SearchResultsFoundInExplanation>
                        {searchTextString}
                        {' '}
                        found in
                        {' '}
                        {oneBallotItemOrOrganization.foundInArray.map((oneItem) => {
                          const foundInStringItem = (
                            <span key={foundInItemsAlreadyShown}>
                              {foundInItemsAlreadyShown ? ', ' : ''}
                              {oneItem}
                            </span>
                          );
                          foundInItemsAlreadyShown += 1;
                          return foundInStringItem;
                        })
                        }
                      </SearchResultsFoundInExplanation>
                    )}
                    {(isCandidate) && (
                      <>
                        <CandidateSearchItemForOpinions
                          candidateWeVoteId={oneBallotItemOrOrganization.we_vote_id}
                          contestOfficeName={oneBallotItemOrOrganization.contest_office_name}
                          contestOfficeWeVoteId={oneBallotItemOrOrganization.contest_office_we_vote_id}
                          oneCandidate={oneBallotItemOrOrganization}
                          numberOfCandidatesInList={1}
                        />
                      </>
                    )}
                    {(isOffice || isMeasure) && (
                      <>
                        <BallotItemForOpinions
                          externalUniqueId={`addNewPositionKey-${oneBallotItemOrOrganization.we_vote_id}`}
                          allBallotItemsCount={2}
                          ballotItemDisplayName={oneBallotItemOrOrganization.ballot_item_display_name}
                          candidateList={oneBallotItemOrOrganization.candidate_list}
                          candidatesToShowForSearchResults={oneBallotItemOrOrganization.candidatesToShowForSearchResults}
                          kindOfBallotItem={oneBallotItemOrOrganization.kind_of_ballot_item}
                          ballotItemWeVoteId={oneBallotItemOrOrganization.we_vote_id}
                        />
                      </>
                    )}
                    {isVoterGuide && (
                      // <>&nbsp;</>
                      <VoterGuideDisplayForListForOpinions
                        organizationWeVoteId={oneBallotItemOrOrganization.organization_we_vote_id}
                        twitterDescription={oneBallotItemOrOrganization.twitter_description}
                        twitterFollowersCount={oneBallotItemOrOrganization.twitter_followers_count}
                        twitterHandle={oneBallotItemOrOrganization.twitter_handle}
                        voterGuideDisplayName={oneBallotItemOrOrganization.voter_guide_display_name}
                        voterGuideImageUrlMedium={oneBallotItemOrOrganization.voter_guide_image_url_medium}
                        voterGuideOwnerType={oneBallotItemOrOrganization.voter_guide_owner_type}
                      />
                    )}
                    {isOrganizationFromSearch && (
                      // <>&nbsp;</>
                      <VoterGuideDisplayForListForOpinions
                        organizationWeVoteId={oneBallotItemOrOrganization.organization_we_vote_id}
                        twitterDescription={oneBallotItemOrOrganization.twitter_description}
                        twitterFollowersCount={oneBallotItemOrOrganization.twitter_followers_count}
                        twitterHandle={oneBallotItemOrOrganization.twitter_handle}
                        voterGuideDisplayName={oneBallotItemOrOrganization.voter_guide_display_name}
                        voterGuideImageUrlMedium={oneBallotItemOrOrganization.voter_guide_image_url_medium}
                        voterGuideOwnerType={oneBallotItemOrOrganization.voter_guide_owner_type}
                      />
                    )}
                  </div>
                );
              })
              }
            </CardChildListGroup>
            <ShowMoreItemsWrapper id="showMoreItemsId" onClick={this.increaseNumberOfBallotItemsToDisplay}>
              <ShowMoreItems
                numberOfItemsDisplayed={numberOfBallotItemsDisplayed}
                numberOfItemsTotal={isSearching ? totalNumberOfBallotSearchResults : totalNumberOfBallotItems}
              />
            </ShowMoreItemsWrapper>
          </div>
        ) : (
          <Card>
            <EmptyBallotMessageContainer>
              <BallotIcon classes={{ root: classes.ballotIconRoot }} />
              <EmptyBallotText>
                No results found.
                {' '}
                {isSearching ? (
                  <span>
                    Please enter new search terms to find results.
                  </span>
                ) : (
                  <span>
                    Try selecting different filters to see results.
                  </span>
                )}
              </EmptyBallotText>
            </EmptyBallotMessageContainer>
          </Card>
        )
        }
        <span className="d-print-none">
          <br />
          <Link to="/opinions_followed" className="u-no-break">See organizations you follow</Link>
          <br />
          <br />
          <Link to="/opinions_ignored" className="u-no-break">Organizations you are ignoring</Link>
        </span>
      </div>
    );
  }
}

const styles = theme => ({
  ballotIconRoot: {
    width: 150,
    height: 150,
    color: 'rgb(171, 177, 191)',
  },
  ballotButtonIconRoot: {
    marginRight: 8,
  },
  ballotButtonRoot: {
    width: 250,
    [theme.breakpoints.down('md')]: {
      width: '100%',
    },
  },
  previewButton: {
    height: 27,
    marginBottom: 3,
    padding: '2px 16px',
  },
});

const CardChildListGroup = styled.ul`
  padding: 0;
`;

const EmptyBallotMessageContainer = styled.div`
  padding: 1em 2em;
  display: flex;
  flex-flow: column;
  align-items: center;
`;

const EmptyBallotText = styled.p`
  font-size: 16px;
  text-align: center;
  margin: 1em 2em;
  @media (max-width: ${({ theme }) => theme.breakpoints.md}) {
    margin: 1em;
  }
`;

const FilterBaseWrapper = styled.div`
  margin-top: -12px;
`;

const SearchResultsFoundInExplanation = styled.div`
  background-color: #C2DCE8;
  color: #0E759F;
  padding: 12px !important;
  @media (max-width: ${({ theme }) => theme.breakpoints.sm}) {
    margin-left: -15px !important;
    margin-right: -15px !important;
  }
`;

const ShowMoreItemsWrapper = styled.div`
`;

export default withStyles(styles)(Opinions2020);
