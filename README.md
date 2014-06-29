# Level Threaded Chat

Threaded chats with LevelDB.

## Installation

    > npm install

## Usage

    var c = new LevelThreadedChat('you@email.com');

where 'you@gmail.com' can be any user identifier.

### Follow a user

    c.follow('friend@email.com', function (err, u) {
      if (!err) {
        console.log(u);
      }
    });

### Unfollow a user

    c.unfollow('friend@email.com', function (err, u) {
      if (!err) {
        console.log(u);
      }
    });

### Get all followed users

    c.getFollowing(function (err, f) {
      if (!err) {
        console.log(f);
      }
    });

### Verify follower exists

    c.isFollowing('friend@email.com', function (err, u) {
      if (!err) {
        console.log(u);
      }
    });

### Add a chat message

    var chat = {
      media: 'data:image/gif;base64',
      recipients: ['user1', 'user2']
    };

    chat.recipients.forEach(function (user) {
      c.addChat(user, 'hola!', chat, function (err, c) {
        if (!err) {
          console.log(c);
        }
      });
    });

### Add a chat message to a thread

    var chat = {
      media: 'data:image/gif;base64',
      recipients: ['user1', 'user2'],
      reply: <senderKey>
    };

    c.addChat(user, 'hola!', chat, function (err, c) {
      if (!err) {
        c.getThread(<senderKey>, <since>, <reverse>, function (err, t) {
          should.exist(t);
          done();
        });
      }
    });

`senderKey` is the key of the original message.

`since` is the key from where you want to start getting messages

`reverse` is an optional boolean to reverse the chat history from latest -> earliest. Defaults at earliest -> latest.

### Get all chats

    c.getChats('you@email.com', <key>, <reverse>, function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

`key` is an optional point in which you want to start a chat stream from - set to false if you want it to default to the beginning.

`reverse` is an optional boolean to reverse the chat history from latest -> earliest. Defaults at earliest -> latest.

## Block a user

    c.blockUser('user@email.com', function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

## Unblock a user

    c.unblockUser('user@email.com', function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

## Get a list of blocked users

    c.getBlockedUsers(function (err, c) {
      if (!err) {
        console.log(c);
      }
    });


## Tests

    > npm test
