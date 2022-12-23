let currentIndex = 0;
let batchSize = 3;
let data
const validateName = (event) =>{
    event.preventDefault()
    name = document.getElementById("name").value.trim()
    let nameValid = (name.length <= 24 && name.length > 0 && !(/\W/.test(name)));
    if(nameValid){
        document.getElementById("preLogin").setAttribute("hidden","hidden")
        document.getElementById("afterLogin").removeAttribute("hidden")
        document.getElementById("invalidName").setAttribute("hidden","hidden")
    }
    else
        document.getElementById("invalidName").removeAttribute("hidden")
}


async function displayImagesFromURL(event) {
    event.preventDefault()

    let key = "gqRjbR1ocVYMPviB9JoPqsVnLihxTOBKZLMGDdEm"
    let theurl = "https://api.nasa.gov/planetary/apod?api_key=" + key
    let url = `${theurl}&start_date=${document.getElementById("productId1").value}`
    // Fetch the JSON from the given URL
    const response = await fetch(url);
    data = await response.json();
    currentIndex = 0 //since its global and we made a new request
    document.getElementById("imagesList").innerHTML = "";

    displayImages(data)
    //I didnt use document in purpose
    window.addEventListener("scroll", function(event){
        event.preventDefault()
        const scrollY = window.scrollY + window.innerHeight + 2;
        const bodyScroll = document.body.offsetHeight;
        if(scrollY >= bodyScroll){
            currentIndex += batchSize
            displayImages(data)
        }
    })
}

function displayImages(data) {
    for(let i=currentIndex; i<currentIndex+batchSize; i++) {
        addListElement(data[i])
    }
}

let addListElement = (elem) => {
    let listItem = initListItem()
    listItem.row.append(getImageCol(elem))
    listItem.row.append(getImageInfo(elem))
    listItem.item.append(listItem.row)
    document.getElementById("imagesList").append(listItem.item)
}
let initListItem = () =>{
    let item = document.createElement('li')
    let row = document.createElement('div')
    item.className='list-group-item'
    row.className="row"
    return {item, row}
}

let getImageCol = (elem) => {
    let imageCol = document.createElement('div')
    imageCol.className="col-xl-8 col-md-6"
    let img = document.createElement('img')
    img.className="img-fluid"
    img.src = `${elem['url']}`
    imageCol.append(img)
    return imageCol
}
let getImageInfo = (elem) => {
    let col = document.createElement('div')
    col.className="col-xl-4 col-md-6"
    let descriptionRow = getDescriptionRow(elem)
    let messagesRow = getMessagesRow(elem)
    col.append(descriptionRow)
    col.append(messagesRow)
    return col
}
let getDescriptionRow = (elem) => {
    let descRow = document.createElement('div')
    descRow.className = "row"
    let paragraphs = getDescription(elem)
    let descCol= appendMultiple(paragraphs.date,paragraphs.header,paragraphs.explanation,paragraphs.copyright)
    descRow.append(descCol)
    return descRow
}

const appendMultiple = (...data) =>{
    let col = document.createElement('div')
    col.className="col"
    data.forEach(elem =>{
        col.append(elem)
    })
    return col
}

const getDescription = (elem)=>{
    let paragraphs = {
        date :   document.createElement('p'),
        header : document.createElement('h5'),
        explanation :   document.createElement('p'),
        copyright : document.createElement('p')
    }
    paragraphs.date.innerHTML = `Date: ${elem['date']}`
    paragraphs.header.innerHTML = `${elem['title']}`
    paragraphs.explanation.innerHTML = `${elem['explanation']}`
    paragraphs.copyright.innerHTML =  elem['copyright'] !== undefined ? `Copyright: ${elem['copyright']}` : ""
    return paragraphs
}

const getMessagesRow = (elem) => {
    let messagesRow = document.createElement('div')
    messagesRow.className = "row"



    return messagesRow
}

document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("nameInsertion").addEventListener("submit", validateName);
    document.getElementById("ajaxformget").addEventListener("submit", displayImagesFromURL);

});