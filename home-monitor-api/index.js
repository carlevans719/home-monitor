const express = require('express');
const https = require('https');
const http = require('http');
const { BasicStrategy } = require('passport-http');
const passport = require('passport');
const bcrypt = require('bcryptjs');
const path = require('path');
const fs = require('fs');
const { Expo } = require('expo-server-sdk');
const knex = require('knex')({
  client: 'sqlite3',
  connection: {
    filename: "./dev.sqlite"
  },
  useNullAsDefault: true,
});

const {
  MEDIA_PATH,
  MEDIA_SERVER_IP,
  MEDIA_SERVER_PORTS,
  DEFAULT_USERNAME,
  DEFAULT_PASSWORD_HASH,
  EXPO_ACCESS_TOKEN,
} = require('./constants');

const cert = fs.readFileSync('/home/pi/server.crt');
const key = fs.readFileSync('/home/pi/server.key');
const credentials = { key, cert };

;(async () => {
  const expo = new Expo({});

  if (! await knex.schema.hasTable('users')) {
    console.log('Creating users table');

    await knex.schema.createTable('users', function (table) {
      table.increments();
      table.string('username');
      table.unique('username');
      table.string('password');
      table.string('pushtoken');
      table.boolean('ishome');
    });
  }

  if (! (await knex('users').where({ username: DEFAULT_USERNAME })).length) {
    console.log('Creating default user');

    await knex('users').insert({
      username: DEFAULT_USERNAME,
      password: DEFAULT_PASSWORD_HASH,
      pushtoken: null,
      ishome: true,
    });
  }

  passport.use(new BasicStrategy(
    async function (username, password, done) {
      const [user] = await knex('users')
        .where({
          username,
        })
        .select(['id', 'username', 'password', 'pushtoken', 'ishome'])
        .limit(1);

      if (user && await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false);
      }
    }
  ));

  const app = express();
  const httpsServer = https.createServer(credentials, app);

  app.use(express.json());
  app.use(passport.initialize());

  app.get('/feeds/:feedNumber', passport.authenticate('basic', { session: false }), function (req, res, next) {
    const options = {
      hostname: MEDIA_SERVER_IP,
      path: '/',
      method: 'GET',
      headers: {},
    };

    switch (req.params.feedNumber) {
      case '1': {
        const upstreamRequest = http.request(Object.assign({ port: MEDIA_SERVER_PORTS.FEED_1 }, options), upstreamResponse => {
          res.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
          upstreamResponse.pipe(res, { end: true });
        });
        req.pipe(upstreamRequest, { end: true });
        break;
      }
      case '2': {
        const upstreamRequest = http.request(Object.assign({ port: MEDIA_SERVER_PORTS.FEED_2 }, options), upstreamResponse => {
          res.writeHead(upstreamResponse.statusCode, upstreamResponse.headers);
          upstreamResponse.pipe(res, { end: true });
        });
        req.pipe(upstreamRequest, { end: true });
        break;
      }
      default:
        next(new Error('Feed not found'));
    }
  });

  app.get('/files', passport.authenticate('basic', { session: false }), function (req, res, next) {
    fs.readdir(MEDIA_PATH, (err, files) => {
      if (err) {
        return next(err);
      }

      res.json(files);
    });
  });

  app.post('/files-cleanup', passport.authenticate('basic', { session: false }), function (req, res, next) {
    fs.readdir(MEDIA_PATH, async (err, files) => {
      if (err) {
        return next(err);
      }

      for (const file of files) {
        try {
          await new Promise((resolve, reject) => fs.unlink(path.join(MEDIA_PATH, file), (err) => {
            if (err) return reject(err);
            return resolve(true);
          }))
        } catch (ex) {
          return next(ex);
        }
      }

      return res.json(true);
    });
  });

  app.get('/files/:name', passport.authenticate('basic', { session: false }), function (req, res, next) {
    try {
      const filePath = path.join(MEDIA_PATH, req.params.name.replace(/^[\/\.\\]+/, ''));

      // Will throw if file does not exist
      const stats = fs.statSync(filePath);

      res.set('Content-Length', stats.size);
      return fs.createReadStream(filePath).pipe(res);
    } catch (ex) {
      return next(ex);
    }
  });

  app.put('/push-token', passport.authenticate('basic', { session: false }), async function (req, res, next) {
    if (req.body.pushtoken !== null) {
      if (typeof req.body.pushtoken !== 'string' || !Expo.isExpoPushToken(req.body.pushtoken)) {
        return res.status(400).send('Bad Request');
      }
    }

    console.log('pushnotifications: ', req.body, req.user);

    await knex('users')
      .update({ pushtoken: req.body.pushtoken })
      .where({ id: req.user.id });

    return res.json(true);
  });

  app.put('/geofencing', passport.authenticate('basic', { session: false }), async function (req, res, next) {
    console.log((new Date()).toISOString() + ': Geofencing: ', req.body, req.user);

    if (!req.body.event || !['enter', 'exit'].includes(req.body.event)) {
      return res.status(400).send('Bad Request');
    }

    const result = await knex('users')
      .update({ ishome: req.body.event === 'enter' })
      .where({ id: req.user.id });

    console.log((new Date()).toISOString() + ': Geofencing update finished: ', result);

    return res.json(true);
  });

  app.post('/motion-detected', async function (req, res, next) {
    if (req.query.API_KEY !== process.env.API_KEY) {
      return next(new Error('Forbidden'));
    }

    const messages = [];
    const users = await knex('users')
      .select('pushtoken')
      .whereRaw('users.pushtoken IS NOT NULL AND users.ishome IS NOT TRUE');

    for (const user of users) {
      messages.push({
        to: user.pushtoken,
        sound: 'default',
        body: 'Motion detected on Camera ' + req.query.camera,
        data: { fileName: req.query.filename, feedNumber: req.query.camera },
      });
    }

    let chunks = expo.chunkPushNotifications(messages);
    let tickets = [];
    // Send the chunks to the Expo push notification service. There are
    // different strategies you could use. A simple one is to send one chunk at a
    // time, which nicely spreads the load out over time:
    for (let chunk of chunks) {
      try {
        let ticketChunk = await expo.sendPushNotificationsAsync(chunk);
        console.log(ticketChunk);
        tickets.push(...ticketChunk);
        // NOTE: If a ticket contains an error code in ticket.details.error, you
        // must handle it appropriately. The error codes are listed in the Expo
        // documentation:
        // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
      } catch (error) {
        console.error(error);
      }
    }

    let receiptIds = [];
    for (let ticket of tickets) {
      // NOTE: Not all tickets have IDs; for example, tickets for notifications
      // that could not be enqueued will have error information and no receipt ID.
      if (ticket.id) {
        receiptIds.push(ticket.id);
      }
    }

    let receiptIdChunks = expo.chunkPushNotificationReceiptIds(receiptIds);

    // Like sending notifications, there are different strategies you could use
    // to retrieve batches of receipts from the Expo service.
    for (let chunk of receiptIdChunks) {
      try {
        let receipts = await expo.getPushNotificationReceiptsAsync(chunk);
        console.log(receipts);

        // The receipts specify whether Apple or Google successfully received the
        // notification and information about an error, if one occurred.
        for (let receiptId in receipts) {
          let { status, message, details } = receipts[receiptId];
          if (status === 'ok') {
            continue;
          } else if (status === 'error') {
            console.error(
              `There was an error sending a notification: ${message}`
            );
            if (details && details.error) {
              // The error codes are listed in the Expo documentation:
              // https://docs.expo.io/push-notifications/sending-notifications/#individual-errors
              // You must handle the errors appropriately.
              console.error(`The error code is ${details.error}`);
            }
          }
        }
      } catch (error) {
        console.error(error);
      }
    }

    res.json(true);
  });

  httpsServer.listen(3000)
})();
