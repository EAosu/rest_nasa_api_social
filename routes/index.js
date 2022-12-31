var express = require('express');
var router = express.Router();

const messagesMap = new Map()
/* GET home page. */

router.get('/', function(req, res) { //I removed the parameter called next (next func)

  res.render('index', { title: 'Express' }); //file is index html ('index')
});


router.get('/index/messages/:id/:timestamp', (req, res) => {
  // Get the message ID from the request parameters
  const id = req.params.id
  const timestamp = req.params.timestamp
  console.log(validateMessage(id) + ` ` + messagesMap.has(id))
  if (validateID(id) && messagesMap.has(id) && (timestamp >=0)) {
    //Find the message with the specified ID
    const messages = messagesMap.get(id)
    const timePassed = timestamp - messages.timestamp
    if(timePassed <= 3000)
      res.json(messages.content)
    else
      res.status(225).send({message : 'No changes were made, you are up to date!.'})
  }
  else if(!messagesMap.has(id))
    res.status(250).send({message : 'There are no messages on this image id'})
  else
    res.status(400).send({message:'an unexpected error'})
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


router.delete('/index/deleteMessage', (req, res) => {
  let username = req.body.username
  const time = new Date()
  let id = req.body.imgId
  let index = req.body.commentIndex
  if(validateID(id) && index >=0 )//validateName(username)
  {
    let messages = messagesMap.get(id)
    messages.timestamp = time.getTime()
    messages.content.splice(index,1) //removing the index place
    res.status(200).send({message: `Message removed successfully`})
  }
  else
    res.status(400).send({message:`Oops.. seems like request is invalid!`})

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
