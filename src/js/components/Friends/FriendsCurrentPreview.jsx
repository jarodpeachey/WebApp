import React, { Component } from 'react';
import { Link } from 'react-router';
import { styled } from 'linaria/react';
import FriendList from './FriendList';
import FriendActions from '../../actions/FriendActions';
import FriendStore from '../../stores/FriendStore';
import { renderLog } from '../../utils/logging';

export default class FriendsCurrentPreview extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      currentFriendList: [],
    };
  }

  componentDidMount () {
    FriendActions.currentFriends();
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

  render () {
    renderLog('FriendsCurrentPreview');  // Set LOG_RENDER_EVENTS to log all renders
    const { currentFriendList } = this.state;
    if (!currentFriendList || !(currentFriendList.length > 0)) {
      return null;
    }

    const FRIENDS_TO_SHOW = 3;
    const currentFriendListLimited = currentFriendList.slice(0, FRIENDS_TO_SHOW);

    return ((currentFriendListLimited && currentFriendListLimited.length > 0) && (
      <div className="opinion-view">
        <section className="card">
          <div className="card-main">
            <SectionTitle>
              Your Friends
              {' '}
              (
              {currentFriendList.length}
              )
            </SectionTitle>
            <div>
              <FriendList
                editMode
                friendList={currentFriendListLimited}
                previewMode
              />
              {currentFriendList.length > FRIENDS_TO_SHOW && <Link to="/friends/current">See All</Link>}
            </div>
          </div>
        </section>
      </div>
    ));
  }
}

const SectionTitle = styled.h2`
  width: fit-content;  font-weight: bolder;
  font-size: 18px;
  margin-bottom: 16px;
`;
