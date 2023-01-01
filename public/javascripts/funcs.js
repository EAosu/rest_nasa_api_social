//Another div is added, need to remove current div with current data
//Also, all the data is displayed on a single div lmao
let endDate = new Date()
let batchSize = 3;
let displayIndex = 0
const defaultStartDate = new Date("1995-06-16") // This is an hardcoded  and we have to remove it.
const idUpdateStamps = new Map()
const validateName = (event) => {
    event.preventDefault()
    name = document.getElementById("name").value.trim()

    if (name.length <= 24 && name.length > 0 && !(/\W/.test(name)))
        toggleHid("preLogin","afterLogin","invalidName")
    else
        document.getElementById("invalidName").removeAttribute("hidden")
}

let toggleHid = (...id) => {
    id.forEach(elem => {
        let element = document.getElementById(elem);
        let hidden = element.getAttribute("hidden");
        if (hidden)
            element.removeAttribute("hidden");
        else
            element.setAttribute("hidden", "hidden");
    })
}


function displayImagesFromURL(event) {
    event.preventDefault()

    endDate = new Date(document.getElementById("endDate").value)
    fetch(getUrl(endDate))
        .then(response => {
            if (response.ok) {
                document.getElementById("badRequest").setAttribute("hidden", "hidden")
                return response.json()
            } else if (300 <= response.status <= 500) {
                document.getElementById("imagesList").innerHTML = ''
                document.getElementById("badRequest").removeAttribute("hidden")
                document.getElementById("errorcode").innerHTML = `Error ${response.status} from nasa API`
                return null;
            }

        })
        .then(function (data) {
                if (data === null)
                    return;
                document.getElementById("imagesList").innerHTML = "";
                displayImagesBatch(data)
                //I didnt use document in purpose
                window.addEventListener("scroll", function (event) {
                    event.preventDefault()

                    const scrollY = window.scrollY + window.innerHeight + 2;//if communication is poor with api increase '2'
                    const bodyScroll = document.body.offsetHeight;
                    if (scrollY >= bodyScroll && endDate >= defaultStartDate) {
                        endDate.setDate(endDate.getDate() - batchSize)
                        fetch(getUrl(endDate)).then(response =>
                            response.json()).then(response => displayImagesBatch(response))
                    }
                })
            }
        )
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
    let listItem
    for (let i = 0; i < batchSize; i++) {
        if (displayIndex % 2 === 0) {
            listItem = initListItem('row rounded bg-success bg-opacity-25 mb-4')
            //listItem.item.style.backgroundColor = "#2de2ba"
        } else {
            listItem = initListItem('row rounded bg-success bg-opacity-50 mb-4')
            //listItem.item.style.backgroundColor = "#6aa56b"
        }

        listItem.row.append(getImageCol(data[i]))
        listItem.row.append(getImageInfo(data[i]))
        listItem.row.append(getMessagesCol(data[i]['date']))
        listItem.item.append(listItem.row)
        currBatch.prepend(listItem.row)
        displayIndex++
    }

    document.getElementById("imagesList").append(currBatch)
}

const initListItem = (cname = "row") => {
    let item = createElement('li', 'list-group-item')
    let row = createElement('div', cname)
    return {item, row}
}

const getImageCol = (elem) => {
    let imageCol = createElement('div', 'col-lg-3 col-md-6 col-sm-12 p-4')
    let imgRow = createElement('div', 'row')
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
    imgRow.append(img)
    imageCol.append(imgRow)

    return imageCol
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
    let hideDescriptionBtn = createElement('button', 'btn ', "Show more")
    hideDescriptionBtn.style.backgroundColor = "#bc9753"
    hideDescriptionBtn.style.marginBottom = "30px"
    hideDescriptionBtn.addEventListener('click', function (event) {
        event.preventDefault()
        changeDisplay(hideDescriptionBtn, paragraphs.explanation)
    })
    descCol.append(hideDescriptionBtn, paragraphs.copyright)

    return descCol
}
const getMessagesCol = (id) => {
    let messagesCol = createElement('div', 'col-lg-4 col-md-12 p-2')
    //let firstRow = createElement('div','row') THIS WILL BE USED I'M JUST REMOVING WARNINGS
    idUpdateStamps.set(id, 0)
    messagesCol.append(createCommentSection( id))
    loadComments(id)
    idUpdateStamps.set(id, Date.now())


    setMessagesTimer(id, messagesCol)

    messagesCol.append(createMsgArea(id, messagesCol))

    return messagesCol
}
const setMessagesTimer = (id, messagesCol) => {
    setInterval(function () {
        loadComments(id)
        idUpdateStamps.set(id, Date.now())
    }, 15000)
}


