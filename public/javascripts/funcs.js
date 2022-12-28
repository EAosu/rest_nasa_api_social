let endDate = new Date()
let batchSize = 3;
let displayIndex =0
const defaultStartDate = new Date("1995-06-16")
const validateName = (event) =>{
    event.preventDefault()
    name = document.getElementById("name").value.trim()

    if(name.length <= 24 && name.length > 0 && !(/\W/.test(name))){
        document.getElementById("preLogin").setAttribute("hidden","hidden")
        document.getElementById("afterLogin").removeAttribute("hidden")
        document.getElementById("invalidName").setAttribute("hidden","hidden")
    }
    else
        document.getElementById("invalidName").removeAttribute("hidden")
}

function displayImagesFromURL(event) {
    event.preventDefault()

    endDate = new Date(document.getElementById("endDate").value)
    // Fetch the JSON from the given URL
    fetch(getUrl(endDate)).then(response => response.json()).then(function(data){
        //currentIndex = 0 //since its global and we made a new request
        document.getElementById("imagesList").innerHTML = "";
        displayImagesBatch(data)
        //I didnt use document in purpose
        window.addEventListener("scroll", function(event){
            event.preventDefault()

            const scrollY = window.scrollY + window.innerHeight + 2;//if communication is poor with api increase '2'
            const bodyScroll = document.body.offsetHeight;
            if(scrollY >= bodyScroll && endDate >= defaultStartDate){
                endDate.setDate(endDate.getDate()-batchSize)
                fetch(getUrl(endDate)).then(response =>
                    response.json()).then(response=>displayImagesBatch(response))
            }
        })
        }
     )
}

const getUrl = (currDate) => {
    let nasaApiUrl = "https://api.nasa.gov/planetary/apod?api_key=gqRjbR1ocVYMPviB9JoPqsVnLihxTOBKZLMGDdEm"
    let temp = new Date(currDate)
    temp.setDate(temp.getDate()-2)
    return `${nasaApiUrl}&start_date=${toNasaFormat(temp)}&end_date=${toNasaFormat(currDate)}`//&end_date=${startDate + 3}
}

