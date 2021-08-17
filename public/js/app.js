const btnShort = document.getElementById('btn-short')
const menu = document.getElementById('mobile-menu')
const btnCopy = document.getElementById("btn-copy")
const btnDelete = document.getElementById("btn-delete")
const errMsg = document.getElementById('error-msg')
const colRes = document.getElementById('col-res')
const btnEdit = document.getElementById('btn-edit')
const btnSEdit = document.getElementById('btn-s-edit')
const url = document.getElementById('url')
const urlText = document.getElementById('url-text') 
const urlDiv = document.getElementById('url-div')
const editDiv = document.getElementById('edit-div')
const editUrl = document.getElementById('edit-url')
const urlAlertText = document.getElementById('alert-text')
const urlEdit = document.getElementById('custom-url')
const selectDomain = document.getElementById('select-domain')

const validURL = (str) => {
    const pattern = new RegExp('^(https?:\\/\\/)?'+
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|'+
      '((\\d{1,3}\\.){3}\\d{1,3}))'+
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+
      '(\\?[;&a-z\\d%_.~+=-]*)?'+
      '(\\#[-a-z\\d_]*)?$','i');

    return !!pattern.test(str);
}

function toggle() {
  menu.classList.toggle("hidden")
  document.getElementById('openBtn').classList.toggle('hidden')
  document.getElementById('closedBtn').classList.toggle('hidden')
}
 
function selectDmn() {
     let sdt = document.getElementById('selected-domain')
     sdt.textContent = `${selectDomain.value}/`
     
}

function saveClipBoard(data) {
    var dummy = document.createElement('input');
    var text = data;

    document.body.appendChild(dummy);
    dummy.value = text;
    dummy.select();
    var success = document.execCommand('copy');
    document.body.removeChild(dummy);
    
    return success;
}

const shortenerResponse = (isValidUrl, serverMessage, codeId, shortCode) => {

    let message = 'NOTHING!?',
        errorMsg = ''
   
    if (isValidUrl) {
        urlDiv.classList.remove('hidden');
        urlText.getAttribute("href");
        urlText.setAttribute("href", `${serverMessage}`);
        urlText.getAttribute("type");
        urlText.setAttribute("type", codeId);
        urlText.textContent = `${window.location.hostname}/${shortCode}`
      } else {
        urlDiv.classList.add('hidden')
        urlAlertText.classList.remove('hidden');
        urlAlertText.innerHTML = `${serverMessage}.`
        setTimeout(() => {
          urlAlertText.classList.add('hidden')
        }, 2500)  
    }
    //errMsg.innerHTML = errorMsg;
   // urlAlertText.innerHTML = message;
}

btnCopy.addEventListener('click', async() => {
  const isCopied = saveClipBoard(urlText.href)

        if (isCopied) {
          btnCopy.innerHTML = `<i class="fas fa-check text-blue-500 fa-lg"></i>`
           
          setTimeout(() => {
          btnCopy.innerHTML = `<i class="far fa-copy text-green-500 fa-lg"></i>`
           }, 2000) 
        } 
})

url.addEventListener('keypress', (e) => {
    if (e.which == 13 || e.keyCode == 13 || e.key == 'Enter') {
        btnShort.click()
    }
})

btnShort.addEventListener('click', async () => {
    
    const longUrl = url.value

    //const isValidUrl = validURL(longUrl)
    const isValidUrl = longUrl.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);

    if(isValidUrl) {
        const response = await fetch('/create', {
            method: 'POST',
            body: JSON.stringify({
                url: longUrl
            }),
            headers: {
                'Content-Type': 'application/json'
            }
        }).then(resp => resp.json())

        let success = response.success
        let message = '';
        let url = '';

        if(success) {
            url = response.url
            message = `${window.location.origin}/${url}`
        } else {
            url = null
            message = response.message || `URL couldn't shortened`
        }

        shortenerResponse(success, message, response.id, url)
       
        
    } else {
       shortenerResponse(isValidUrl, 'Please enter a correct URL', null, null)
    }    
})

btnDelete.addEventListener('click', async () => {
  const shortedId = urlText.type
  //document.getElementById("form-pop").classList.add('d-none')
 
  const deletedRes = await fetch('/delete', {
    method: 'POST',
    body: JSON.stringify({
      id: shortedId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(ress => ress.json())

  btnDelete.innerHTML = `<i class="fas fa-check text-blue-500 fa-lg"></i>`
           
  setTimeout(() => {
  btnDelete.innerHTML = `<i class="far fa-trash-alt text-red-500 fa-lg"></i>`
  }, 2000)
     
  setTimeout(() => { 
    urlDiv.classList.add('hidden')
    editDiv.classList.add('hidden')
  }, 1000)
  })

btnSEdit.addEventListener('click', async () => {

  const customShortUrl = editUrl.value,
  shortedId = urlText.type;
  const customRes = await fetch('/edit', {
    method: 'POST',
    body: JSON.stringify({
      url: customShortUrl,
      id: shortedId
    }),
    headers: {
      'Content-Type': 'application/json'
    }
}).then(rsp => rsp.json())
  
  let okres = customRes.success
  let customMsg = ''
  let newCustomUrl = document.getElementById('selected-domain').textContent;
     
  if(okres) {
    
    customMsg = customRes.message
    urlText.textContent = `${newCustomUrl}${customRes.url}`
    urlText.getAttribute("href");
    urlText.setAttribute("href", `https://${newCustomUrl}${customRes.url}`);
     
    } else {
    customMsg = customRes.message || `URL couldn't shortened`
    let editAlert = document.getElementById('edit-alert')
    editAlert.classList.remove('hidden')
    editAlert.textContent = `${customMsg}.`
    setTimeout(() => {
          editAlert.classList.add('hidden')
        }, 3000) 
    }      
  });

 btnEdit.addEventListener('click', async () => {
  editDiv.classList.toggle('hidden')
    
 })

document.addEventListener('click', async(e) => {
   
  if(e.target && e.target.id == "button-menu") {
    menu.classList.toggle("hidden")
  }
  
  if(e.target && e.target.id == "btn-edit") {
   }

});