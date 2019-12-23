import React, { Component } from 'react';
import { Link } from 'react-router';
import { styled } from 'linaria/react';
import _ from 'lodash';
import FriendListCompressed from './FriendListCompressed';
import FriendActions from '../../actions/FriendActions';
import FriendStore from '../../stores/FriendStore';
import { renderLog } from '../../utils/logging';

export default class NetworkFriends extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      currentFriendList: [],
      searchFilter: false,
      currentFriendListFilteredBySearch: [],
    };
  }

  componentDidMount () {
    if (!this.state.currentFriendList) {
      FriendActions.currentFriends();
    }
    this.setState({
      currentFriendList: FriendStore.currentFriends(),
    });
    this.friendStoreListener = FriendStore.addListener(this.onFriendStoreChange.bind(this));
  }

  componentWillUnmount () {
    this.friendStoreListener.remove();
  }

  onFriendStoreChange () {
    this.setState({
      currentFriendList: FriendStore.currentFriends(),
    });
  }

  getCurrentRoute () {
    const currentRoute = '/friends';
    return currentRoute;
  }

  getFollowingType () {
    switch (this.getCurrentRoute()) {
      case '/friends':
      default:
        return 'YOUR_FRIENDS';
    }
  }

  searchFriends (event) {
    const searchTerm = event.target.value;
    if (searchTerm.length === 0) {
      this.setState({
        searchFilter: false,
        currentFriendListFilteredBySearch: [],
      });
    } else {
      const { currentFriendList } = this.state;
      const searchTermLowerCase = searchTerm.toLowerCase();
      const searchedFriendList = _.filter(currentFriendList,
        user => user.voter_display_name.toLowerCase().includes(searchTermLowerCase));

      this.setState({
        searchFilter: true,
        currentFriendListFilteredBySearch: searchedFriendList,
      });
    }
  }

  toggleEditMode () {
    const { editMode } = this.state;
    this.setState({ editMode: !editMode });
  }

  render () {
    renderLog('NetworkFriends');  // Set LOG_RENDER_EVENTS to log all renders
    let currentFriendList = [];
    if (!this.state.searchFilter) {
      const currentFriendListComplete = this.state.currentFriendList;
      const FRIENDS_TO_SHOW = 3;
      currentFriendList = currentFriendListComplete.slice(0, FRIENDS_TO_SHOW);
    } else {
      currentFriendList = this.state.currentFriendListFilteredBySearch;
    }

    return (
      <div className="opinion-view">
        <section className="card">
          <div className="card-main">
            <SectionTitle>Your Friends</SectionTitle>
            <div>
              { this.state.currentFriendList && this.state.currentFriendList.length > 0 ? (
                <span>
                  <div className="card">
                    <FriendListCompressed
                      friendList={currentFriendList}
                      editMode={this.state.editMode}
                    />
                  </div>
                  <Link to="/friends">See All</Link>
                </span>
              ) :
                <p>You have not added any friends yet.</p>
              }
            </div>
          </div>
        </section>
      </div>
    );
  }
}

const SectionTitle = styled.h2`
  width: fit-content;  font-weight: bolder;
  font-size: 20px;
  margin-bottom: 16px;
`;
