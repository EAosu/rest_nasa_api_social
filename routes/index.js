var express = require('express');
var router = express.Router();

const messagesMap = new Map()
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
  if (messages===null || messages === undefined) { //index+3 > messages.length isnt logical
    console.log( `index is: ${index}`)
    res.status(350).send();
    return;
  }
  let toReturn = []

  for(let i=index; i< Math.min((index+3),messages.length); i++)
    if( messages[i] !== undefined )
      toReturn.push( messages[i])

  console.log(toReturn)//just a check
  res.json(toReturn);
});


router.post('/index/messages/:id/:msg', (req, res) => {
  // Get the message text from the request body
  console.log("here")
  const msg = req.body.msg;
  if(msg===undefined || msg === null || msg.length ===0)
     res.status(400).send({message : 'This comment is invalid! comment was not added to comment section'})
  const id = req.body.id
  console.log(msg + " " + id)
  insertMessage(id,msg)

  // Return a success response
//  res.json("Message added successfully")
  res.status(200).send({ message: 'Message added successfully' });

  //res.send('Message added successfully');
});

const insertMessage = (entry, message) => {
  const messages = messagesMap.get(entry)
  if(!messages)
    messagesMap.set(entry, [message])
  else
    messages.push(message)

  console.log(messagesMap.get(entry))
}


module.exports = router;
