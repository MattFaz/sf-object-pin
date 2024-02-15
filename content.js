if (typeof window.contentScriptInjected === 'undefined') {
    window.contentScriptInjected = true;
    console.log("content3.js loaded");

    // Function to wait for an element to be available within the DOM
    const waitForElement = (selector, parent = document, all = false) => {
        return new Promise((resolve, reject) => {
            const startTime = Date.now();
            const check = () => {
                let element;
                if (all) {
                    element = parent.querySelectorAll(selector);
                } else {
                    element = parent.querySelector(selector);
                }
                if (element) {
                    resolve(element);
                } else if (Date.now() - startTime > 30000) {
                    reject(new Error(`Timeout waiting for element: ${selector}`));
                }
                setTimeout(check, 1000);
            }
            check();
        })
    };

    const addPinnedItemsDiv = async () => {
        console.log('1. Adding pinned items div');
        const setupComponent = await waitForElement('#setupComponent > div.slds-page-header.branding-setup.onesetupSetupHeader > div > div.bBody');
        if (!setupComponent) throw new Error('setupComponent not found.');

        const existingDiv = setupComponent.querySelector('#pinned-items-container');
        if (existingDiv) {
            existingDiv.remove();
            console.log('Removed existing Pinned items div.');
        }

        const containerDiv = document.createElement('div');
        containerDiv.id = 'pinned-items-container';
        containerDiv.className = 'pinned-items-container';

        const headerContainer = document.createElement('div');
        headerContainer.className = 'header-container';

        const header = document.createElement('h3');
        header.textContent = 'Pinned Objects';
        header.className = 'pinned-items-header';

        const button = document.createElement('button');
        button.className = 'pinned-items-icon';
        button.onclick = () => {
            window.open('https://github.com/MattFaz/sf-object-pin', '_blank');
        };

        const pinnedItemsDiv = document.createElement('div');
        pinnedItemsDiv.id = 'pinned-items-div';
        pinnedItemsDiv.className = 'pinned-items-style';

        headerContainer.appendChild(button);
        headerContainer.appendChild(header);
        containerDiv.appendChild(headerContainer);
        containerDiv.appendChild(pinnedItemsDiv);
        setupComponent.appendChild(containerDiv);

        console.log('2. Pinned items div added.');
    };


    // Wait for the table to have more than one row
    const waitForTablePopulation = async (table) => {
        console.log('3. Waiting for table population');
        let rows = table.querySelectorAll('tbody tr');
        while (rows.length <= 1) { // Check if the number of rows is 1 or less
            await new Promise(resolve => setTimeout(resolve, 100));
            // Re-query the rows inside the loop to get the updated count
            rows = table.querySelectorAll('tbody tr');
        }
        console.log('4. Table populated');
    }

    // Add "Pinned" column header if not already present
    const modifyTableHeader = async (table) => {
        console.log('5. Modifying table header');
        const headerRow = table.querySelector('thead tr');
        if (!headerRow.querySelector('th.pinned-header')) {
            const pinnedHeader = document.createElement('th');
            pinnedHeader.textContent = 'Pinned';
            pinnedHeader.classList.add('pinned-header');
            headerRow.appendChild(pinnedHeader);
        }
        console.log('6. Table header modified');
    };

    // Add "Pin" button to each row
    const modifyRows = async (table, pinnedItems) => {
        console.log('6. Modifying Rows');

        const rows = await waitForElement('tbody tr', table, all = true);
        rows.forEach((row) => {
            if (!row.querySelector('td.pin-button-container')) {
                let url = row.querySelector('a').href;
                let uniqueId = row.querySelector('td').textContent;

                let td = document.createElement('td');
                td.className = 'pin-button-container'; // This helps in identifying if a button has already been added

                let button = document.createElement('button');
                button.classList.add('pin-button');
                if (pinnedItems[uniqueId]) {
                    button.classList.add('pinned');
                }
                button.onclick = async () => await togglePin(uniqueId, url, button);
                td.appendChild(button);
                row.appendChild(td);
            }
        });
        console.log('7. Table modified');
    };

    const togglePin = async (uniqueId, url, button) => {
        let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');
        if (pinnedItems[uniqueId]) {
            delete pinnedItems[uniqueId];
            button.classList.remove('pinned');
        } else {
            pinnedItems[uniqueId] = url;
            button.classList.add('pinned');
        }

        localStorage.setItem('pinnedItems', JSON.stringify(pinnedItems));
        await updatePinnedItemsDiv();
    }

    const updatePinnedItemsDiv = async () => {
        const pinnedItemsDiv = await waitForElement('#pinned-items-div');
        pinnedItemsDiv.innerHTML = '';

        let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');
        for (let key in pinnedItems) {
            if (pinnedItems.hasOwnProperty(key)) {
                let button = document.createElement('button');
                button.className = 'pinned-item-button';
                button.textContent = key;
                button.onclick = () => window.location.href = pinnedItems[key]; // Redirect to the URL on click
                pinnedItemsDiv.appendChild(button);
            }
        }
    }

    chrome.runtime.onMessage.addListener(
        async (request, sender, sendResponse) => {
            try {
                // const table = await waitForElement('#setupComponent div.setupcontent table');
                const table = await waitForElement('#setupComponent > div.setupcontent > div > div.scroller.uiScroller.scroller-wrapper.scroll-bidirectional.native > div > table');
                // await addPinnedItemsDiv();
                if (table) {

                    let pinnedItems = JSON.parse(localStorage.getItem('pinnedItems') || '{}');

                    const applyModifications = async () => {
                        console.log("Applying modifications to the table");
                        try {
                            await waitForTablePopulation(table);
                            await modifyTableHeader(table);
                            await modifyRows(table, pinnedItems);
                            await addPinnedItemsDiv();
                            await updatePinnedItemsDiv();
                        } catch (error) {
                            console.error("Error applying modifications:", error);
                        }
                    };

                    const observerCallback = async (mutationsList, observer) => {
                        observer.disconnect();
                        await applyModifications();
                        observer.observe(table, { childList: true, subtree: true });
                    };

                    observer = new MutationObserver(observerCallback);
                    observer.observe(table, { childList: true, subtree: true });

                    await applyModifications();

                    console.log('Initialization complete');
                }
            } catch (error) {
                console.error('Initialization failed', error);
            }
        }
    );
}
