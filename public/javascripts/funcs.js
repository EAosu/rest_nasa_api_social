//Another div is added, need to remove current div with current data
//Also, all the data is displayed on a single div lmao
let batchSize = 3;
let displayIndex = 0
const idUpdateStamps = new Map()

const validateName = (event) => {
    event.preventDefault()
    name = document.getElementById("name").value.trim()

    if (name.length <= 24 && name.length > 0 && !(/\W/.test(name)))
        toggleHid("preLogin", "afterLogin", "invalidName")
    else
        document.getElementById("invalidName").removeAttribute("hidden")
}

const toggleHid = (...id) => {
    id.forEach(elem => {
        let element = document.getElementById(elem);
        let hidden = element.getAttribute("hidden");
        if (hidden)
            element.removeAttribute("hidden");
        else
            element.setAttribute("hidden", "hidden");
    })
}


const displayImagesFromURL = (event) => {
    event.preventDefault()
    let isValid = true
    let endDate = new Date(document.getElementById("endDate").value)
    fetch(getUrl(endDate))
        .then(response => {
            if (response.ok)
                document.getElementById("badRequest").setAttribute("hidden", "hidden")
            else
                isValid = false
            return response.json()
        })
        .then(function (response) {
                if(isValid) {
                    emptyInnerHTML("imagesList")
                    displayImagesBatch(response)
                    createScrollEvent(endDate)
                }
                else{
                    emptyInnerHTML("imagesList")
                    document.getElementById("badRequest").removeAttribute("hidden")
                    if(response.hasOwnProperty('msg'))
                        document.getElementById("errorcode").innerHTML = `Message from nasa api: <br> ${response.msg}`
                }
            }
        )
}
const createScrollEvent = (endDate) => {
    window.addEventListener("scroll", function (event) {
        event.preventDefault()
        //if communication is poor with api increase '2'
        const scrollY = window.scrollY + window.innerHeight + 2;
        const bodyScroll = document.body.offsetHeight;
        if (scrollY >= bodyScroll) {
            endDate.setDate(endDate.getDate() - batchSize)
            fetch(getUrl(endDate)).then(response =>
                response.json()).then(response => displayImagesBatch(response))
        }
    })
}

const emptyInnerHTML = (id) => {
    document.getElementById(id).innerHTML = "";
}

const displayNasaErr = (status) => {
    emptyInnerHTML("imagesList")
    document.getElementById("badRequest").removeAttribute("hidden")
    document.getElementById("errorcode").innerHTML = `Error ${status} from nasa API`
}

const getUrl = (currDate) => {
    let nasaApiUrl = "https://api.nasa.gov/planetary/apod?api_key=gqRjbR1ocVYMPviB9JoPqsVnLihxTOBKZLMGDdEm"
    let temp = new Date(currDate)
    temp.setDate(temp.getDate() - 2)
    return `${nasaApiUrl}&start_date=${toNasaFormat(temp)}&end_date=${toNasaFormat(currDate)}`//&end_date=${startDate + 3}
}

// Receives a date at format: mm/dd/yyyy returns a string with the format: yyyy-mm-dd
const toNasaFormat = (date) => {
    date = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    }).split('/')
    return `${date[2]}-${date[0]}-${date[1]}`
}

//Receives a data which is a json from nasa API that contains nasa api. displays a single batch
function displayImagesBatch(data) {
    let currBatch = document.createElement('div')
    for (let i = 0; i < batchSize; i++) {
        if(data[i] !== undefined && data[i]) //For tricky dates like 06/20/1995 in which nasa's response is inconsistent
        {
            let className = (displayIndex % 2 === 0) ? 'row rounded bg-success bg-opacity-25 mb-4' : 'row rounded bg-success bg-opacity-50 mb-4'
            let listItem = { row : appendMultiple(className, getMediaCol(data[i]), getImageInfo(data[i]), getMessagesCol(data[i]['date'])),
                item : createElement('li', 'list-group-item')}
            listItem.item.append(listItem.row)
            currBatch.prepend(listItem.row)
            displayIndex++
        }
    }
    document.getElementById("imagesList").append(currBatch)
}

