'use strict';

process.env.NODE_ENV = 'test';

var should = require('should');
var child = require('child_process');
var Jamon = require('../main');

var chatKey;

var p = new Jamon('sender@email.com', {
  db: './test/db',
  frequency: 1
});

describe('jamon', function () {
  after(function () {
    child.exec('rm -rf ./test/db');
  });

  describe('.follow',  function () {
    it('should not follow', function (done) {
      p.follow(' ', function (err, u) {
        should.exist(err);
        err.toString().should.equal('Error: Invalid user id');
        done();
      });
    });

    it('should follow', function (done) {
      p.follow('receiver@email.com', function (err, u) {
        should.exist(u);
        u.should.equal('receiver@email.com');
        done();
      });
    });
  });

  describe('.addChat', function () {
    it('should not add a new chat to recipients', function (done) {
      var recipients = ['receiver@email.com'];

      p.addChat('receiver@email.com', 'test message', {
        media: 'http://someimage.jpg',
        recipients: recipients
      }, function (err, c) {
        should.exist(err);
        err.toString().should.equal('Error: must be a gif or png');
        done();
      });
    });

    it('should add a new chat to recipients', function (done) {
      var recipients = ['receiver@email.com'];

      p.addChat('receiver@email.com', 'test message', {
        media: 'data:image/gif;base64',
        recipients: recipients
      }, function (err, c) {
        should.exist(c);
        chatKey = c.senderKey;
        c.message.should.eql('test message');
        c.recipients.should.eql(recipients);
        done();
      });
    });
  });

  describe('.getFollowing', function () {
    it('should get following', function (done) {
      p.getFollowing(function (err, f) {
        f.followed.length.should.equal(1);
        done();
      });
    });
  });

  describe('.isFollowing', function () {
    it('should verify that user is being followed', function (done) {
      p.isFollowing('receiver@email.com', function (err, u) {
        should.exist(u);
        done();
      });
    });

    it('should verify that user is not being followed', function (done) {
      p.isFollowing('receiver2@email.com', function (err, u) {
        should.not.exist(u);
        done();
      });
    });
  });

  describe('.getChats', function () {
    it('should get chats', function (done) {
      p.getChats(false, false, function (err, c) {
        should.exist(c);
        c.chats.length.should.equal(1);
        done();
      });
    });

    it('should get chats in reverse', function (done) {
      p.getChats(false, true, function (err, c) {
        c.chats.length.should.equal(1);
        done();
      });
    });
  });

  describe('.getThread', function () {
    it('should return a threaded chat', function (done) {
      var recipients = ['receiver3@email.com'];

      p.addChat('receiver3@email.com', 'test message', {
        media: 'data:image/gif;base64',
        recipients: recipients,
        reply: chatKey
      }, function (err, c) {
        should.exist(c);
        p.getThread(c.reply, false, false, function (err, t) {
          should.exist(t);
          done();
        });
      });
    });
  });

  describe('.blockUser', function () {
    it('should error on blocking a user', function (done) {
      p.blockUser('', function (err, s) {
        should.exist(err);
        done();
      });
    });

    it('should block a user', function (done) {
      p.blockUser('receiver2@email.com', function (err, s) {
        should.exist(s);
        done();
      });
    });

    it('should not send a message to a blocked user', function (done) {
      p.addChat('receiver2@email.com', 'test message', {
        media: 'data:image/gif;base64',
        recipients: ['receiver2@email.com']
      }, function (err, c) {
        should.exist(err);
        should.not.exist(c);
        done();
      });
    });

    it('should not add a user who is blocked', function (done) {
      p.follow('receiver2@email.com', function (err, u) {
        should.exist(err);
        should.not.exist(u);
        done();
      });
    });
  });

  describe('.getBlockedUsers', function () {
    it('should return a list of blocked users', function (done) {
      p.getBlockedUsers(function (err, u) {
        should.exist(u);
        u.blocked.length.should.equal(1);
        done();
      });
    });
  });

  describe('.unblockUser', function (done) {
    it('should error on unblocking a user', function (done) {
      p.unblockUser('', function (err, s) {
        should.exist(err);
        done();
      });
    });

    it('should unblock a user', function (done) {
      p.unblockUser('receiver2@email.com', function (err, s) {
        should.exist(s);
        done();
      });
    });
  });

  describe('.unfollow', function () {
    it('should unfollow', function (done) {
      p.unfollow('receiver@email.com', function (err, s) {
        should.not.exist(err);
        should.exist(s);

        p.getFollowing(function (err, f) {
          f.followed.length.should.equal(0);
          done();
        });
      });
    });
  });
});
