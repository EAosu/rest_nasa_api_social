/** Database for the messages on the images. */
module.exports = (function() {
    // The data structure is a map in which the key is the post
    // date of the image and the value is an object which consists
    // of the timestamp of the last update (delete/add of a message)
    // and the message content which is an object which consists of
    // the username and the message's text.
    const messagesMap = new Map()

    /**
     * Function to insert new messages to the map.
     * @param entry - date of the image.
     * @param username - username of the person who whishes to insert.
     * @param message - the message content.
     */
    function insertMessage(entry,username, message) {
        const messages = messagesMap.get(entry)
        if(!messages)
            messagesMap.set(entry, {
                timestamp : Date.now(),
                content : [{username: username, message : message}]
            })
        else
        {
            messages.content.push({username: username, message : message})
            messages.timestamp = Date.now()
        }
    }
    /***
     * Function to delete a message from the map.
     * @param id - key of the image.
     * @param index - comment index.
     */
    function deleteMessage(id, index) {
        let messages = messagesMap.get(id)
        messages.timestamp = Date.now()
        messages.content.splice(index,1) //removing the index place
    }
    /***
     * Function to check if an ID (date) exists in the map.
     * @param id - date of the image.
     * @returns {boolean} - exists/doesn't exist.
     */
    function checkID(id) { return messagesMap.has(id) }

    // Public API
    return {
        insertMessage : insertMessage,
        deleteMessage : deleteMessage,
        checkID : checkID,
        getMessages: (id) => messagesMap.get(id)
    }
})();