// Receives a date at format: mm/dd/yyyy returns a string with the format: yyyy-mm-dd
const toNasaFormat = (date) => {
    date =  date.toLocaleDateString('en-US', {
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
    for(let i=0; i<batchSize; i++) {
        if(displayIndex%2===0)
            listItem = initListItem('row bg-success bg-opacity-25 mb-4')
        else
            listItem = initListItem('row bg-danger bg-opacity-25 mb-4')
        listItem.row.append(getImageCol(data[i]))
        listItem.row.append(getImageInfo(data[i]))
        listItem.row.append(getMessagesCol(data[i]['date']))
        listItem.item.append(listItem.row)
        currBatch.prepend(listItem.row)
        displayIndex ++
    }

    document.getElementById("imagesList").append(currBatch)
}
const initListItem = (cname="row") => {
    let item = createElement('li','list-group-item')
    let row = createElement('div',cname)
    return {item, row}
}

const getImageCol = (elem) => {
    let imageCol = createElement('div','col-lg-3 col-md-6 col-sm-12 p-4')
    let imgRow = createElement('div','row')
    let img = createElement('img','img-thumbnail')
    img.setAttribute('data-image',elem['url'])
    img.src = `${elem['url']}`
    img.style.maxHeight = "400px";
    img.style.maxWidth = "400px";
    img.addEventListener('click', function(){
        document.getElementById('modalImage').src = img.src
        document.getElementById('modalImage').style.cursor = "default"
        document.getElementById("modalBtn").click()
    })
    imgRow.append(img)
    imageCol.append(imgRow)

    return imageCol
}
const getImageInfo = (elem) => {
    let col = createElement('div','col-lg-5 col-md-6 col-sm-12')
    let descriptionRow = getDescriptionRow(elem)

    col.append(descriptionRow)

    return col
}

const getDescriptionRow = (elem) => {
//('row bg-danger bg-opacity-25 my-3')
    let paragraphs = getDescription(elem)
    let descCol= appendMultiple('row bg-dark text-white bg-opacity-50 my-3 ',paragraphs.date,paragraphs.header,paragraphs.explanation)
    //let descCol = appendMultiple('row',paragraphs.explanation)
    let hideDescriptionBtn = createElement('button', 'btn btn-info bg-opacity-50 ',"Show more")
    hideDescriptionBtn.style.marginBottom="30px"
    hideDescriptionBtn.addEventListener('click', function (event) {
        event.preventDefault()
        changeDisplay(hideDescriptionBtn,paragraphs.explanation)
    })
    descCol.append(hideDescriptionBtn,paragraphs.copyright)

    return descCol
}
const getMessagesCol = (id) => {
    let messagesCol = createElement('div','col-lg-4 col-md-12 p-2')
    //let firstRow = createElement('div','row') THIS WILL BE USED I'M JUST REMOVING WARNINGS

    let index = 0
    let toDisplay = (displayComments((loadComments(id,index)),id))
    if(toDisplay !== -1)
        messagesCol.append(toDisplay)
    let loadMoreBtn = createElement('button',`btn btn-primary ${id}`,'Show more comments')
    loadMoreBtn.addEventListener('click',function(){
        index += batchSize
        let toDisplay = displayComments(loadComments(id, index),id)
        if(toDisplay !== -1)
            messagesCol.append(toDisplay)
    })

    messagesCol.append(createMsgArea(id))
    messagesCol.append(loadMoreBtn)
    return messagesCol
}

const createMsgArea = (id) => {
    let msg = ""
    //----------------------------------
    let messageBox = getTextArea(5,33,false,"What's on your mind? (up to 256 characters)")
    messageBox.addEventListener('input', function(event){
        msg = event.target.value
    })

    //----------------------------------
    let addMessageBtn = createElement('button','btn btn-secondary','Add message')
    addMessageBtn.id = `button${id}`
    addMessageBtn.addEventListener('click', function(event) {
        fetch(`/index/messages/${id}/${msg}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({id, msg})
        })
            .then(response => response.json())
            .then(response => {
                console.log(response)
                return response
            })
    });
    return appendMultiple('row' ,messageBox, addMessageBtn);
}

let displayComments = (comments,id) =>{

    let messagesList = document.getElementById(id)
    if(messagesList === null || messagesList === undefined)
    {
        console.log(id)
        messagesList  = createElement('div','list-group overflow-auto')
        messagesList.id = id
        messagesList.style.maxHeight = "200px"
        messagesList.style.height = "200px"
        messagesList.style.backgroundColor = "#7f8c8d";
        messagesList.append(comments)
        return messagesList
    }
    messagesList.append(comments)
    return -1 //flag
}

function loadComments(imgDate, commentIndex) {
    let comments = createElement('div')

  fetch(`/index/messages/${imgDate}/${commentIndex}`)
        .then(response => response.json())
        .then(message => {
            for(let i=0; i<batchSize; i++){
                let listItem = initListItem('row')
                listItem.row.innerHTML = message[i]
                listItem.item.style.backgroundColor = "#3498db"
                listItem.item.append(listItem.row)
                if(listItem.row.innerHTML !== 'undefined')
                    comments.append(listItem.item)
            }
            return comments
        })
        .catch(error => {
            console.log(commentIndex);
            console.error(error)

        });

    return comments
}

const getTextArea = (rowsLength, colsLength, readOnly,placeHolder = "")=>{
    let textBox = createElement('textarea','form-control')
    let div = createElement("div","form-group")
    div.append(textBox)
    textBox.placeholder = placeHolder
    textBox.readOnly = readOnly
    return div
}

const changeDisplay = (button,...paragraphs)=>{
    paragraphs.forEach(paragraph => {
        if(paragraph.getAttribute('hidden') === null)
            paragraph.setAttribute('hidden','hidden')
        else
            paragraph.removeAttribute('hidden')
    })
    if(button.innerHTML === "Show less")
        button.innerHTML = "Show more"
    else
        button.innerHTML = "Show less"
}


const appendMultiple = (className,...data) =>{
    let div = createElement('div',className)
    data.forEach(elem =>{
        div.append(elem)
    })
    return div
}

const getDescription = (elem)=>{
    let paragraphs = {
        date :   document.createElement('p'),
        header : document.createElement('h5'),
        explanation :   createElement('div','scroll'),
        copyright : document.createElement('p')
    }
    paragraphs.date.innerHTML = `Date: ${elem['date']}`
    paragraphs.header.innerHTML = `${elem['title']}`
    paragraphs.explanation.innerHTML = `${elem['explanation']}`
    paragraphs.explanation.setAttribute('hidden','hidden')
    paragraphs.explanation.style.maxHeight = "300px"
    paragraphs.explanation.style.overflowY = "scroll"
    paragraphs.copyright.innerHTML =  elem['copyright'] !== undefined ? `Copyright: ${elem['copyright']}` : ""
    return paragraphs
}


const createElement = (tagName, classname="",innerHtml="") =>{
    let elem = document.createElement(tagName)
    elem.className = classname
    elem.innerHTML = innerHtml
    return elem
}



document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("nameInsertion").addEventListener("submit", validateName);
    document.getElementById("ajaxformget").addEventListener("submit", displayImagesFromURL);
});