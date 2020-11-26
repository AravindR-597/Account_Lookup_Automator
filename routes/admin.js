var express = require("express");
var router = express.Router();
var adminfunction = require("../account_fun/admin_fun");
var xlstojson = require("xls-to-json-lc");
var xlsxtojson = require("xlsx-to-json-lc");

const verifyLogin = (req, res, next) => {
  if (req.session.adminLogin) {
    next();
  } else {
    res.redirect("/admin/login");
  }
};

router.get("/login", (req, res, next) => {
  if(req.session.adminLogin){
    res.redirect('/admin')
  }else{
    res.render("adminLogin",{admin:true,Errmsg: req.session.adminLoginErr,});
  }

});
router.post("/login", async (req, res) => {
  console.log(req.body);
  await adminfunction.loginFunction(req.body).then((data) => {
    console.log(data.loginStatus);
    if (data.loginStatus) {
      req.session.adminLogin = true;
      req.session.admin = data.admin;
      res.redirect("/admin");
    } else {
      req.session.adminLoginErr = "Invalid Username or Password";
      res.redirect("/admin/login");
    }
  });
});
router.get("/",verifyLogin,(req,res)=>{
  res.render('adminHome',{admin:true , logstate:true})
})

router.get("/addNewUser",verifyLogin,(req, res) => {
  res.render("addNewUser",{admin:true,logstate:true});
});
router.post("/addNewUser", (req, res) => {
  if (!req.files.accounts) {
    res.json({ error_code: 1, err_desc: "No file passed" });
    return;
  }
  if (
    req.files.accounts.name.split(".")[
      req.files.accounts.name.split(".").length - 1
    ] === "xlsx"
  ) {
    exceltojson = xlsxtojson;
  } else {
    exceltojson = xlstojson;
  }
  exceltojson(
    {
      input: req.files.accounts.tempFilePath,
      output: null,
      lowerCaseHeaders: false,
    },
    function (err, result) {
      if (err) {
        return res.json({ error_code: 1, err_desc: err, data: null });
      }
      adminfunction.addNewUser(req.body, result).then(() => {
        res.redirect("/admin/addNewUser");
      });
    }
  );
});
router.get("/viewAllUsers", verifyLogin,(req, res) => {
  adminfunction.getUser().then((users) => {
    console.log(users);
    res.render("viewAllUser", { users: users ,admin:true,logstate:true});
  });
});
router.get("/viewAccounts/:id", (req, res) => {
  adminfunction.viewAccounts(req.params.id).then((accounts) => {
    res.render("viewAccounts", { accounts: accounts ,admin:true,logstate:true});
  });
});
router.get("/logout", (req, res) => {
  req.session.adminLogin=null
  res.redirect("/admin/login"); 
});
module.exports = router;

