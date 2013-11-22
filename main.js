'use strict';

var level = require('level');
var Sublevel = require('level-sublevel');
var concat = require('concat-stream');

var Jamon = function (user, options) {
  var setTime = function () {
    return Date.now();
  };

  if (!options) {
    options = {};
  }

  this.user = user;
  this.dbPath = options.db || './db';
  this.limit = options.limit || 10;
  this.db = Sublevel(level(this.dbPath, {
    createIfMissing: true,
    valueEncoding: 'json'
  }));
  this.messagesLevel = this.db.sublevel(this.user + '!messages');
  this.followList = this.db.sublevel(this.user + '!followlist');
  this.blockList = this.db.sublevel(this.user + '!blocklist');
  this.threadLevel;

  var self = this;

  this.follow = function (user, callback) {
    if (user.toString().trim().length < 1) {
      callback(new Error('Invalid user id'));
    } else {
      this.blockList.get(user, function (err, u) {
        if (!u) {
          self.followList.put(user, true, function (err) {
            if (err) {
              callback(err);
            } else {
              callback(null, user);
            }
          });
        } else {
          callback(new Error('cannot follow this user'));
        }
      });
    }
  };

  this.unfollow = function (user, callback) {
    if (user.toString().trim().length < 1) {
      callback(new Error('Invalid user id'));
    } else {
      this.followList.del(user, function (err) {
        if (err) {
          callback(err);
        } else {
          callback(null, 'Unfollowed user');
        }
      });
    }
  };

  this.blockUser = function (user, callback) {
    if (user.toString().trim().length < 1) {
      callback(new Error('Invalid user id'));
    } else {

      this.unfollow(user, function (err, data) {
        if (err) {
          callback(err);
        } else {
          self.blockList.put(user, true, function (err) {
            if (err) {
              callback(new Error('Could not block user'));
            } else {
              callback(null, true);
            }
          });
        }
      });
    }
  };

  this.unblockUser = function (user, callback) {
    if (user.toString().trim().length < 1) {
      callback(new Error('Invalid user id'));
    } else {

      this.blockList.del(user, function (err) {
        if (err) {
          callback(new Error('Could not unblock user'));
        } else {
          callback(null, true);
        }
      });
    }
  };

  this.getBlockedUsers = function (callback) {
    var rs = this.blockList.createReadStream();

    rs.pipe(concat(function (blocked) {
      callback(null, {
        blocked: blocked || []
      });
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };

  this.getFollowing = function (callback) {
    var rs = this.followList.createReadStream();

    rs.pipe(concat(function (follows) {
      callback(null, {
        followed: follows || []
      });
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };

  this.isFollowing = function (user, callback) {
    this.followList.get(user, function (err, followed) {
      if (err) {
        callback(err);
      } else if (!followed) {
        callback(new Error('follower not found'));
      } else {
        callback(null, followed);
      }
    });
  };

  // Gets the most recent chats in your stream
  this.getChats = function (key, reverse, callback) {
    var rs = this.messagesLevel.createReadStream({
      start: key,
      limit: self.limit,
      reverse: reverse
    });

    rs.pipe(concat(function (chats) {
      callback(null, {
        chats: chats || []
      });
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };

  // Get the most recent chats in a thread
  this.getThread = function (key, since, reverse, callback) {
    this.threadLevel = this.db.sublevel(key + '!thread');

    var rs = this.threadLevel.createReadStream({
      start: since,
      limit: self.limit,
      reverse: reverse
    });

    rs.pipe(concat(function (chats) {
      callback(null, {
        chats: chats || []
      });
    }));

    rs.on('error', function (err) {
      callback(err);
    });
  };

  this.getChat = function (key, callback) {
    this.messagesLevel.get(key, function (err, c) {
      if (err) {
        callback(err);
      } else {
        callback(null, {
          chat: c
        });
      }
    });
  };

  this.addChat = function (user, chat, options, callback) {
    if (!options || !options.media || !options.recipients) {
      callback(new Error('requires an image and at least 1 recipient'));
      return;
    }

    var image = options.media.toString().trim();

    if (!image.match(/^((data:image\/gif;base64)|(data:image\/png;base64))/i)) {
      callback(new Error('must be a gif or png'));
      return;
    }

    this.blockList.get(user, function (err, u) {
      if (!u) {
        var senderKey = options.senderKey || setTime() + '!' + user;
        var created = options.created || setTime();
        var newChat = {
          message: chat,
          media: options.media,
          senderKey: senderKey,
          created: created,
          recipients: options.recipients,
          reply: options.reply || false
        };

        if (newChat.reply) {
          // reply to a thread
          self.threadLevel = self.db.sublevel(newChat.reply + '!thread');

        } else {
          // new thread
          self.threadLevel = self.db.sublevel(senderKey + '!thread');
        }

        self.messagesLevel.put(senderKey, newChat, function (err) {
          if (err) {
            callback(err);
          } else {
            self.threadLevel.put(senderKey, newChat, function (err) {
              if (err) {
                callback(err);
              } else {
                callback(null, newChat);
              }
            });
          }
        });
      } else {
        callback(new Error('cannot send message to this user'));
      }
    });
  };
};

module.exports = Jamon;
