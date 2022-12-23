var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
  //here (I think) we need to develop routes of the api
  res.render('index', { title: 'Express' }); //file is index html ('index')
});

router.get('/allImages')

router.get('/')


module.exports = router;
