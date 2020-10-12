var db = require("../config/connection");
var collection = require("../config/collections");
var credentials = require("../config/credentials");
const { ObjectId } = require("mongodb");
const { spawn } = require("child_process");
const path = require("path");
const { resolve } = require("path");

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
    db.get()
      .collection(collection.ACCOUNT_LOOKUP)
      .findOne({ _id: ObjectId(id) })
      .then((data) => {
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
      let accounts = await db
        .get()
        .collection(collection.LIST)
        .find()
        .sort({ Number: 1 })
        .toArray();
      console.log(accounts);
      let count = await db.get().collection(collection.LIST).count();
      resolve([accounts, count]);
    });
  },
  numberOfRecords: () => {
    return new Promise(async (resolve, reject) => {
      let records = await db.get().collection(collection.LIST).count();
      resolve(records);
    });
  },
  deleteFromList: (id, callback) => {
    db.get()
      .collection(collection.LIST)
      .findOne({ _id: ObjectId(id) })
      .then((data) => {
        //console.log(data);
        db.get()
          .collection(collection.LIST)
          .deleteOne(data)
          .then(() => {
            callback(true);
          });
      });
  },
  plusFunction: (id, trigger) => {
    return new Promise(async (resolve, reject) => {
      let rebate = await db
        .get()
        .collection(collection.LIST)
        .find({ _id: ObjectId(id) }, { projection: { default: 1, _id: 0 } })
        .toArray();
      let result = rebate.map((a) => a.default);
      let numRebate = parseInt(result);
      if (trigger == 1) var updatedRebate = (numRebate += 1);
      if (trigger == 0) updatedRebate = numRebate -= 1;
      updatedRebate = updatedRebate.toString();
      id1 = id.toString();
      await db
        .get()
        .collection(collection.LIST)
        .updateOne(
          { _id: ObjectId(id1) },
          { $set: { default: updatedRebate } },
          () => {
            console.log("now here");
            resolve();
          }
        );
    });
  },
  dropList: () => {
    return new Promise(async (resolve, reject) => {
      await db.get().collection("list").drop();
    });
  },
  genarateList: () => {
    return new Promise(async (resolve, reject) => {
      let genaratedNumbers = await db
        .get()
        .collection(collection.LIST)
        .find({}, { projection: { Number: 1, default: 1, _id: 0 } })
        .toArray();
      console.log(genaratedNumbers);
      let result = genaratedNumbers.map((a) => a.Number);
      let rebateNumber = genaratedNumbers.map((a) => a.default);
      const childPyhton = spawn("python", [
        path.join(__dirname, "../public/pythonscripts/webscrape.py"),
        credentials.USERNAME,
        credentials.PASSWORD,
        result,
        rebateNumber,
      ]);

      childPyhton.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });
      childPyhton.stderr.on("data", (data) => {
        console.log(`stderr: ${data}`);
      });
      resolve();
    });
  },
};
