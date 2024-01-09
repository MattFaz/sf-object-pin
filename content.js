const init = () => {
    if (document.readyState === 'complete') {
        waitForTable(() => {
            const table = document.querySelector('#setupComponent div.setupcontent table');
            addPinnedItemsDiv();
            addPinnedColumn(table);
            waitForTablePopulation(table, () => {
                handleTableUpdate(table)
                updatePinnedItemsDiv()
                observeTable(table)
            });

        });

    } else {
        setTimeout(init, 1000);
    }
}

const waitForTable = (callback) => {
    const table = document.querySelector('#setupComponent div.setupcontent table');
    if (table) {
        callback();
    } else {
        setTimeout(() => waitForTable(callback), 1000);
    }
};

// Function to add 'pinned' column
const addPinnedColumn = (table) => {
    const headerRow = table.querySelector('thead tr');
    const pinnedHeader = document.createElement('th');
    pinnedHeader.textContent = 'Pinned';
    headerRow.appendChild(pinnedHeader);
}

const addPinnedItemsDiv = () => {
    const setupComponent = document.querySelector('#setupComponent div.setupcontent');
    if (setupComponent) {
        const containerDiv = document.createElement('div');
        containerDiv.className = 'pinned-items-container';

        // Container for header and icon
        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-container';

        const header = document.createElement('h3');
        header.textContent = 'Pinned Objects';
        header.className = 'pinned-items-header';

        const button = document.createElement('button');
        button.className = 'pinned-items-icon';
        button.onclick = () => {
            console.log('Icon clicked!');
        };

        headerContainer.appendChild(header);
        headerContainer.appendChild(button);
        containerDiv.appendChild(headerContainer);

        const pinnedItemsDiv = document.createElement('div');
        pinnedItemsDiv.id = 'pinned-items';
        pinnedItemsDiv.className = 'pinned-items-style';
        containerDiv.appendChild(pinnedItemsDiv);

        const parent = setupComponent.parentNode;
        parent.insertBefore(containerDiv, setupComponent);
    }
};

// Wait for the table to be populated
const waitForTablePopulation = (table, callback) => {
    if (table.querySelector('tbody tr')) {
        callback();
    } else {
        setTimeout(() => waitForTablePopulation(table, callback), 1000);
    }
}

// Function to add the pin button to a row
const addPinButtonToRow = (row, pinnedItems) => {
    let uniqueId = row.querySelector('td').textContent;
    let url = row.querySelector('th a').href;

    let td = document.createElement('td');
    let button = document.createElement('button');
    button.classList.add('pin-button');

    // Check if the item is already pinned
    if (pinnedItems[uniqueId]) {
        button.classList.add('pinned');
    }

    button.onclick = () => togglePin(uniqueId, url, button);
    td.appendChild(button);
    row.appendChild(td);
}

// Function to handle table updates
const handleTableUpdate = (table) => {
    let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');

    let rows = table.querySelectorAll('tbody tr');
    rows.forEach(row => {
        if (!row.querySelector('.pin-button')) {
            addPinButtonToRow(row, pinnedItems);
        }
    });
}

// Function to toggle pin
const togglePin = (uniqueId, url, button) => {
    let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');

    if (pinnedItems[uniqueId]) {
        delete pinnedItems[uniqueId];
        button.classList.remove('pinned');
    } else {
        pinnedItems[uniqueId] = url;
        button.classList.add('pinned');
    }

    localStorage.setItem('pinnedItems', JSON.stringify(pinnedItems));
    updatePinnedItemsDiv();
}

// Function to update the pinned items div
const updatePinnedItemsDiv = () => {
    let pinnedDiv = document.querySelector('#pinned-items');
    if (!pinnedDiv) {
        pinnedDiv = document.createElement('div');
        pinnedDiv.id = 'pinned-items';
        pinnedDiv.className = 'pinned-items-style';
        document.querySelector('#setupComponent').prepend(pinnedDiv);
    }
    pinnedDiv.innerHTML = '';

    let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');
    for (let key in pinnedItems) {
        if (pinnedItems.hasOwnProperty(key)) {
            let button = document.createElement('button');
            button.className = 'pinned-item-button';
            button.textContent = key;
            button.onclick = () => window.location.href = pinnedItems[key]; // Redirect to the URL on click
            pinnedDiv.appendChild(button);
        }
    }
}

// Observe the table for new rows
const observeTable = (table) => {
    let observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            if (mutation.type === 'childList') {
                mutation.addedNodes.forEach(node => {
                    if (node.tagName === 'TR') { // Check if the added node is a table row
                        handleTableUpdate(table);
                    }
                });
            }
        });
    });

    observer.observe(table.querySelector('tbody'), { childList: true });
}


init();