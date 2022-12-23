var express = require('express');
var router = express.Router();

const messagesMap = new Map()

/* GET home page. */
router.get('/', function(req, res, next) {
  //here (I think) we need to develop routes of the api
  res.render('index', { title: 'Express' }); //file is index html ('index')
});



const insertMessage = (entry, message) => {
  let messages_array = messagesMap.entry
  if(messages_array === undefined)
    messagesMap.entry = [message]
  else
    messages_array.push(message)
}


module.exports = router;