const getMediaCol = (elem) => {
    let col = createElement('div', 'col-lg-3 col-md-6 col-sm-12 p-4')
    let row = createElement('div', 'row')
    if(elem && elem.hasOwnProperty('media_type'))
    {
        if(elem['media_type'] === 'image')
            row.append(getMediaElement(elem['url'],true))
        else if(elem['media_type'] === 'video')
            row.append(getMediaElement(elem['url'], false))
        col.append(row)
    }

    return col
}
const getMediaElement = (url, isImage) =>{
    let media = isImage ? createElement('img', 'img-thumbnail') : createElement('iframe', 'video')
    isImage ? media.setAttribute('data-image', url) : media.setAttribute('data-video', url)
    media.src = url
    media.style.maxHeight = "400px";
    media.style.maxWidth = "400px";
    if(isImage){
        media.addEventListener('click', function () {
            document.getElementById('modalImage').src = media.src
            document.getElementById('modalImage').style.cursor = "default"
            document.getElementById("modalBtn").click()
        })
    }
    return media
}
const getImageElement = (elem) => {
    let img = createElement('img', 'img-thumbnail')
    img.setAttribute('data-image', elem['url'])
    img.src = `${elem['url']}`
    img.style.maxHeight = "400px";
    img.style.maxWidth = "400px";
    img.addEventListener('click', function () {
        document.getElementById('modalImage').src = img.src
        document.getElementById('modalImage').style.cursor = "default"
        document.getElementById("modalBtn").click()
    })

    return img
}

const getImageInfo = (elem) => {
    let col = createElement('div', 'col-lg-5 col-md-6 col-sm-12')
    let descriptionRow = getDescriptionRow(elem)
    col.append(descriptionRow)

    return col
}

const getDescriptionRow = (elem) => {
//('row bg-danger bg-opacity-25 my-3')
    let paragraphs = getDescription(elem)
    let descCol = appendMultiple('row bg-dark text-white bg-opacity-50 my-3 ', paragraphs.date, paragraphs.header, paragraphs.explanation)
    //let descCol = appendMultiple('row',paragraphs.explanation)
    let hideDescriptionBtn = getHideButton(paragraphs.explanation)
    descCol.append(hideDescriptionBtn, paragraphs.copyright)

    return descCol
}

const getHideButton = (paragraphs) => {
    let hideButton = createElement('button', 'btn ', "Show more")
    hideButton.style.backgroundColor = "#bc9753"
    hideButton.style.marginBottom = "30px"
    hideButton.addEventListener('click', function (event) {
        event.preventDefault()
        changeDisplay(hideButton, paragraphs)
    })

    return hideButton
}

const getMessagesCol = (id) => {
    let messagesCol = createElement('div', 'col-lg-4 col-md-12 p-2')
    idUpdateStamps.set(id, 0)
    messagesCol.append(createCommentSection( id))
    loadComments(id)
    idUpdateStamps.set(id, Date.now())
    setMessagesTimer(id)
    messagesCol.append(createMsgArea(id, messagesCol))

    return messagesCol
}

const setMessagesTimer = (id) => {
    setInterval(function () {
        loadComments(id)
        idUpdateStamps.set(id, Date.now())
    }, 15000)
}

const createMsgArea = (id) => {
    let message = ""


    let messageBox = getTextArea(id, 5, 33, false, "What's on your mind? (up to 128 characters)")
    let errorDisplay = createElement('div','btn btn-danger disabled')
    errorDisplay.id = `errorBtn${id}`
    errorDisplay.setAttribute('hidden','hidden')
    messageBox.addEventListener('input', function (event) {message = event.target.value })

    //----------------------------------
    let addMessageBtn = createElement('button', 'btn btn-secondary', 'Add message')
    addMessageBtn.id = `button${id}`
    addMessageBtn.addEventListener('click', function () {
        let username = document.getElementById("name").value
        if (message.trim().length > 0 || true) {
            errorDisplay.setAttribute('hidden','hidden')
            postComment(id, message, username, errorDisplay)
            message = ""
            document.getElementById(`textBox${id}`).value = ""
        }
        else
            displayResponse(errorDisplay,'Comments contains spaces only')
    });
    let addMessageCol = appendMultiple('col-4', addMessageBtn)
    let displayErrorCol = appendMultiple('col-8', errorDisplay)
    displayErrorCol.append(errorDisplay)
    let row = appendMultiple('row',addMessageCol, displayErrorCol)
    return appendMultiple('div', messageBox, row);
}
const displayResponse = (infoBtn,message, isValid=false) => {
    infoBtn.innerHTML = message
    infoBtn.className = isValid ? 'btn btn-success' : 'btn btn-danger'
    infoBtn.removeAttribute('hidden')
    setTimeout(function() {infoBtn.setAttribute('hidden','hidden')}, 3000)

}


