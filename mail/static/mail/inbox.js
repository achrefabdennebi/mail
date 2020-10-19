document.addEventListener('DOMContentLoaded', function() {

  // Use buttons to toggle between views
  document.querySelector('#inbox').addEventListener('click', () => load_mailbox('inbox'));
  document.querySelector('#sent').addEventListener('click', () => load_mailbox('sent'));
  document.querySelector('#archived').addEventListener('click', () => load_mailbox('archive'));
  document.querySelector('#compose').addEventListener('click', compose_email);
  
  // By default, load the inbox
  load_mailbox('inbox');
  
  // Submit the form of send mail
  const form = document.querySelector('#compose-form')
  // Trigger the submit event
  form.addEventListener('submit',  (event) => {
    event.preventDefault();
    // Get the form data from the event object
    const formData = new FormData(form)
    const mailToSend = {
      recipients: formData.get('recipients'),
      subject: formData.get('subject'),
      body: formData.get('body')
    }

    // Post data of new data
    fetch('/emails', {
      method: 'POST',
      body: JSON.stringify(mailToSend)
    })
    .then(response => response.json())
    .then(result => {
        // Load sent mailbox view
        load_mailbox('sent');
    });
  });

  // Display detail mail
  document.addEventListener(`click`, displayMailDetail);
});

function compose_email() {

  // Show compose view and hide other views
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'block';

  // Clear out composition fields
  document.querySelector('#compose-recipients').value = '';
  document.querySelector('#compose-subject').value = '';
  document.querySelector('#compose-body').value = '';
}

/**
 * Api get mailbox
 * @param {*} mailbox 
 */
async function getMailboxFromApi(mailbox) {
  const  emails = await fetch(`/emails/${mailbox}`);
  const data = await emails.json();
  return data;
}

/**
 * Api get mail detail
 * @param {*} id 
 */
async function getApiDetailMail(id) {
  const detail = await fetch(`emails/${id}`)
  const data = await detail.json();
  return data;
}

/**
 * Api mark the mail as read
 * @param {*} id 
 */
async function markMailAsRead(id) {
  const markMailAsRead = await fetch(`emails/${id}`, {
      method:'PUT',
      body:JSON.stringify({
          read: true
      })
    }
  );

  return markMailAsRead;
}

/**
 * Create Javascript mailbox list
 * @param {*} data 
 */
function createMailboxView( data) {
  // Create ul element
  const list = document.createElement(`ul`);

  // Append items list based on data
  if (data && data.length > 0) {
    for (let item of data) {
      itemList = document.createElement(`li`);

      // Append className ti list item
      itemList.className = `mail-info`;

      // Apply the background color mail if read it
      const color = item.read ? `#ededed` : `#ffffff`;
      itemList.style.backgroundColor = color;

      // Create content list
      itemList.innerHTML = ` 
        <div>
          <strong> ${item.sender}</strong> 
          <span>${item.body.substr(0,20)}...</span>
          <span class="align-right grey-color">${item.timestamp}</span>
        </div>
      `;

      // Add data value to first child itemList
      Array.from(itemList.firstElementChild.children).forEach((node) => node.dataset.mail = JSON.stringify(item));
      itemList.firstElementChild.dataset.mail = JSON.stringify(item);

      list.appendChild(itemList)
    }
  }

  // Extract list on view container
  const content = document.querySelector(`#emails-view`)
  content.appendChild(list);
}

/**
 * Click on item list info
 * @param {*} mailbox 
 */
function displayMailDetail(event) {
  const {target } = event;

  if (target.closest(`.mail-info`)){
    const { dataset } = target;
    const { mail } = dataset;
    const mailInfoItem  = JSON.parse(mail);
    const fetchedDetailMail = getApiDetailMail(mailInfoItem.id);
    const markAsRead = markMailAsRead(mailInfoItem.id);
    Promise.all([fetchedDetailMail, markAsRead]).then((result) => {
      // Get the first result of the promise to display the mail detail
      displayMailView(result[0]);
    });
  }
}

/**
 * UI display mail
 * @param {*} mailDetail 
 */
function displayMailView(mailDetail) {
  // extract data 
  const {sender, recipients , subject, timestamp } = mailDetail;

  // Show mail detail
  document.querySelector('#emails-view').style.display = 'none';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector(`#display-mail-view`).style.display = 'block';

  // Show mail detail
  document.querySelector(`#display-mail-view`).innerHTML = `
    <div>
      <div>
        <strong>From:</strong>
        <span>${sender}</span>
      </div>
      <div>
        <strong>To:</strong>
        <span>${recipients.join()}</span>
      </div>
      <div>
        <strong>Subject:</strong>
        <span>${subject}</span>
      </div>
      <div>
        <strong>Timestamp:</strong>
        <span>${timestamp}</span>
      </div>
      <button class="btn btn-sm btn-outline-primary" id="replay">Replay</button>
    </div>
  `
}


/**
 * Load mail box data
 * @param {*} mailbox 
 */
function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';
  document.querySelector(`#display-mail-view`).style.display = 'none';

  // Fetch data of mailbox
  const fetchedData = getMailboxFromApi(mailbox);
  fetchedData.then((mailbox)=> {
    createMailboxView(mailbox);
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}