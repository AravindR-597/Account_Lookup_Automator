var db = require("../config/connection");
var collection = require("../config/collections");
const { ACCOUNT_LOOKUP } = require("../config/collections");
const { ObjectId } = require("mongodb");
const collections = require("../config/collections");

module.exports = {
  addAccount: (account, callback) => {
    //console.log(account);

    db.get()
      .collection(collection.ACCOUNT_LOOKUP)
      .insertOne(account)
      .then((data) => {
        callback(true);
      });
  },

  deleteAccount: (account, callback) => {
    //console.log(account);

    db.get()
      .collection(collection.ACCOUNT_LOOKUP)
      .deleteOne(account)
      .then((data) => {
        callback(true);
      });
  },

  findAccount: () => {
    return new Promise(async (resolve, reject) => {
      let accounts = await db
        .get()
        .collection(collection.ACCOUNT_LOOKUP)
        .find()
        .toArray();
      resolve(accounts);
    });
  },
  searchAccount: (name) => {
    return new Promise(async (resolve, reject) => {
      let accounts = await db
        .get()
        .collection(collection.ACCOUNT_LOOKUP)
        .find({ Name: name })
        .sort({ Name: 1 })
        .toArray();
      resolve(accounts);
    });
  },

  addToList: (id, callback) => {
    //console.log(id);

    db.get()
      .collection(collection.ACCOUNT_LOOKUP)
      .findOne({ _id: ObjectId(id) })
      .then((data) => {
        //console.log(data);

        db.get()
          .collection("list")
          .insertOne(data)
          .then((newData) => {
            callback(true);
          });
      });
  },
  finalList: () => {
    return new Promise(async (resolve, reject) => {
      let accounts = await db.get().collection("list").find().toArray();
      let count = await db.get().collection("list").count();
      resolve([accounts,count]);
    });
  },
  numberOfRecords: () => {
    return new Promise(async (resolve, reject) => {
      let records = await db.get().collection("list").count();
      resolve(records);
    });
  },
  deleteFromList: (id, callback) => {
    //console.log(id);

    db.get()
      .collection("list")
      .findOne({ _id: ObjectId(id) })
      .then((data) => {
        //console.log(data);
        db.get()
          .collection("list")
          .deleteOne(data)
          .then((newData) => {
            callback(true);
          });
      });
  },
  dropList: () => {
    return new Promise(async (resolve, reject) => {
      db.get().collection("list").drop();
    });
  },
};
