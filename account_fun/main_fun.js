var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const { spawnSync } = require("child_process");
const path = require("path");
const bcrypt = require("bcrypt");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("SECRETKEY");

module.exports = {
  loginFunction: (loginData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let user = await db
        .get()
        .collection(collection.USER)
        .findOne({ username: loginData.UserID });
      if (user) {
        bcrypt.compare(loginData.Password, user.password).then((status) => {
          if (status) {
            response.user = user;
            response.loginStatus = true;
            resolve(response);
          } else {
            resolve({ loginStatus: false });
          }
        });
      } else {
        resolve({ loginStatus: false });
      }
    });
  },
  addAccount: (data, userID) => {
    let newAccount = {
      user: ObjectId(userID),
      accounts: [data],
    };
    console.log(newAccount);
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER)
        .updateOne({ _id: ObjectId(userID) }, { $push: { accounts: data } });
      resolve();
    });
  },

  deleteAccount: (data, userID) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.USER)
        .updateOne({ _id: ObjectId(userID) }, { $pull: { accounts: data } });
      resolve();
    });
  },

  findAccount: (userId, search) => {
    console.log(userId);
    return new Promise(async (resolve, reject) => {
      let accountArr = await db
        .get()
        .collection(collection.USER)
        .aggregate([
          {
            $match: { _id: ObjectId(userId) },
          },
          {
            $project: {
              _id: 0,
              accounts: 1,
            },
          },
          {
            $unwind: "$accounts",
          },
        ])
        .toArray();
      let account = accountArr.map((a) => a.accounts);
      if (search) {
        let matchedAccount = account.filter((a) => {
          return search.test(a.Name);
        });
        resolve(matchedAccount);
      } else {
        resolve(account);
      }
    });
  },
  addToList: (Details, userId) => {
    console.log(userId);
    let accDetails = {
      Name: Details.Name,
      Number: Details.Number,
      Denomination: parseInt(Details.Denomination),
      Rebate: parseInt(Details.Rebate),
    };
    return new Promise(async (resolve, reject) => {
      let userDB = await db
        .get()
        .collection(collection.LIST)
        .findOne({ user: ObjectId(userId) });
      if (userDB) {
        let dbExist = userDB.listAcc.findIndex(
          (acc) => acc.Number == accDetails.Number
        );
        if (dbExist == -1) {
          db.get()
            .collection(collection.LIST)
            .updateOne(
              {
                user: ObjectId(userId),
              },
              {
                $push: { listAcc: accDetails },
              }
            )
            .then(() => {
              resolve({ status: true });
            });
        } else {
          resolve({ status: false });
        }
      } else {
        let listObj = {
          user: ObjectId(userId),
          listAcc: [accDetails],
        };
        db.get()
          .collection(collection.LIST)
          .insertOne(listObj)
          .then(() => {
            resolve({ status: true });
          });
      }
    });
  },
  finalList: (userID) => {
    return new Promise(async (resolve, reject) => {
      let list = await db
        .get()
        .collection(collection.LIST)
        .aggregate([
          {
            $match: { user: ObjectId(userID) },
          },
          {
            $project: {
              _id: 0,
              listAcc: 1,
            },
          },
          {
            $unwind: "$listAcc",
          },
        ])
        .toArray();
      let account = list.map((a) => a.listAcc);
      resolve(account);
    });
  },
  getTotal: (userID) => {
    return new Promise(async (resolve, reject) => {
      let total = await db
        .get()
        .collection(collection.LIST)
        .aggregate([
          {
            $match: { user: ObjectId(userID) },
          },
          {
            $project: {
              _id: 0,
              listAcc: 1,
            },
          },
          {
            $unwind: "$listAcc",
          },
          {
            $group: {
              _id: null,
              total: {
                $sum: {
                  $multiply: ["$listAcc.Rebate", "$listAcc.Denomination"],
                },
              },
            },
          },
        ])
        .toArray();
      resolve(total[0].total);
    });
  },
  rebateFunction: (data, userID) => {
    let currentValue = parseInt(data.currentValue);
    let triggerValue = parseInt(data.trigger);
    return new Promise(async (resolve, reject) => {
      if (currentValue == 1 && triggerValue == -1) {
        resolve({ successStatus: false, falseAttempt: true });
      } else {
        await db
          .get()
          .collection(collection.LIST)
          .updateOne(
            { user: ObjectId(userID), "listAcc.Number": { $eq: data.number } },
            { $inc: { "listAcc.$.Rebate": triggerValue } }
          );
        resolve({ successStatus: true, falseAttempt: false });
      }
    });
  },
  deleteFromList: (data, userID) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection(collection.LIST)
        .updateOne(
          { user: ObjectId(userID), "listAcc.Number": { $eq: data.Number } },
          { $pull: { listAcc: { Number: data.Number } } }
        );
      resolve({ deleteStatus: true });
    });
  },
  dropList: (userID) => {
    return new Promise(async (resolve, reject) => {
      await db
        .get()
        .collection("list")
        .deleteOne({ user: ObjectId(userID) });
      resolve();
    });
  },
  genarateList: (userID) => {
    return new Promise(async (resolve, reject) => {
      let list = await db
        .get()
        .collection(collection.LIST)
        .findOne(
          { user: ObjectId(userID) },
          { projection: { listAcc: { Number: 1, Rebate: 1 }, _id: 0 } }
        );
      let credentials = await db
        .get()
        .collection(collection.USER)
        .aggregate([
          {
            $match: { _id: ObjectId(userID) },
          },
          {
            $project: {
              _id: 0,
              UserInfo: {
                DOP_ID: 1,
                DOP_password: 1,
              },
            },
          },
        ])
        .toArray();
      let decryptedPassword = cryptr.decrypt(
        credentials[0].UserInfo.DOP_password
      );
      let accNumbers = list.listAcc.map((a) => a.Number);
      let rebateNumber = list.listAcc.map((a) => a.Rebate);
      const childPython = spawnSync("python", [
        path.join(__dirname, "../public/pythonscripts/webscrape.py"),
        credentials[0].UserInfo.DOP_ID,
        decryptedPassword,
        accNumbers,
        rebateNumber,
      ]);
      if (childPython.status != 0) {
        console.log(childPython.stderr);
      } else {
        console.log(`${childPython.stdout}`);
        resolve(`${childPython.stdout}`);
      }
    });
  },
  changeAccountPassword: (passwords, userId) => {
    console.log(passwords);
    return new Promise(async (resolve, reject) => {
      // oldpassword = await bcrypt.hash(passwords.Cpass, 10);
      oldpassword = passwords.Cpass;
      newPassword = await bcrypt.hash(passwords.Npass, 10);
      let user = await db
        .get()
        .collection(collection.USER)
        .findOne({ _id: ObjectId(userId) });
      console.log(user.password);
      console.log(oldpassword);
      if (user) {
        bcrypt.compare(oldpassword, user.password).then(async (status) => {
          if (status) {
            console.log("true");
            await db
              .get()
              .collection(collection.USER)
              .updateOne(
                { _id: ObjectId(userId) },
                { $set: { password: newPassword } }
              );
            resolve({ changeStatus: true });
          } else {
            console.log("false");
            resolve({ changeStatus: false });
          }
        });
      }
    });
  },
  changeDOPPassword: (passwords, userId) => {
    console.log(passwords);
    return new Promise(async (resolve, reject) => {
      // oldpassword = await bcrypt.hash(passwords.Cpass, 10);
      oldpassword = passwords.Cpass;
      newPassword = await bcrypt.hash(passwords.Npass, 10);
      let user = await db
        .get()
        .collection(collection.USER)
        .findOne({ _id: ObjectId(userId) });
      console.log(user.UserInfo.DOP_password);
      console.log(oldpassword);
      console.log(user.UserInfo.DOP_password);
      if (user) {
        bcrypt
          .compare(oldpassword, user.UserInfo.DOP_password)
          .then(async (status) => {
            if (status) {
              console.log("true");
              await db
                .get()
                .collection(collection.USER)
                .updateOne(
                  { _id: ObjectId(userId) },
                  {
                    $set: {
                      "UserInfo.DOP_password": newPassword,
                    },
                  }
                );
              resolve({ changeStatus: true });
            } else {
              console.log("false");
              resolve({ changeStatus: false });
            }
          });
      }
    });
  },
};
