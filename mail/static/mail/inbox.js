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

    console.log(`Trigger the submit event`);
  });
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


async function getMailboxFromApi(mailbox) {
  const  emails = await fetch(`/emails/${mailbox}`);
  const data = await emails.json();
  return data;
}

function load_mailbox(mailbox) {
  
  // Show the mailbox and hide other views
  document.querySelector('#emails-view').style.display = 'block';
  document.querySelector('#compose-view').style.display = 'none';

  // Fetch data of mailbox
  const fetchedData = getMailboxFromApi(mailbox);
  fetchedData.then((mailbox)=> {
    console.log(mailbox);
  });

  // Show the mailbox name
  document.querySelector('#emails-view').innerHTML = `<h3>${mailbox.charAt(0).toUpperCase() + mailbox.slice(1)}</h3>`;
}