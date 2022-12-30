var express = require('express');
var router = express.Router();

const messagesMap = new Map()
/* GET home page. */

router.get('/', function(req, res) { //I removed the parameter called next (next func)

  res.render('index', { title: 'Express' }); //file is index html ('index')
});


router.get('/index/messages/:id', (req, res) => {
  // Get the message ID from the request parameters
  const id = req.params.id
  const timer = new Date()

  if (validateID(id) && messagesMap.has(id)) {
    //Find the message with the specified ID
    const messages = messagesMap.get(id)
    const timePassed = timer.getTime() - messages.timestamp
    if(timePassed >= 3000)
      res.json(messages.content)
    else
      res.status(350).send({message : 'No changes were made.'})
  }
  else
    res.status(400).send({message : 'Message was not found.'})
});


router.post('/index/messages', (req, res) => {
  // Get the message text from the request body

  const msg = req.body.message;
  const id = req.body.id
  const username = req.body.username

  if(!validateMessage(msg))
    res.status(400).send({message : 'This comment is invalid! Comment was unsuccessfully added.'})
  else if(!validateID(id))
    res.status(400).send({message : 'The date is not in the correct format (YYYY-MM-DD).'})

  insertMessage(id,username,msg)

  // Return a success response
  res.status(200).send({ message: 'Message added successfully' });
});

// Deleting a resource
router.delete('/resources/:id', (req, res) => {
  // If resource not found, return 404, otherwise delete it

  // and return the deleted object or some value to confirm deletion
  // we could also return a 204 status code
  res.send(req.params.id);
});

const insertMessage = (entry,username, message) => {
  const messages = messagesMap.get(entry)
  const timer = new Date()

  if(!messages)
    messagesMap.set(entry, {
      timestamp : timer.getTime(),
      content : [{username: username, message : message}]
    })
  else
  {
    messages.content.push({username: username, message : message})
    messages.timestamp = timer.getTime()
  }
}

const validateMessage = (message) => {
  return (message!==undefined && message !== null && message.length !==0)
}

const validateID = (id) => {
  // NASA date format: YYYY-MM-DD
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  return regex.test(id);
}

module.exports = router;
