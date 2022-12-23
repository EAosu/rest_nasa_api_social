document.addEventListener("DOMContentLoaded", function() {
    document.getElementById("ajaxformget").addEventListener("submit", getData);
    document.getElementById("ajaxformget").addEventListener("submit", getData);
});

function getData(event) {

    event.preventDefault(); // because it is a form
    let key = "gqRjbR1ocVYMPviB9JoPqsVnLihxTOBKZLMGDdEm"
    let theurl = "https://api.nasa.gov/planetary/apod?api_key=" + key


    fetch(`${theurl}&start_date=${document.getElementById("productId1").value}`)
        .then(function(response) {
            return response.json(); //making it to json to use json params
        }).then(function(data) {
         data.forEach(elem =>{
             let newElem = document.createElement('li')
             let elemRow = document.createElement('div')
             elemRow.className="row"
             let imageCol = document.createElement('div')
             imageCol.className="col-xl-8 col-md-6"
             let img = document.createElement('img')
             img.className="img-fluid"
             img.src = `${elem['url']}`
             newElem.className='list-group-item'

             imageCol.append(img)
             elemRow.append(imageCol)


             let descCol = document.createElement('div')
             //col-xl-4 col-md-6
             descCol.className="col-xl-4 col-md-6"
             let description = document.createElement('p')
             description.innerHTML= `${elem['explanation']}`
             descCol.append(description)
             let picDate = document.createElement('p')
             picDate.innerHTML = `${elem['date']}`
             descCol.append(picDate)
             elemRow.append(descCol)

             newElem.append(elemRow)
             document.getElementById("imagesList").prepend(newElem)
         })

    })
        .catch(function(error) {
            console.log(error); // we should display the error to the user
        });
}