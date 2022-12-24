let currDate = new Date()
let batchSize = 3;


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
    let endDate = new Date(document.getElementById("endDate").value)
    // Fetch the JSON from the given URL
    fetch(getUrl(currDate)).then(response => response.json()).then(function(data){
        //currentIndex = 0 //since its global and we made a new request
        document.getElementById("imagesList").innerHTML = "";
        displayImagesBatch(data)
        //I didnt use document in purpose
        window.addEventListener("scroll", function(event){
            event.preventDefault()
            const scrollY = window.scrollY + window.innerHeight + 2;//if communication is poor with api increase '2'
            const bodyScroll = document.body.offsetHeight;
            if(scrollY >= bodyScroll && currDate.getDate() >= endDate.getDate()){
                currDate.setDate(currDate.getDate()-batchSize)
                fetch(getUrl(currDate)).then(response =>
                    response.json()).then(response=>displayImagesBatch(response))
            }
        })
        }
     )
}

const getUrl = (currDate) => {
    let nasaApiUrl = "https://api.nasa.gov/planetary/apod?api_key=gqRjbR1ocVYMPviB9JoPqsVnLihxTOBKZLMGDdEm"
    let temp = new Date()
    temp.setDate(currDate.getDate()-3)
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
    for(let i=0; i<batchSize; i++) {
        let listItem = initListItem()
        listItem.row.append(getImageCol(data[i]))
        listItem.row.append(getImageInfo(data[i]))
        listItem.item.append(listItem.row)
        currBatch.prepend(listItem.row)
    }
    document.getElementById("imagesList").append(currBatch)
}
const initListItem = () => {
    let item = createElement('li','list-group-item')
    let row = createElement('div','row')
    return {item, row}
}

const getImageCol = (elem) => {
    let imageCol = createElement('div','col-xl-8 col-md-6')
    let img = createElement('img','img-fluid')
    img.src = `${elem['url']}`
    imageCol.append(img)
    return imageCol
}
const getImageInfo = (elem) => {
    let col = document.createElement('div')
    col.className="col-xl-4 col-md-6"
    let descriptionRow = getDescriptionRow(elem)

    col.append(descriptionRow)

    return col
}

const getDescriptionRow = (elem) => {

    let paragraphs = getDescription(elem)
    let descCol= appendMultiple('col',paragraphs.date,paragraphs.header,paragraphs.explanation,paragraphs.copyright)
    let addMessageBtn = createElement('button','btn btn-secondary','Add message')

    addMessageBtn.addEventListener('click', function(event){

    })
    let messageBox = getTextArea(5,33,false,"Insert message here (up to 256 characters)","50","50")
    messageBox.setAttribute('maxlength','256')

    let hideDescriptionBtn = createElement('button', 'btn btn-info',"Show less")
    hideDescriptionBtn.style.marginBottom="30px"
    hideDescriptionBtn.addEventListener('click', function (event) {
        event.preventDefault()
        changeDisplay(hideDescriptionBtn,paragraphs.explanation,paragraphs.copyright, paragraphs.date)
    })

    let descRow = appendMultiple("row",descCol,hideDescriptionBtn,messageBox,addMessageBtn)
    descRow.className = "row"

    return descRow
}

const getTextArea = (rowsLength, colsLength, readOnly,placeHolder = "",size="",length="")=>{
    let textBox = createElement('textarea')
    textBox.setAttribute('rows',rowsLength)
    textBox.setAttribute('cols',colsLength)
    textBox.readOnly = readOnly
    textBox.setAttribute('size',size)
    textBox.setAttribute('length',length)
    textBox.style.resize = 'none';
    textBox.placeholder =  placeHolder
    return textBox
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