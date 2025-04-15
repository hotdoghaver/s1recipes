document.addEventListener('DOMContentLoaded', () => {
    const closeButtons = document.querySelectorAll('.close-modal');
    closeButtons.forEach(button => {
        button.addEventListener('click', closeModal);
    });
});
document.body.addEventListener('click', (event) => {
    if (event.target.matches('.close-modal')) {
        closeModal();
    }
});

     
     
     
     
     
     
     
     
     // Initialize Firebase
     const firebaseConfig = {
                        apiKey: "AIzaSyC3Mxzg1SAOZnNL2mQM5XAlC8xa_C6Icc8",
                        authDomain: "crazyniga3inc.firebaseapp.com",
                        projectId: "crazyniga3inc",
                        storageBucket: "crazyniga3inc.appspot.com",
                        messagingSenderId: "510294421805",
                        appId: "1:510294421805:web:d17ac64c4783b4e76b23a4",
                        measurementId: "G-LNHFKKRJBV"
        };
                
                // Initialize Firebase App
                firebase.initializeApp(firebaseConfig);
                const db = firebase.firestore();
                
                // Get a reference to the Firestore database
                const strainsCollection = db.collection('strains');
                
                // Global variables
                let strainToDeleteIndex = null;
                let strains = [];
                let currentStrainIndex = null;
        
                // DOM Elements
                const strainsListEl = document.getElementById('strainsList');
                const strainDetailsEl = document.getElementById('strainDetails');
                const addStrainModal = document.getElementById('addStrainModal');
                const addStepModal = document.getElementById('addStepModal');
                const editProfitModal = document.getElementById('editProfitModal');
                const addStrainForm = document.getElementById('addStrainForm');
                const addStepForm = document.getElementById('addStepForm');
                const editProfitForm = document.getElementById('editProfitForm');
                const addStrainBtnEmpty = document.getElementById('addStrainBtnEmpty');
                const addStrainBtn = document.getElementById('addStrainBtn');
                const statusMessage = document.getElementById('status-message');
        
                // Initialize the app
                function init() {
                    loadStrains();
                    document.getElementById('confirmDeleteBtn').addEventListener('click', async () => {
            if (strainToDeleteIndex === null) return;
            try {
                const strainId = strains[strainToDeleteIndex].id;
                await strainsCollection.doc(strainId).delete();
        
                if (currentStrainIndex === strainToDeleteIndex) {
                    currentStrainIndex = null;
                    strainDetailsEl.innerHTML = `
                        <div class="empty-state">
                            <p>Select a strain from the list or create a new one to get started</p>
                            <button id="addStrainBtnEmpty">+ Create New Strain</button>
                        </div>
                    `;
                    document.getElementById('addStrainBtnEmpty').addEventListener('click', openAddStrainModal);
                } else if (currentStrainIndex > strainToDeleteIndex) {
                    currentStrainIndex--;
                }
        
                closeModal();
                await loadStrains();
                showStatusMessage("Strain deleted successfully");
            } catch (error) {
                console.error("Error deleting strain:", error);
                showStatusMessage("Failed to delete strain: " + error.message, "error");
            }
        });
        
        
                    // Event listeners
                    document.getElementById('addStrainBtn').addEventListener('click', openAddStrainModal);
                    if (addStrainBtnEmpty) {
                        addStrainBtnEmpty.addEventListener('click', openAddStrainModal);
                    }
                    addStrainForm.addEventListener('submit', saveStrain);
                    addStepForm.addEventListener('submit', saveStep);
                    editProfitForm.addEventListener('submit', updateProfit);
        
                    // Modal close buttons
                    document.querySelectorAll('.close-modal').forEach(btn => {
                        btn.addEventListener('click', closeModal);
                    });
        
                    document.querySelectorAll('.close-modal-btn').forEach(btn => {
                        btn.addEventListener('click', closeModal);
                    });
        
                    // Prevent modal close on outside click
                    document.querySelectorAll('.modal-content').forEach(modalContent => {
                        modalContent.addEventListener('click', (e) => {
                            e.stopPropagation();
                        });
                    });
        
                    window.addEventListener('click', (e) => {
                        if (e.target.classList.contains('modal')) {
                            closeModal();
                        }
                    });
                }
        
                // Show status message
                function showStatusMessage(message, type = 'success') {
                    statusMessage.textContent = message;
                    statusMessage.className = type;
                    statusMessage.style.display = 'block';
                    
                    setTimeout(() => {
                        statusMessage.style.display = 'none';
                    }, 3000);
                }
        
                // Load strains from Firestore
                async function loadStrains() {
                    try {
                        strainsListEl.innerHTML = '<div class="loading"><div class="loading-spinner"></div></div>';
                        
                        const snapshot = await strainsCollection.get();
                        strains = [];
                        
                        snapshot.forEach(doc => {
                            strains.push({
                                id: doc.id,
                                ...doc.data()
                            });
                        });
                        
                        renderStrainsList();
                        
                        if (strains.length === 0) {
                            strainDetailsEl.innerHTML = `
                                <div class="empty-state">
                                    <p>No strains found. Create a new one to get started!</p>
                                    <button id="addStrainBtnEmpty">Create New Strain +</button>
                                </div>
                            `;
                            document.getElementById('addStrainBtnEmpty').addEventListener('click', openAddStrainModal);
                        }
                    } catch (error) {
                        console.error("Error loading strains:", error);
                        showStatusMessage("Failed to load strains: " + error.message, "error");
                        strainsListEl.innerHTML = '<p>Error loading strains. Please try again.</p>';
                    }
                }
        
                // Function to render the list of strains
                function renderStrainsList() {
                    strainsListEl.innerHTML = '';
                    
                    if (strains.length === 0) {
                        strainsListEl.innerHTML = '<p>No strains found.</p>';
                        return;
                    }
                    
                    strains.forEach((strain, index) => {
                        const strainDiv = document.createElement('div');
                        strainDiv.className = 'strain-item' + (index === currentStrainIndex ? ' active' : '');
                        strainDiv.innerHTML = `
                            <span>${strain.name}</span>
                            <button class="delete-strain-btn" data-index="${index}" title="Delete Strain" style="background:none;border:none;color:var(--danger);font-size:18px;cursor:pointer;">🗑️</button>
                        `;
                        strainDiv.querySelector('span').addEventListener('click', () => selectStrain(index));
                        strainDiv.querySelector('.delete-strain-btn').addEventListener('click', (e) => {
                        e.stopPropagation();
                        deleteStrain(index);
                     });
        
                        strainsListEl.appendChild(strainDiv);
                    });
                }
        
        
        
        
                // Function to select a strain
                function selectStrain(index) {            currentStrainIndex = index;
                    renderStrainsList(); // Update the list to show the active state
                    renderStrainDetails(strains[index]);
                }
                
                function deleteStrain(index) {
            const password = prompt("Enter password to delete this strain:");
            if (password !== DELETE_PASSWORD) {
                alert("Incorrect password. Deletion cancelled.");
                return;
            }
        
            strainToDeleteIndex = index;
            document.getElementById('confirmDeleteModal').style.display = 'flex';
        }
        
        
                // Function to render strain details
                function renderStrainDetails(strain) {
                    strainDetailsEl.innerHTML = `
                        <div class="details-header">
                            <h2>${strain.name}</h2>
                            <div class="profit">
                                Profit: <span class="profit-value">$${strain.profit.toFixed(2)}</span>
                                <button class="edit-profit" data-strain-index="${currentStrainIndex}">Edit</button>
                            </div>
                        </div>
                        <div class="strain-description">${strain.description || 'No description provided.'}</div>
                        
                        ${strain.tags ? `<div class="tags-container">${strain.tags.split(',').map(tag => `<span class="tag">${tag.trim()}</span>`).join('')}</div>` : ''}
                        
                        <h3>Recipe Steps</h3>
                        <div class="recipe-steps">
                            ${strain.steps && strain.steps.length > 0 ? generateStepsMarkup(strain.steps) : '<p>No steps available. Add some!</p>'}
                            <button class="add-step-btn">+ Add Recipe Step</button>
                        </div>
                    `;
        
                    // Handlers
                    strainDetailsEl.querySelector('.edit-profit').addEventListener('click', openEditProfitModal);
                    strainDetailsEl.querySelector('.add-step-btn').addEventListener('click', openAddStepModal);
                    
                    // Add event listeners for edit/delete step buttons
                    if (strain.steps && strain.steps.length > 0) {
                        const editButtons = strainDetailsEl.querySelectorAll('.edit-step');
                        const deleteButtons = strainDetailsEl.querySelectorAll('.delete-step');
                        
                        editButtons.forEach(button => {
                            button.addEventListener('click', () => {
                                const stepIndex = button.getAttribute('data-step-index');
                                editStep(stepIndex);
                            });
                        });
                        
                        deleteButtons.forEach(button => {
                            button.addEventListener('click', () => {
                                const stepIndex = button.getAttribute('data-step-index');
                                deleteStep(stepIndex);
                            });
                        });
                    }
                }
        
                function generateStepsMarkup(steps) {
                    return steps.map((step, index) => `
                        <div class="step">
                            <div class="step-header">
                                <h3><span class="step-number">${step.stepNumber}</span>${step.ingredientName}</h3>
                                <div class="step-actions">
                                    <button class="edit-step" data-step-index="${index}">Edit</button>
                                    <button class="delete-step" data-step-index="${index}">Delete</button>
                                </div>
                            </div>
                            <div class="step-meta">
                                <div class="step-meta-item">Amount: <span>${step.ingredientAmount || 'N/A'}</span></div>
                                <div class="step-meta-item">Time: <span>${step.processingTime || 'N/A'}</span></div>
                            </div>
                            <div class="step-instructions">${step.stepInstructions}</div>
                            ${step.stepNotes ? `<div class="step-notes"><strong>Notes:</strong> ${step.stepNotes}</div>` : ''}
                        </div>
                    `).join('');
                }
        
                // Function to edit a step
                function editStep(stepIndex) {
                    const step = strains[currentStrainIndex].steps[stepIndex];
                    
                    document.getElementById('stepModalTitle').innerText = 'Edit Recipe Step';
                    document.getElementById('stepNumber').value = step.stepNumber;
                    document.getElementById('ingredientName').value = step.ingredientName;
                    document.getElementById('ingredientAmount').value = step.ingredientAmount || '';
                    document.getElementById('processingTime').value = step.processingTime || '';
                    document.getElementById('stepInstructions').value = step.stepInstructions;
                    document.getElementById('stepNotes').value = step.stepNotes || '';
                    document.getElementById('editStepIndex').value = stepIndex;
                    
                    addStepModal.style.display = 'flex';
                }
        
                // Function to delete a step
                async function deleteStep(stepIndex) {
                    if (confirm('Are you sure you want to delete this step?')) {
                        try {
                            const strain = strains[currentStrainIndex];
                            strain.steps.splice(stepIndex, 1);
                            
                            await strainsCollection.doc(strain.id).update({
                                steps: strain.steps
                            });
                            
                            renderStrainDetails(strain);
                            showStatusMessage("Step deleted successfully");
                        } catch (error) {
                            console.error("Error deleting step:", error);
                            showStatusMessage("Failed to delete step: " + error.message, "error");
                        }
                    }
                }
        
                // Modal Handlers
                function openAddStrainModal() {
                    addStrainModal.style.display = 'flex';
                    document.getElementById('addStrainForm').reset();
                }
        
                function openAddStepModal() {
                    addStepModal.style.display = 'flex';
                    document.getElementById('stepModalTitle').innerText = 'Add Recipe Step';
                    document.getElementById('addStepForm').reset();
                    document.getElementById('editStepIndex').value = '';
                    
                    // If there are existing steps, pre-fill the step number to be the next in sequence
                    const strain = strains[currentStrainIndex];
                    if (strain.steps && strain.steps.length > 0) {
                        const maxStepNumber = Math.max(...strain.steps.map(step => step.stepNumber));
                        document.getElementById('stepNumber').value = maxStepNumber + 1;
                    } else {
                        document.getElementById('stepNumber').value = 1;
                    }
                }
        
                function openEditProfitModal() {
                    editProfitModal.style.display = 'flex';
                    document.getElementById('newProfit').value = strains[currentStrainIndex].profit;
                }
        
                function closeModal() {
                    const modals = document.querySelectorAll('.modal');
                    modals.forEach(modal => {
                        modal.style.display = 'none';
                    });
                }
                
        
        
                // Form Handlers
                async function saveStrain(e) {
                    e.preventDefault();
        
                    const name = document.getElementById('strainName').value;
                    const description = document.getElementById('strainDescription').value;
                    const profit = parseFloat(document.getElementById('strainProfit').value);
                    const tags = document.getElementById('strainTags').value;
        
                    const newStrain = {
                        name,
                        description,
                        profit,
                        tags,
                        steps: [],
                        createdAt: firebase.firestore.FieldValue.serverTimestamp()
                    };
        
                    try {
                        const docRef = await strainsCollection.add(newStrain);
                        
                        closeModal();
                        await loadStrains();
                        
                        // Find the index of the newly added strain
                        const newIndex = strains.findIndex(strain => strain.id === docRef.id);
                        if (newIndex !== -1) {
                            selectStrain(newIndex);
                        }
                        
                        showStatusMessage("Strain created successfully");
                    } catch (error) {
                        console.error("Error adding strain:", error);
                        showStatusMessage("Failed to create strain: " + error.message, "error");
                    }
                }
        
                async function saveStep(e) {
                    e.preventDefault();
        
                    const stepNumber = parseInt(document.getElementById('stepNumber').value);
                    const ingredientName = document.getElementById('ingredientName').value;
                    const ingredientAmount = document.getElementById('ingredientAmount').value;
                    const processingTime = document.getElementById('processingTime').value;
                    const stepInstructions = document.getElementById('stepInstructions').value;
                    const stepNotes = document.getElementById('stepNotes').value;
                    const editStepIndex = document.getElementById('editStepIndex').value;
        
                    const newStep = {
                        stepNumber,
                        ingredientName,
                        ingredientAmount,
                        processingTime,
                        stepInstructions,
                        stepNotes
                    };
        
                    try {
                        const strain = strains[currentStrainIndex];
                        
                        if (editStepIndex === '') {
                            // Adding new step
                            if (!strain.steps) {
                                strain.steps = [];
                            }
                            strain.steps.push(newStep);
                        } else {
                            // Editing existing step
                            strain.steps[editStepIndex] = newStep;
                        }
                        
                        // Sort steps by step number
                        strain.steps.sort((a, b) => a.stepNumber - b.stepNumber);
                        
                        await strainsCollection.doc(strain.id).update({
                            steps: strain.steps
                        });
                        
                        closeModal();
                        renderStrainDetails(strain);
                        
                        showStatusMessage(editStepIndex === '' ? "Step added successfully" : "Step updated successfully");
                    } catch (error) {
                        console.error("Error saving step:", error);
                        showStatusMessage("Failed to save step: " + error.message, "error");
                    }
                }
        
                async function updateProfit(e) {
                    e.preventDefault();
        
                    const newProfit = parseFloat(document.getElementById('newProfit').value);
                    
                    try {
                        const strain = strains[currentStrainIndex];
                        strain.profit = newProfit;
                        
                        await strainsCollection.doc(strain.id).update({
                            profit: newProfit
                        });
                        
                        closeModal();
                        renderStrainDetails(strain);
                        
                        showStatusMessage("Profit updated successfully");
                    } catch (error) {
                        console.error("Error updating profit:", error);
                        showStatusMessage("Failed to update profit: " + error.message, "error");
                    }
                }
        
                // Initialize the app
                init();
                const DELETE_PASSWORD = 'bigblackniggaballs223'; // Replace with your actual password