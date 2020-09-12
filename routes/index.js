var express = require('express');
var router = express.Router();

/* GET HOME page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Account Lookup Automator'});
});


/* GET ADD page. */
router.get('/add', function(req, res,) {
  res.render('add', { title: 'Account Lookup Automator'});
});

//Add Account
router.post('/addAccount',function(req,res){
  console.log(req.body);
  res.send("Account Added to Database")
});


/* GET DELETE page. */
router.get('/delete', function(req, res,) {
  res.render('delete', { title: 'Account Lookup Automator'});

});

//Delete Account
router.post('/deleteAccount',function(req,res){
  console.log(req.body);
  res.send("Account Deleted From Database")
});


module.exports = router;
