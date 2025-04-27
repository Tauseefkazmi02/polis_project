document.addEventListener('DOMContentLoaded', () => {
    // Example function to call backend API
    function callBackendHello() {
        fetch('http://localhost:8080/hello')
            .then(response => response.text())
            .then(data => {
                console.log('Response from backend:', data);
                const helloDiv = document.getElementById('hello-backend');
                if (helloDiv) {
                    helloDiv.textContent = data;
                }
            })
            .catch(error => {
                console.error('Error calling backend:', error);
            });
    }

    // Function to fetch all cases and update UI
    function fetchCases() {
        fetch('http://localhost:8080/cases')
            .then(response => response.json())
            .then(data => {
                console.log('Cases from backend:', data);
                const casesList = document.getElementById('cases-list');
                if (casesList) {
                    casesList.innerHTML = '';
                    data.forEach(c => {
                        const li = document.createElement('li');
                        li.textContent = `#${c.id} - ${c.title}: ${c.description}`;
                        casesList.appendChild(li);
                    });
                }
            })
            .catch(error => {
                console.error('Error fetching cases:', error);
            });
    }

    // Function to handle form submission to add a new case
    function handleCaseFormSubmit(event) {
        event.preventDefault();
        const titleInput = document.getElementById('case-title');
        const descriptionInput = document.getElementById('case-description');
        if (!titleInput || !descriptionInput) return;

        const newCase = {
            title: titleInput.value,
            description: descriptionInput.value
        };

        fetch('http://localhost:8080/cases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newCase)
        })
        .then(response => response.json())
        .then(data => {
            console.log('Case added:', data);
            titleInput.value = '';
            descriptionInput.value = '';
            fetchCases(); // Refresh the list
        })
        .catch(error => {
            console.error('Error adding case:', error);
        });
    }

    // Attach form submit event listener
    const caseForm = document.getElementById('case-form');
    if (caseForm) {
        caseForm.addEventListener('submit', handleCaseFormSubmit);
    }

    // Call the backend hello API on page load
    callBackendHello();

    // Fetch cases on page load
    fetchCases();
});
