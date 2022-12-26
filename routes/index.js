var express = require('express');
var router = express.Router();

const messagesMap = new Map()
const msgArray = ['hello','world','im','lookin','4','solutions','to','the','global','warming','problem']
messagesMap.set('12',msgArray)
/* GET home page. */

router.get('/', function(req, res) { //I removed the parameter called next (next func)

  res.render('index', { title: 'Express' }); //file is index html ('index')
});


router.get('/index/messages/:id/:index', (req, res) => {
  // Get the message ID from the request parameters
  const id = req.params.id;
  const index = req.params.index
   //Find the message with the specified ID
  const messages = messagesMap.get(id)
  // If the message was not found, return a 404 status code
  if (messages===null) { //index+3 > messages.length isnt logical
    console.log( `index is: ${index}`)
    res.status(450).send('Message not found' + `index is: ${index}`);
    return;
  }
  let toReturn = []
  for(let i=index; (i<index+3&& i<messages.length); i++)
    if( messages[i] !== undefined )
      toReturn.push( messages[i])

  console.log(toReturn)
  res.json(toReturn);
});


router.post('/index/messages', (req, res) => {
  // Get the message text from the request body
  const text = req.body.text;
  const id = req.body.id
  insertMessage(id,text)

  // Return a success response
  res.send('Message added successfully');
});

const insertMessage = (entry, message) => {
  const messages = messagesMap.get(entry)
  if(!messages)
    messagesMap.set(entry, [message])
  else
    messages.push(message)
}


module.exports = router;
