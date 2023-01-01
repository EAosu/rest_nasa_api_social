module.exports = (function() {
    const messagesMap = new Map()

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

    function deleteMessage(id, index) {
        let messages = messagesMap.get(id)
        messages.timestamp = Date.now()
        messages.content.splice(index,1) //removing the index place
    }

    function checkID(id) { return messagesMap.has(id) }

    // Public API
    return {
        insertMessage : insertMessage,
        deleteMessage : deleteMessage,
        checkID : checkID,
        getMessages: (id) => messagesMap.get(id)
    }
})();