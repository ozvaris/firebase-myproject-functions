/* eslint-disable max-len */
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
          `Content Clicked Count Update tile : ${context.params.tileID} user : ${context.params.userID} contentClickedCount: ${contentClickedCount}`
        );
      });
    }

    functions.logger.log(
      `Content Clicked Count run properly : ${context.params.tileID} user : ${context.params.userID}`
    );

    return 0;
  });

// exports.ScheduledNewTiles = functions
//   .region("europe-west2")
//   .pubsub.schedule("0 0 * * *")
//   .timeZone("Europe/London")
//   .onRun(async (context) => {
//     const executionTimestamp = context.timestamp; // The timestamp at which the event happened.
//     const tiles = firestore.collection("tiles");

//     const tile = await tiles.where("widget", "==", "new").get();

//     functions.logger.log(
//       `ScheduledNewTiles Update new to trending : amount: ${tile.size} `,
//       executionTimestamp
//     );

//     let i = 0;

//     if (tile.size > 0) {
//       tile.forEach(async (snapshot) => {
//         let hourDiff = 0;

//         const data = tile.docs[i].data();

//         const now = admin.firestore.Timestamp.fromDate(
//           new Date(executionTimestamp)
//         ).seconds;

//         const createdAt = data.createdAt._seconds;

//         const secondsDiff = now - createdAt;

//         const minsDiff = Math.round(secondsDiff / 60);

//         hourDiff = Math.round(minsDiff / 60);

//         functions.logger.log(
//           `ScheduledNewTiles Update new to trending : rowId: ${tile.docs[i].id} hourDiff: ${hourDiff}`,
//           executionTimestamp
//         );

//         if (hourDiff > 24) {
//           // eslint-disable-next-line object-curly-spacing
//           snapshot.ref.update({ widget: "trending" });
//         }

//         i += 1;
//       });
//     }

//     functions.logger.log(
//       "ScheduledNewTiles Update new to trending  run properly ",
//       executionTimestamp
//     );

//     return null;
//   });

exports.ScheduledConvertNewTilesByClickCount = functions
  .region("europe-west2")
  .pubsub.schedule("0 0 * * *")
  .timeZone("Europe/London")
  .onRun(async (context) => {
    const executionTimestamp = context.timestamp; // The timestamp at which the event happened.
    const tiles = firestore.collection("tiles");
    const params = firestore.doc("params/params1");

    const tile = await tiles.where("widget", "==", "new").get();

    functions.logger.log(
      `ScheduledNewTiles Update new to trending : new tile amount: ${tile.size} `,
      executionTimestamp
    );

    let i = 0;

    if (tile.size > 0) {
      const _params = await params.get();
      const _paramsData = _params.data();
      if (_paramsData === undefined) {
        functions.logger.log(
          "ScheduledNewTiles Update new to trending : _paramsData undefined ",
          executionTimestamp
        );

        return -1;
      }

      const convertNewToTrendingTileMinute =
        _paramsData.convertNewToTrendingTileMinute as number;

      const convertToNormalTileMinute =
        _paramsData.convertToNormalTileMinute as number;

      const treshouldCount = _paramsData.treshouldCount as number;

      functions.logger.log(
        `ScheduledNewTiles Update new to trending : Firebase Params convertNewToTrendingTileMinute:  ${convertNewToTrendingTileMinute},`,
        `convertToNormalTileMinute:  ${convertToNormalTileMinute} , treshouldCount:  ${treshouldCount}`,
        executionTimestamp
      );

      tile.forEach(async (snapshot) => {
        const tileContentClicked = firestore.collection(
          `tiles/${tile.docs[i].id}/tileContentClicked`
        );

        const tileData = tile.docs[i].data();

        const now = admin.firestore.Timestamp.fromDate(
          new Date(executionTimestamp)
        ).seconds;

        const secondsDiff = now - convertNewToTrendingTileMinute * 60;

        const secondsDiffDate = admin.firestore.Timestamp.fromMillis(
          secondsDiff * 1000
        ).toDate();

        const createdAtSeconds = tileData.createdAt._seconds;

        const createdAtDate = (
          tileData.createdAt as admin.firestore.Timestamp
        ).toDate();

        functions.logger.log(
          `ScheduledNewTiles Update new to trending : Reading Tile title : ${tileData.title},  rowId: ${tile.docs[i].id}, `,
          executionTimestamp
        );

        const tileContentClickedCount = await tileContentClicked
          .where("createdAt", ">", secondsDiffDate)
          .get();

        functions.logger.log(
          `ScheduledNewTiles Update new to trending : tileContentClickedCount : ${tileContentClickedCount.size},  rowId: ${tile.docs[i].id}, `,
          `createdAtSeconds: ${createdAtSeconds},  ControlTimeSeconds: ${secondsDiff}`,
          `createdAtDate: ${createdAtDate},  ControlTimeDate: ${secondsDiffDate}`,
          executionTimestamp
        );

        if (tileContentClickedCount.size > treshouldCount) {
          const tileValues = {
            id: tile.docs[i].id,
            title: tileData.title,
            createdAtSeconds,
            secondsDiff,
            createdAtDate,
            secondsDiffDate,
          };
          // eslint-disable-next-line object-curly-spacing
          snapshot.ref.update({ widget: "trending" }).then(() => {
            functions.logger.log(
              `ScheduledNewTiles Update new to trending : Updated Tile title new to trending : ${tileValues.title},  rowId: ${tileValues.id}, `,
              `createdAt: ${tileValues.createdAtSeconds},  ControlTime: ${tileValues.secondsDiff}`,
              `createdAt: ${tileValues.createdAtDate},  ControlTime: ${tileValues.secondsDiffDate}`,
              executionTimestamp
            );
          });
        } else {
          const tileValues = {
            id: tile.docs[i].id,
            title: tileData.title,
            createdAtSeconds,
            secondsDiff,
            createdAtDate,
            secondsDiffDate,
          };
          // eslint-disable-next-line object-curly-spacing
          snapshot.ref.update({ widget: "none" }).then(() => {
            functions.logger.log(
              `ScheduledNewTiles Update new to trending : Updated Tile title new to none : ${tileValues.title},  rowId: ${tileValues.id}, `,
              `createdAt: ${tileValues.createdAtSeconds},  ControlTime: ${tileValues.secondsDiff}`,
              `createdAt: ${tileValues.createdAtDate},  ControlTime: ${tileValues.secondsDiffDate}`,
              executionTimestamp
            );
          });
        }

        i += 1;
      });
    }

    functions.logger.log(
      "ScheduledNewTiles Update new to trending  run properly ",
      executionTimestamp
    );

    return null;
  });
