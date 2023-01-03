/** Server side. */
(function () {
    /** Requests. */
    (function requests() {
        const express = require('express') // Express object.
        const router = express.Router() // Router.
        const db = require('../models/messagesmap') // Database.

        /* GET home page. */
        router.get('/', function (req, res) {
            res.render('index', {title: 'Express'})
        });
        /* GET messages. */
        router.get('/index/messages/:id/:timestamp', (req, res) => {
            const validators = validationBundle.getAndDeleteValidation
            // Get the message ID and timestamp from the request parameters
            const id = req.params.id
            const timestamp = req.params.timestamp
            if (validators.validateID(id) && db.checkID(id) && validators.validatePositive(timestamp)) {
                //Find the message with the specified ID
                const messages = db.getMessages(id)
                if (messages.timestamp > timestamp)
                    res.json(messages.content)
                else
                    res.status(300).send({message: 'No changes were made, you are up to date!'})
            } else if (!db.checkID(id))
                res.status(325).send({message: 'There are no messages on this image id.'})
            else
                res.status(400).send({message: 'An unexpected error.'})
        });
        /* POST message. */
        router.post('/index/messages', (req, res) => {
            const validators = validationBundle.postValidation
            // Get the message text, id and username from the request body
            const message = req.body.message
            const id = req.body.id
            const username = req.body.username
            if (!validators.validateMessage(message))
                res.status(400).send({message: 'Comment contains spaces only'})
            else if (!validators.validateID(id))
                res.status(400).send({message: 'Invalid date format (YYYY-MM-DD).'})
            else if (!validators.validateUsername(username))
                res.status(400).send({message: 'Invalid username.'})
            else {
                // Return a success response
                db.insertMessage(id, username, message)
                res.status(200).send({message: 'Message added successfully.'})
            }
        });
        /* DELETE message. */
        router.delete('/index/deleteMessage', (req, res) => {
            const validators = validationBundle.getAndDeleteValidation
            let id = req.body.id
            let index = req.body.index
            if (validators.validateID(id) && validators.validatePositive(index)) {
                db.deleteMessage(id, index)
                res.status(200).send({message: `Message removed successfully`})
            } else
                res.status(400).send({message: `Oops... seems like request is invalid!`})
        });

        module.exports = router;
    })();

    /** Validation Management. */
    let validationBundle = {};
    (function validationFunctions(validation) {
        const validateMessage = (message) => {
            return (message !== undefined && message !== null && (0 < message.trim().length <= 128) && (message.trim()))
        }
        const validateID = (id) => {
            // NASA date format: YYYY-MM-DD
            const regex = /^\d{4}-\d{2}-\d{2}$/;
            return regex.test(id);
        }

        const validateUsername = (username) =>
            (username.length <= 24 && username.length > 0 && !(/\W/.test(username)))

        const validatePositive = (num) => (num >= 0)

        validation.postValidation = {validateID, validateMessage, validateUsername};
        validation.getAndDeleteValidation = {validateID, validatePositive};

    }(validationBundle));
})();