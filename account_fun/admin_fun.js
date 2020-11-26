var db = require("../config/connection");
var collection = require("../config/collections");
const { ObjectId } = require("mongodb");
const Cryptr = require("cryptr");
const cryptr = new Cryptr("SECRETKEY");
const bcrypt = require("bcrypt");

module.exports = {
  loginFunction: (loginData) => {
    let response = {};
    return new Promise(async (resolve, reject) => {
      let admin = await db
        .get()
        .collection(collection.ADMIN)
        .findOne({ username: loginData.ID });
      if (admin) {
        bcrypt.compare(loginData.Password, admin.password).then((status) => {
          if (status) {
            response.admin = admin;
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
  getUser: () => {
    return new Promise(async (resolve, reject) => {
      let users = await db.get().collection(collection.USER).find().toArray();
      resolve(users);
    });
  },
  viewAccounts: (UserID) => {
    return new Promise(async (resolve, reject) => {
      let accountArr = await db
        .get()
        .collection(collection.USER)
        .aggregate([
          {
            $match: { _id: ObjectId(UserID) },
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
      resolve(account);
    });
  },
  addNewUser: (newUser, accounts) => {
    return new Promise(async (resolve, reject) => {
      let user = {
        username: newUser.Mobile,
        password: await bcrypt.hash(newUser.Password, 10),
        UserInfo: {
            Firstname: newUser.FirstName,
            Lastname: newUser.LastName,
            Mobile: newUser.Mobile,
            Email: newUser.Email,
            DOP_ID: newUser.accUsername,
            DOP_password: cryptr.encrypt(newUser.accPassword),
          },
        
        accounts,
      };
      await db.get().collection(collection.USER).insertOne(user);
      resolve();
    });
  },
};
