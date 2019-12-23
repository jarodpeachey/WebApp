import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { styled } from 'linaria/react';
import _ from 'lodash';
import SuggestedFriendList from '../../components/Friends/SuggestedFriendList';
import FriendActions from '../../actions/FriendActions';
import FriendStore from '../../stores/FriendStore';
import { renderLog } from '../../utils/logging';
import SearchBar from '../../components/Search/SearchBar';
import MessageCard from '../../components/Widgets/MessageCard';

export default class SuggestedFriends extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      suggestedFriendList: [],
      suggestedFriendListFilteredBySearch: [],
      searchFilterOn: false,
      searchTerm: '',
    };
    this.clearSearch = this.clearSearch.bind(this);
    this.searchFriends = this.searchFriends.bind(this);
  }

  componentDidMount () {
    FriendActions.suggestedFriendList();
    this.setState({
      suggestedFriendList: FriendStore.suggestedFriendList(),
    });

    this.friendStoreListener = FriendStore.addListener(this.onFriendStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.friendStoreListener.remove();
  }

  onFriendStoreChange () {
    this.setState({
      suggestedFriendList: FriendStore.suggestedFriendList(),
    });
  }

  searchFriends (searchTerm) {
    if (searchTerm.length === 0) {
      this.setState({
        suggestedFriendListFilteredBySearch: [],
        searchFilterOn: false,
        searchTerm: '',
      });
    } else {
      const searchTermLowercase = searchTerm.toLowerCase();
      const { suggestedFriendList } = this.state;
      const searchedFriendList = _.filter(suggestedFriendList,
        voter => voter.voter_display_name.toLowerCase().includes(searchTermLowercase));

      this.setState({
        suggestedFriendListFilteredBySearch: searchedFriendList,
        searchFilterOn: true,
        searchTerm,
      });
    }
  }

  clearSearch () {
    this.setState({
      searchFilterOn: false,
      searchTerm: '',
      suggestedFriendListFilteredBySearch: [],
    });
  }

  render () {
    renderLog('SuggestedFriend');  // Set LOG_RENDER_EVENTS to log all renders
    let { suggestedFriendList } = this.state;
    if (this.state.searchFilterOn) {
      suggestedFriendList = this.state.suggestedFriendListFilteredBySearch;
    }

    return (
      <div className="opinion-view">
        <Helmet title="People You May Know - We Vote" />
        <SectionTitle>
          People You May Know
          { suggestedFriendList && suggestedFriendList.length > 0 && (
            <>
              {' '}
              (
              {suggestedFriendList.length}
              )
            </>
          )}
        </SectionTitle>
        <div>
          { suggestedFriendList && suggestedFriendList.length > 0 ? (
            <span>
              <SearchBar
                clearButton
                searchButton
                placeholder="Search by name"
                searchFunction={this.searchFriends}
                clearFunction={this.clearSearch}
                searchUpdateDelayTime={0}
              />
              <br />
              { this.state.searchFilterOn && suggestedFriendList.length === 0 ? (
                <p>
                  &quot;
                  {this.state.searchTerm}
                  &quot; not found
                </p>
              ) : null
              }
              <SuggestedFriendList
                friendList={suggestedFriendList}
                editMode
              />
            </span>
          ) : (
            <MessageCard
              mainText="You currently have no suggested friends. Send some invites to connect with your friends!"
              buttonText="Invite Friends"
              buttonURL="/friends/invite"
            />
          )
          }
        </div>
      </div>
    );
  }
}

const SectionTitle = styled.h2`
  width: fit-content;  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
`;
