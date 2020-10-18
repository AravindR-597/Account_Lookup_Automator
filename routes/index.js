var express = require("express");
var router = express.Router();
const { genarateList } = require("../account_fun/main_fun");
var mainfunction = require("../account_fun/main_fun");
const {spawn} = require('child_process');
const { render } = require("../app");

/* GET HOME page. */
router.get("/", (req, res, _next) => {
  if (req.query.search) {//search
    const regex = new RegExp(searchOptions(req.query.search), "gi");

    mainfunction.searchAccount(regex).then((accounts) => {
      res.render("index", { accounts: accounts });
    });
  } else {
    let accounts = mainfunction.findAccount().then((accounts)=>{
      res.render("index", { accounts: accounts });
    
    })
  }
});
//function for search
function searchOptions(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

/* GET ADD page. */
router.get("/add", function (_req, res) {
  res.render("add", { title: "Account Lookup" });
});

//Add Account
router.post("/addAccount", function (req, res) {
  //console.log(req.body);

  mainfunction.addAccount(req.body, () => {
    res.redirect("/");
  });
});

/* GET DELETE page. */
router.get("/delete", function (_req, res) {
  res.render("delete", { title: "Account Lookup" });
});

//Delete Account
router.post("/deleteAccount", function (req, res) {
  console.log(req.body);

  mainfunction.deleteAccount(req.body, () => {
    res.redirect("/");
  });
});
//Get Final Page
router.get("/final", function (_req, res) {
  mainfunction.finalList().then(([accounts,count]) => {
    //console.log(accounts)
    res.render("final", { title: "Account Lookup", accounts: accounts , count});
  });
});
//Add To List
router.get("/addToList/:id", function (req, res) {
  console.log("api call");
  mainfunction.addToList(req.params.id, () => {
    res.json({status:true})
  });
});
//Delete Account From List
router.get("/deleteFromList/:id", function (req, res) {
 // console.log(req.params.id);

  mainfunction.deleteFromList(req.params.id, () => {
    res.redirect('/final')
  });
});
//plus
router.get("/plusFunction/:id",(req,res)=>{
  //console.log("api call")
   mainfunction.plusFunction(req.params.id,1)
    //console.log("here")
    res.redirect("/final")
 })
 //minus
 router.get("/minusFunction/:id",(req,res)=>{
 // console.log("api call")
  mainfunction.plusFunction(req.params.id,0)
  //console.log("here")
   res.redirect("/final")
})
//Finish
router.get("/finish", (req, res) => {
  mainfunction.dropList();
  res.redirect("/");
});

//Genarate List
router.get("/genarateList", (req, res) => {
 let genaratedNumber=mainfunction.genarateList()
    res.redirect("/final");

});


module.exports = router;
