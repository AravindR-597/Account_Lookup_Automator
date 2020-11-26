const { response } = require("express");
var express = require("express");
var router = express.Router();
var mainfunction = require("../account_fun/main_fun");
const verifyLogin = (req, res, next) => {
  if (req.session.userLogin) {
    next();
  } else {
    res.redirect("/login");
  }
};

//Login Page
router.get("/login", (req, res) => {
  if (req.session.user) {
    res.render("login");
  } else res.render("login", { Errmsg: req.session.userLoginErr });
  req.session.userLoginErr = "";
});
//Login Submit
router.post("/login", async (req, res) => {
  console.log(req.body);
  await mainfunction.loginFunction(req.body).then((data) => {
    if (data.loginStatus) {
      req.session.userLogin = true;
      req.session.user = data.user;
      res.redirect("/");
    } else {
      req.session.userLoginErr = "Invalid Username or Password";
      res.redirect("/login");
    }
  });
});
/* GET HOME page. */
router.get("/", verifyLogin, (req, res, _next) => {
  let user = req.session.user;
  if (req.query.search) {
    //search
    const regex = new RegExp(searchOptions(req.query.search), "gi");
    mainfunction.findAccount(user._id, regex).then((accounts) => {
      res.render("index", { accounts: accounts, user });
    });
  } else {
    mainfunction.findAccount(user._id).then((accounts) => {
      res.render("index", { accounts: accounts, user });
    });
  }
});
//function for search
function searchOptions(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/* GET ADD page. */
router.get("/add", verifyLogin, (req, res) => {
  let user = req.session.user;
  res.render("add", { title: "Account Lookup", user });
});

//Add Account
router.post("/addAccount", verifyLogin, (req, res) => {
  let user = req.session.user;
  mainfunction.addAccount(req.body, user._id).then(() => {
    res.redirect("/");
  });
});

/* GET DELETE page. */
router.get("/delete", verifyLogin, (req, res) => {
  let user = req.session.user;
  res.render("delete", { title: "Account Lookup", user });
});

//Delete Account
router.post("/deleteAccount", verifyLogin, (req, res) => {
  let user = req.session.user;
  mainfunction.deleteAccount(req.body, user._id).then(() => {
    res.redirect("/");
  });
});
let check = true;
router.get("/changepassword", (req, res) => {
  let user = req.session.user;
  if (!check) {
    check = true;
    res.render("changePassword", {
      user,
      Errmsg: "Password not changed Try Again",
    });
  } else {
    res.render("changePassword", { user });
  }
});
router.post("/changeaccpass", async (req, res) => {
  let user = req.session.user;
  await mainfunction
    .changeAccountPassword(req.body, user._id)
    .then((response) => {
      if (response.changeStatus) {
        res.redirect("/logout");
      } else {
        check = false;
        res.redirect("/changepassword");
      }
    });
});
router.post("/changedoppass", async (req, res) => {
  let user = req.session.user;
  await mainfunction.changeDOPPassword(req.body, user._id).then((response) => {
    if (response.changeStatus) {
      res.redirect("/");
    } else {
      check = false;
      res.redirect("/changepassword");
    }
  });
});
//Get Final Page
router.get("/final", verifyLogin, async (req, res) => {
  let user = req.session.user;
  let total = 0;
  let accounts = await mainfunction.finalList(user._id);
  if (accounts.length > 0) {
    total = await mainfunction.getTotal(user._id);
    console.log(total);
  }
  res.render("final", {
    title: "Account Lookup",
    accounts: accounts,
    count: accounts.length,
    totalAmount: total,
    user,
  });
});
//Add To List
router.post("/addToList/", verifyLogin, (req, res) => {
  let user = req.session.user;
  mainfunction.addToList(req.body, user._id).then((response) => {
    res.json(response);
  });
});
//Rebate
router.post("/rebateFunction", async (req, res) => {
  console.log(req.body);
  let response = {};
  let user = req.session.user;
  response.rebate = await mainfunction.rebateFunction(req.body, user._id);
  if (response.rebate.successStatus) {
    response.total = await mainfunction.getTotal(user._id);
  }
  console.log(response);
  res.json(response);
});
//Delete From List
router.post("/deleteFromList", verifyLogin, function (req, res) {
  let user = req.session.user;
  mainfunction.deleteFromList(req.body, user._id).then((response) => {
    console.log(response.deleteStatus);
    res.json(response);
  });
});
//Finish
router.get("/finish", verifyLogin, async (req, res) => {
  let user = req.session.user;
  await mainfunction.dropList(user._id);
  res.redirect("/");
});

//Genarate List`
router.get("/genarateList", verifyLogin, async (req, res) => {
  let user = req.session.user;
  await mainfunction.genarateList(user._id).then((data) => {
    console.log("this is from userjs", data);
    res.json(data);
  });
});
router.get("/logout", (req, res) => {
  req.session.userLogin = "";
  res.redirect("/login");
});
module.exports = router;