const createMsgArea = (id, msgsCol) => {
    let msg = ""

    //----------------------------------
    let messageBox = getTextArea(id, 5, 33, false, "What's on your mind? (up to 256 characters)")
    messageBox.addEventListener('input', function (event) {
        msg = event.target.value
    })
    //----------------------------------
    let addMessageBtn = createElement('button', 'btn btn-secondary', 'Add message')
    addMessageBtn.id = `button${id}`
    addMessageBtn.addEventListener('click', function (event) {
        let username = document.getElementById("name").value

        if (msg.length !== 0)
            fetch(`/index/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id: id, message: msg, username: username})
            })
                .then(function (response) {
                    document.getElementById(`textBox${id}`).value = ``
                    msg = ""
                    if (response.ok)
                        return response.json()
                    else {//handle errors, couldn't add the message
                        console.log(response.message)
                    }
                })
                .then(response => {
                    loadComments(id)
                    return response
                })

    });
    return appendMultiple('div', messageBox, addMessageBtn);
}
let createCommentSection = (id) => {
    let messagesList = createElement('div', 'list-group overflow-auto')
    messagesList.id = id
    messagesList.style.maxHeight = "200px"
    messagesList.style.height = "200px"
    messagesList.style.backgroundColor = "#7f8c8d";
    return messagesList
}

let displayComments = (comments, id, inInterval = false) => {
    let messagesList = document.getElementById(id)
    console.log(comments)
    if (comments !== null) {
        messagesList.innerHTML = ''
    }
    if (comments !== null)
        messagesList.append(comments)
}

/**
 * @param imgDate - the date of the image
 * @returns {*} - returns ely's mother on a pizza plate
 */
function loadComments(imgDate) {

    let timer = idUpdateStamps.get(imgDate)
    //if(document.getElementById(imgDate))
    // document.getElementById(imgDate).innerHTML = ''
    fetch(`/index/messages/${imgDate}/${timer}`)
        .then(function (response) {
            if (response.ok)//Checking the status of what the server returned.
                return response.json()
            else if (response.status === 300 || response.status === 325)//No messages
                return null
            else
                throw new Error("Unexpected error from server")
        })
        .then(messages => {
            //console.log(messages)
            if(messages){
                let comments = createElement('div')
                idUpdateStamps.set(imgDate, Date.now())
                for (let i = 0; i < messages.length; i++)
                    comments.append(makeMessageGrid(messages[i], imgDate,i))

                displayComments(comments,imgDate,false)
            }
        })
        .catch(error => {
            if (error === "No new messages")
                return null;
            console.log(error);
        });

}

const makeMessageGrid = (message, id,index) => {
    let curr = document.getElementById(id)

    let commentIndex = index
    let username = document.getElementById("name").value
    let listItem = initListItem(`row`)
    listItem.item.style.backgroundColor = "#a5b15e"

    let secondRow = createElement('div', 'row')
    secondRow.append(createElement('p', '', message.message))

    let areaForUsername = createElement('div', 'col-10')
    areaForUsername.append(createElement('h5', '', message.username))
    listItem.row.append(areaForUsername)
    if (message.username === document.getElementById("name").value) {
        let areaForDelete = createElement('div', 'col-2')
        let deleteBtn = createElement('button', "btn btn-outline-danger", 'x')
        deleteBtn.addEventListener('click', function (event) {
            fetch(`/index/deleteMessage`, {
                method: 'DELETE',
                body: JSON.stringify({imgId: id, username: username, commentIndex: commentIndex}),
                headers: {
                    'Content-Type': 'application/json'
                }
            }).then(response => {
                if (response.ok)
                    return response.json()
                else
                    throw new Error("That's unfortunate! try again ;) ")
            }).then(response => {
                loadComments(id)
            })
        })
        areaForDelete.append(deleteBtn)
        listItem.row.append(areaForDelete)
    }
    listItem.item.append(listItem.row)
    listItem.item.append(secondRow)
    return listItem.item
}


const getTextArea = (id, rowsLength, colsLength, readOnly, placeHolder = "") => {
    let textBox = createElement('textarea', 'form-control')
    textBox.id = `textBox${id}`
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
    paragraphs.date.innerHTML = `Date: ${elem['date']}`
    paragraphs.header.innerHTML = `${elem['title']}`
    paragraphs.explanation.innerHTML = `${elem['explanation']}`
    paragraphs.explanation.setAttribute('hidden', 'hidden')
    paragraphs.explanation.style.maxHeight = "300px"
    paragraphs.explanation.style.overflowY = "scroll"
    paragraphs.copyright.innerHTML = elem['copyright'] !== undefined ? `Copyright: ${elem['copyright']}` : ""
    return paragraphs
}


const createElement = (tagName, classname = "", innerHtml = "") => {
    let elem = document.createElement(tagName)
    elem.className = classname
    elem.innerHTML = innerHtml
    return elem
}


document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("nameInsertion").addEventListener("submit", validateName);
    document.getElementById("ajaxformget").addEventListener("submit", displayImagesFromURL);
});