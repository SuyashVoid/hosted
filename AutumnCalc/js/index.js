const formLink = "1FAIpQLSfXsCWOt5xLh7idtG5gHGVHH3RDbaFAvZgHa931hkQSwPxrQw";
tippy('.infoBtn', {
    theme: 'light-border',
    distance: 20,
    interactive: true,
    arrow: true,
})

// Here, I will have royalty calculation functions. First I will take first form and prevent its default behavior
// Then I will take the values from the form and calculate the royalty

// First form
document.querySelector('#royaltyCalculator').addEventListener('submit', function (e) {
    container = document.querySelector('#resultsContainer');
    container.classList.remove('hiddenResultsContainer');
    container.classList.add('fade-in');
    e.preventDefault();
    handleTable();
});

document.querySelector('#emailForm').addEventListener('submit', function (e) {
    e.preventDefault();
    // Clear the form    
    // Collect data
    email = document.querySelector('#email').value;
    penname = document.querySelector('#name').value;
    phone = document.querySelector('#phone').value;
    bookTitle = document.querySelector('#bookTitle').value;
    info = document.querySelector('#additionalInfo').value;
    formSender({ email, penname, phone, bookTitle, info });
});

// Add listener to the checkboxes
document.querySelector('#showAmazon').addEventListener('change', function (e) {
    handleTable();
});
document.querySelector('#showODS').addEventListener('change', function (e) {
    handleTable();
});

function handleTable() {
    listPrice = document.querySelector('#listPrice').value;
    numPages = document.querySelector('#numPages').value;
    showAmazon = document.querySelector('#showAmazon').checked;
    showODS = document.querySelector('#showODS').checked;

    table = document.querySelector('#resultsTable');
    tbody = document.querySelector('#resultsBody');
    // Remove all rows except the first one to keep the table header
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    {
        var cost = 'N/A';
        var royalty = 'N/A';

        if (listPrice && numPages) {
            cost = (numPages * 0.015) + 3
            royalty = (listPrice - cost)

            cost = "$" + cost.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'Autumn Fiction';
        row.insertCell(1).innerHTML = cost;
        row.insertCell(2).innerHTML = royalty;
    }

    // If the user wants to see the other options, show them
    if (showAmazon) {
        var cost = 'N/A';
        var royalty = 'N/A';
        infoBtn = createInfoBtn("Check out Amazon's official pricing calculator <a href='https://kdp.amazon.com/en_US/royalty-calculator' target='_blank'>here</a>")
        infoBtn.classList.add('infoLight');

        if (listPrice && numPages) {
            cost = (0.4 * listPrice) + (numPages * 0.012) + 1;
            royalty = (0.6 * listPrice) - (numPages * 0.012 + 1);

            cost = "$" + cost.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'Amazon' + infoBtn.outerHTML;
        tippy('.infoBtn', {
            theme: 'light-border',
            distance: 20,
            interactive: true,
            arrow: true,
        })
        row.insertCell(1).innerHTML = cost;
        row.insertCell(2).innerHTML = royalty;
    }

    if (showODS) {
        var cost = 'N/A';
        var royalty = 'N/A';

        if (listPrice && numPages) {
            cost = (numPages * 0.019) + 3.45
            royalty = (listPrice - cost)

            cost = "$" + cost.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'On Demand Printing';
        row.insertCell(1).innerHTML = cost;
        row.insertCell(2).innerHTML = royalty;
    }

}

function createInfoBtn(tooltipText) {
    let infoBtn = document.createElement('button');
    infoBtn.className = 'infoBtn';
    console.log(tooltipText);
    infoBtn.setAttribute('data-tippy-content', tooltipText);
    infoBtn.innerHTML = 'i';
    return infoBtn;
}

function typeWriterEffect(element, text, speed) {
    let i = 0;
    element.innerHTML = "";

    function typing() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(typing, speed);
        }
    }

    typing();
}

function formSender({ email, penname, phone, bookTitle, info }) {

    let formvals = new FormData();

    formvals.append('entry.1045781291', email);
    formvals.append('entry.2005620554', penname);
    formvals.append('entry.1166974658', phone);
    formvals.append('entry.839337160', bookTitle);
    formvals.append('entry.1065046570', info);

    postTitle = document.querySelector('#postTitle')
    postSubtitle = document.querySelector('#postSubtitle')
    formContainer = document.querySelector('#emailFormContainer');

    fetch('https://docs.google.com/forms/d/' + formLink + '/formResponse', {
        method: 'POST',
        body: formvals,
        mode: 'no-cors' // This is important to avoid CORS issues
    }).then((response) => {
        // Check the code

        form = document.querySelector('#emailForm');
        form.reset();
        formContainer.classList.add('fade-out');
        // console.log('Form submitted');
        setTimeout(() => {
            formContainer.remove()
            setTimeout(() => {
                typeWriterEffect(postTitle, "Query Recieved.", 30);
                typeWriterEffect(postSubTitle, "We will get back to you ASAP!", 30);
            }, 200);
        }, 1000); // 500ms matches the animation duration

    }).catch((error) => {
        console.log(error)
        setTimeout(() => {
            typeWriterEffect(postTitle, "Oops!", 30);
            typeWriterEffect(postSubTitle, "Something went wrong. Please try again later.", 30);
        }, 200);
    });

}