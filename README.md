# meatspace-jamon

Threaded chats with LevelDB.

## Installation

    > npm install

## Usage

    var jamon = new Jamon('you@email.com');

### Follow a user

    jamon.follow('friend@email.com', function (err, u) {
      if (!err) {
        console.log(u);
      }
    });

### Unfollow a user

    jamon.unfollow('friend@email.com', function (err, u) {
      if (!err) {
        console.log(u);
      }
    });

### Get all followed users

    jamon.getFollowing(function (err, f) {
      if (!err) {
        console.log(f);
      }
    });

### Verify follower exists

    jamon.isFollowing('friend@email.com', function (err, u) {
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
      jamon.addChat(user, 'hola!', chat, function (err, c) {
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

    jamon.addChat(user, 'hola!', chat, function (err, c) {
      if (!err) {
        jamon.getThread(<senderKey>, <since>, <reverse>, function (err, t) {
          should.exist(t);
          done();
        });
      }
    });

`senderKey` is the key of the original message.

`since` is the key from where you want to start getting messages

`reverse` is an optional boolean to reverse the chat history from latest -> earliest. Defaults at earliest -> latest.

### Get all chats

    jamon.getChats('you@email.com', <key>, <reverse>, function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

`key` is an optional point in which you want to start a chat stream from - set to false if you want it to default to the beginning.

`reverse` is an optional boolean to reverse the chat history from latest -> earliest. Defaults at earliest -> latest.

## Block a user

    jamon.blockUser('user@email.com', function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

## Unblock a user

    jamon.unblockUser('user@email.com', function (err, c) {
      if (!err) {
        console.log(c);
      }
    });

## Get a list of blocked users

    jamon.getBlockedUsers(function (err, c) {
      if (!err) {
        console.log(c);
      }
    });


## Tests

    > make test