const postComment = (id, message, username, errorDisplay) => {
    let isValid = true
    fetch(`/index/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({id: id, message: message, username: username})
    })
        .then(function (response) {
            if (response.ok)
                return response.json()
            else //Displaying the error message
            {
                isValid = false
                return response.json()
            }
        })
        .then(response => {
            if(isValid)
                loadComments(id)
            displayResponse(errorDisplay,response.message,isValid)
        })
}

let createCommentSection = (id) => {
    let messagesList = createElement('div', 'list-group overflow-auto')
    messagesList.id = id
    messagesList.style.maxHeight = "200px"
    messagesList.style.height = "200px"
    messagesList.style.backgroundColor = "#7f8c8d";
    return messagesList
}

let displayComments = (comments, id) => {
    let messagesList = document.getElementById(id)
    if (comments !== null)
    {
        emptyInnerHTML(id)
        messagesList.append(comments)
    }
}

/**
 * @param imgDate - the date of the image
 * @returns {*} - returns ely's mother on a pizza plate
 */
function loadComments(imgDate) {
    let timer = idUpdateStamps.get(imgDate)
    fetch(`/index/messages/${imgDate}/${timer}`)
        .then(function (response) {
            //Checking the status of what the server returned.
            if (response.ok)
                return response.json()
            else if (response.status === 300 || response.status === 325)//No messages
                return null
            else
                throw new Error("Unexpected error from server")
        })
        .then(messages => {
            if(messages)
                updateComments(imgDate, messages)
        })
        .catch(error => {
            if (error === "No new messages")
                return null;
            console.log(error);
        });
}

const updateComments = (id, messages) => {
    let comments = createElement('div')
    idUpdateStamps.set(id, Date.now())
    for (let i = 0; i < messages.length; i++)
        comments.append(makeMessageGrid(messages[i], id,i))

    displayComments(comments,id)
}

const makeMessageGrid = (message, id, index) => {
    let listItem = {
        item : createElement('li', 'list-group-item'),
        row : createElement('div', 'row')
    }
    listItem.item.style.backgroundColor = "#a5b15e"
    let secondRow = appendMultiple("row", createElement('p', '', message.message))
    let areaForUsername = appendMultiple("col-10", createElement('h5', '', message.username))
    listItem.row.append(areaForUsername)
    if (message.username === document.getElementById("name").value) {
        let deleteBtn = createElement('button', "btn btn-outline-danger", 'x')
        deleteBtn.addEventListener('click', function () { deleteComment(id, index) })
        let areaForDelete = appendMultiple("col-2", deleteBtn)
        listItem.row.append(areaForDelete)
    }
    listItem.item.append(listItem.row)
    listItem.item.append(secondRow)
    return listItem.item
}

const deleteComment = (id, index) => {
    let displayBtn = document.getElementById(`errorBtn${id}`)
    let isValid = true
    fetch(`/index/deleteMessage`, {
        method: 'DELETE',
        body: JSON.stringify({ id : id, index : index }),
        headers: {
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok)
            isValid = false
        return response.json()
    }).then((response) => {
        if(isValid)
            loadComments(id)
        displayResponse(displayBtn, response.message,isValid)
    })
}

const getTextArea = (id, rowsLength, colsLength, readOnly, placeHolder = "") => {
    let textBox = createElement('textarea', 'form-control')
    textBox.id = `textBox${id}`
    textBox.maxLength = 128
    let div = createElement("div", "form-group")
    div.append(textBox)
    textBox.placeholder = placeHolder
    textBox.readOnly = readOnly
    return div
}

const changeDisplay = (button, ...paragraphs) => {
    paragraphs.forEach(paragraph => {
        if (paragraph.getAttribute('hidden') === null)
            paragraph.setAttribute('hidden', 'hidden')
        else
            paragraph.removeAttribute('hidden')
    })
    if (button.innerHTML === "Show less")
        button.innerHTML = "Show more"
    else
        button.innerHTML = "Show less"
}


const appendMultiple = (className, ...data) => {
    let div = createElement('div', className)
    data.forEach(elem => {
        div.append(elem)
    })
    return div
}

const getDescription = (elem) => {

    let paragraphs = {
        date: document.createElement('p'),
        header: document.createElement('h5'),
        explanation: createElement('div', 'scroll'),
        copyright: document.createElement('p')
    }
    paragraphs.date.innerHTML = elem.hasOwnProperty('Date') ? `Date: ${elem['date']}` : ''
    paragraphs.header.innerHTML = `${elem['title']}`
    paragraphs.explanation.innerHTML = `${elem['explanation']}`
    paragraphs.explanation.setAttribute('hidden', 'hidden')
    paragraphs.explanation.style.maxHeight = "300px"
    paragraphs.explanation.style.overflowY = "scroll"
    paragraphs.copyright.innerHTML = elem['copyright'] !== undefined ? `Copyright: ${elem['copyright']}` : "Copyright: Unknown"
    return paragraphs
}


const createElement = (tagName, classname = "", innerHtml = "") => {
    let elem = document.createElement(tagName)
    elem.className = classname
    elem.innerHTML = innerHtml
    return elem
}

const getToday = () => {
    let today = new Date()
    let dd = String(today.getDate()).padStart(2, '0')
    let mm = String(today.getMonth() + 1).padStart(2, '0') //January is 0!
    let yyyy = today.getFullYear()
    today = yyyy + '-' + mm + '-' + dd
    return today
}

document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("endDate").value = getToday()
    document.getElementById("nameInsertion").addEventListener("submit", validateName);
    document.getElementById("ajaxformget").addEventListener("submit", displayImagesFromURL);
});