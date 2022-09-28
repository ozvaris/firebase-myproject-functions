/* eslint-disable indent */
import * as functions from "firebase-functions";
import * as admin from "firebase-admin";

// import { UserRecord } from "firebase-functions/lib/providers/auth";
admin.initializeApp();

const firestore = admin.firestore();

exports.onWriteTileLiked = functions
  .region("europe-west2")
  .firestore.document("users/{userId}/userLiked/{tileID}")
  .onWrite((change, context) => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const document = change.after.exists ? change.after.data() : null;

    // Get an object with the previous document value (for update or delete)
    // const oldDocument = change.before.data();

    // const docRef = admin
    //   .firestore()
    //   .collection("tiles")
    //   .doc(context.params.likedID);

    const docRefTileLiked = admin
      .firestore()
      .doc(`tiles/${context.params.tileID}/tileLiked/${context.params.userId}`);

    // let LikeAmount = 1;

    if (!document) {
      docRefTileLiked.delete();
      // LikeAmount--;
    } else {
      docRefTileLiked.set({
        uid: context.params.userId,
        createdAt: document.createdAt,
      });
    }

    const docRefTile = admin.firestore().doc(`tiles/${context.params.tileID}`);

    docRefTile.get().then((querySnapshot) => {
      let likeCount = querySnapshot.data()?.likeCount ?? 0;
      if (!document) {
        if (likeCount > 0) {
          likeCount--;
        }
      } else {
        likeCount++;
      }

      // data to update on the document
      // eslint-disable-next-line object-curly-spacing
      const data = { likeCount };

      docRefTile.update(data);
    });

    functions.logger.log(
      // eslint-disable-next-line max-len
      `Liked Update tile : ${context.params.tileID} user : ${context.params.userId} `
    );

    return 0;
  });

exports.onWriteTileRead = functions
  .region("europe-west2")
  .firestore.document("users/{userId}/userRead/{tileID}")
  .onWrite((change, context) => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const document = change.after.exists ? change.after.data() : null;

    // Get an object with the previous document value (for update or delete)
    // const oldDocument = change.before.data();

    // const docRef = admin
    //   .firestore()
    //   .collection("tiles")
    //   .doc(context.params.likedID);

    const docRefTileRead = admin
      .firestore()
      .doc(`tiles/${context.params.tileID}/tileRead/${context.params.userId}`);

    // let LikeAmount = 1;

    if (!document) {
      docRefTileRead.delete();
      // LikeAmount--;
    } else {
      docRefTileRead.set({
        uid: context.params.userId,
        createdAt: document.createdAt,
      });
    }

    const docRefTile = admin.firestore().doc(`tiles/${context.params.tileID}`);

    docRefTile.get().then((querySnapshot) => {
      let readCount = querySnapshot.data()?.readCount ?? 0;
      if (!document) {
        if (readCount > 0) {
          readCount--;
        }
      } else {
        readCount++;
      }

      // data to update on the document
      // eslint-disable-next-line object-curly-spacing
      const data = { readCount };

      docRefTile.update(data);
    });

    functions.logger.log(
      // eslint-disable-next-line max-len
      `Read Update tile : ${context.params.tileID} user : ${context.params.userId} `
    );

    return 0;
  });

exports.onWriteTileContentClicked = functions
  .region("europe-west2")
  .firestore.document("tiles/{tileID}/tileContentClicked/{userID}")
  .onWrite((change, context) => {
    // Get an object with the current document value.
    // If the document does not exist, it has been deleted.
    const document = change.after.exists ? change.after.data() : null;

    // Get an object with the previous document value (for update or delete)
    const oldDocument = change.before.exists ? change.before.data() : null;

    // const docRef = admin
    //   .firestore()
    //   .collection("tiles")
    //   .doc(context.params.likedID);

    // const docRefTileContentClicked = admin.firestore().doc(
    // eslint-disable-next-line max-len, max-len
    //   `tiles/${context.params.tileID}/userContentClicked/${context.params.userId}`
    // );

    // let LikeAmount = 1;

    // if (!document) {
    //   docRefTileContentClicked.delete();
    //   // LikeAmount--;
    // } else {
    //   docRefTileContentClicked.set({
    //     uid: context.params.userId,
    //     createdAt: document.createdAt,
    //   });
    // }

    if (!oldDocument && document) {
      const docRefTile = admin
        .firestore()
        .doc(`tiles/${context.params.tileID}`);

      docRefTile.get().then((querySnapshot) => {
        let contentClickedCount =
          querySnapshot.data()?.contentClickedCount ?? 0;
        contentClickedCount += 1;

        // eslint-disable-next-line object-curly-spacing
        const data = { contentClickedCount };

        docRefTile.update(data);

        functions.logger.log(
          // eslint-disable-next-line max-len
          `Content Clicked Count Update tile : ${context.params.tileID} user : ${context.params.userID} contentClickedCount: ${contentClickedCount}`
        );
      });
    }

    functions.logger.log(
      // eslint-disable-next-line max-len
      `Content Clicked Count run properly : ${context.params.tileID} user : ${context.params.userID}`
    );

    return 0;
  });

exports.ScheduledNewTiles = functions
  .region("europe-west2")
  .pubsub.schedule("0 0 * * *")
  .timeZone("Europe/London")
  .onRun(async (context) => {
    // eslint-disable-next-line max-len
    const executionTimestamp = context.timestamp; // The timestamp at which the event happened.
    const tiles = firestore.collection("tiles");
    const params = firestore.doc("params/params1");

    const tile = await tiles.where("widget", "==", "new").get();

    functions.logger.log(
      // eslint-disable-next-line max-len
      `ScheduledNewTiles Update new to trending : amount: ${tile.size} `,
      executionTimestamp
    );

    let i = 0;

    if (tile.size > 0) {
      tile.forEach(async (snapshot) => {
        const tiles = firestore.collection(
          `tiles/${tile.docs[i].id}/tileContentClicked`
        );

        let hourDiff = 0;

        const data = tile.docs[i].data();

        const now = admin.firestore.Timestamp.fromDate(
          new Date(executionTimestamp)
        ).seconds;

        const createdAt = data.createdAt._seconds;

        const secondsDiff = now - createdAt;

        const minsDiff = Math.round(secondsDiff / 60);

        hourDiff = Math.round(minsDiff / 60);

        functions.logger.log(
          // eslint-disable-next-line max-len
          `ScheduledNewTiles Update new to trending : rowId: ${tile.docs[i].id} hourDiff: ${hourDiff}`,
          executionTimestamp
        );

        if (hourDiff > 24) {
          // eslint-disable-next-line object-curly-spacing
          snapshot.ref.update({ widget: "trending" });
        }

        i += 1;
      });
    }

    functions.logger.log(
      // eslint-disable-next-line max-len
      "ScheduledNewTiles Update new to trending  run properly ",
      executionTimestamp
    );

    return null;
  });
