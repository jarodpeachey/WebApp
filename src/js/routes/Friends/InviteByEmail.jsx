import React, { Component } from 'react';
import Helmet from 'react-helmet';
import { Link } from 'react-router';
import { styled } from 'linaria/react';
import AddFriendsByEmail from '../../components/Friends/AddFriendsByEmail';
import AnalyticsActions from '../../actions/AnalyticsActions';
import CurrentFriends from '../../components/Connect/CurrentFriends';
import FriendActions from '../../actions/FriendActions';
import FriendStore from '../../stores/FriendStore';
import { renderLog } from '../../utils/logging';
import VoterStore from '../../stores/VoterStore';

export default class InviteByEmail extends Component {
  static propTypes = {
  };

  constructor (props) {
    super(props);
    this.state = {
      currentFriendsList: FriendStore.currentFriends(),
      maximumFriendDisplay: 25,
    };
  }

  componentDidMount () {
    if (this.state.currentFriendsList) {
      FriendActions.currentFriends();
    }
    this.friendStoreListener = FriendStore.addListener(this.onFriendStoreChange.bind(this));
    AnalyticsActions.saveActionInviteByEmail(VoterStore.electionId());
  }

  componentWillUnmount () {
    this.friendStoreListener.remove();
  }

  onFriendStoreChange () {
    this.setState({
      currentFriendsList: FriendStore.currentFriends(),
    });
  }

  render () {
    renderLog('InviteByEmail');  // Set LOG_RENDER_EVENTS to log all renders
    const { currentFriendsList } = this.state;
    let currentFriendListLength = 0;
    if (currentFriendsList) {
      currentFriendListLength = currentFriendsList.length;
    }
    // console.log('currentFriendListLength:', currentFriendListLength);
    return (
      <div>
        <Helmet title="Build Your We Vote Network" />
        <SectionTitle>Invite Friends by Email</SectionTitle>
        <section className="card">
          <div className="card-main">
            <AddFriendsByEmail />
          </div>
        </section>
        <br />
        {currentFriendListLength !== 0 && (
          <>
            <Link className="u-cursor--pointer u-no-underline" to="/friends/current">
              <SectionTitle>Your Current Friends</SectionTitle>
            </Link>
            <section className="card">
              <div className="card-main">
                <CurrentFriends
                  currentFriendsList={this.state.currentFriendsList}
                  maximumFriendDisplay={this.state.maximumFriendDisplay}
                />
                <FriendsLink>
                  <Link to="/friends/current">See Full Friend List</Link>
                </FriendsLink>
              </div>
            </section>
          </>
        )}
      </div>
    );
  }
}

const SectionTitle = styled.h2`
  width: fit-content;  font-weight: bold;
  font-size: 18px;
  margin-bottom: 16px;
`;

const FriendsLink = styled.div`
  width: 100%;
  margin-top: 12px;
`;
