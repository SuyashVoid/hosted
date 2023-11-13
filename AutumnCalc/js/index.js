tippy('.infoBtn', {
    theme: 'light-border',
    distance: 20,
})

// Here, I will have royalty calculation functions. First I will take first form and prevent its default behavior
// Then I will take the values from the form and calculate the royalty

// First form
document.querySelector('#royaltyCalculator').addEventListener('submit', function (e) {
    e.preventDefault();
    handleTable();
});

document.querySelector('#emailForm').addEventListener('submit', function (e) {
    e.preventDefault();
    // Clear the form
    form = document.querySelector('#emailForm');
    formContainer = document.querySelector('#emailFormContainer');
    postTitle = document.querySelector('#postTitle')
    postSubtitle = document.querySelector('#postSubtitle')

    form.reset();
    formContainer.classList.add('fade-out');
    setTimeout(() => {
        formContainer.remove()
        setTimeout(() => {
            typeWriterEffect(postTitle, "Query Recieved.", 30);
            typeWriterEffect(postSubTitle, "We will get back to you ASAP!", 30);
        }, 200);
    }, 1000); // 500ms matches the animation duration
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
    container = document.querySelector('#resultsContainer');

    // I first gotta make table visible by setting its display to table
    container.classList.remove('hiddenResultsContainer');
    container.classList.add('fade-in');


    tbody = document.querySelector('#resultsBody');
    // I will first remove all rows (non-header) from the table
    while (table.rows.length > 1) {
        table.deleteRow(1);
    }
    // Then I will add the rows based on the values of showAmazon and showODS (First row is always there)
    // 4 Columns are Print Provider, Minimum List Price, Print Cost, Estimated Royalty    
    {
        var cost = 'N/A';
        var minLP = 'N/A';
        var royalty = 'N/A';

        if (listPrice && numPages) {
            cost = (numPages * 0.015) + 3
            royalty = (listPrice - cost)
            minLP = cost / 0.6;

            cost = "$" + cost.toFixed(2);
            minLP = "$" + minLP.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'Autumn Fiction';
        row.insertCell(1).innerHTML = minLP;
        row.insertCell(2).innerHTML = cost;
        row.insertCell(3).innerHTML = royalty;
    }


    if (showAmazon) {
        // I will add the row for Amazon
        var cost = 'N/A';
        var minLP = 'N/A';
        var royalty = 'N/A';

        if (listPrice && numPages) {
            cost = (numPages * 0.012) + 1;
            minLP = cost / 0.6;
            royalty = (0.6 * listPrice) - cost;

            cost = "$" + cost.toFixed(2);
            minLP = "$" + minLP.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'Amazon';
        row.insertCell(1).innerHTML = minLP;
        row.insertCell(2).innerHTML = cost;
        row.insertCell(3).innerHTML = royalty;
    }

    if (showODS) {
        var cost = 'N/A';
        var minLP = 'N/A';
        var royalty = 'N/A';

        if (listPrice && numPages) {
            cost = (numPages * 0.019) + 3.45
            royalty = (listPrice - cost)
            minLP = cost / 0.6;

            cost = "$" + cost.toFixed(2);
            minLP = "$" + minLP.toFixed(2);
            royalty = "$" + royalty.toFixed(2);
        }

        row = tbody.insertRow(-1);
        row.className = 'fade-in';
        row.insertCell(0).innerHTML = 'On Demand Printing';
        row.insertCell(1).innerHTML = minLP;
        row.insertCell(2).innerHTML = cost;
        row.insertCell(3).innerHTML = royalty;
    }

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