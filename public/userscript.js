document.addEventListener('DOMContentLoaded', () => {
  fetchUserProfile();
  fetchReports();
});

// Fetch User Profile
async function fetchUserProfile() {
  try {
    const response = await fetch('/userprofile');
    if (!response.ok) throw new Error('Failed to fetch user profile');
    const userData = await response.json();
    document.getElementById('username').textContent = userData.username;
    document.getElementById('email').textContent = userData.email;
  } catch (err) {
    console.error('Error fetching user profile:', err);
  }
}

// Open & Close Report Modal
const addReportBtn = document.getElementById('add-report-btn');
const reportModal = document.getElementById('report-modal');
const closeModalBtn = document.getElementById('close-report-modal');

if (addReportBtn) addReportBtn.addEventListener('click', () => reportModal.classList.add('active'));
if (closeModalBtn) closeModalBtn.addEventListener('click', () => reportModal.classList.remove('active'));

// Form Submission
document.getElementById('report-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // Prevents page reload

  const title = document.getElementById('report-title').value.trim();
  const description = document.getElementById('report-description').value.trim();
  const location = document.getElementById('report-location').value.trim();
  const category = document.getElementById('report-category').value;

  if (!title || !description || !location) {
    alert('Please fill all required fields');
    return;
  }

  const formData = { title, description, location, category };

  try {
    const response = await fetch('/addreport', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error('Failed to add report');

    alert('Report added successfully');
    reportModal.classList.remove('active');
    fetchReports(); // Refresh reports
  } catch (err) {
    console.error('Error adding report:', err);
    alert('Failed to add report. Check console for errors.');
  }
});

// Fetch Reports
async function fetchReports() {
  try {
    const response = await fetch('/reports');
    if (!response.ok) throw new Error('Failed to fetch reports');

    const reports = await response.json();
    const reportList = document.getElementById('report-list');
    reportList.innerHTML = ''; // Clear current report list

    reports.forEach(report => {
      const reportCard = document.createElement('div');
      reportCard.classList.add('report-card');
      reportCard.innerHTML = `
        <h3>${report.title}</h3>
        <p>${report.description}</p>
        <p><strong>Location:</strong> ${report.location}</p>
        <p><strong>Category:</strong> ${report.category}</p>
        <p><strong>Status:</strong> ${report.status}</p>
        <button class="delete-btn" data-id="${report._id}">Delete</button>
      `;

      // Add event listener for the delete button
      const deleteBtn = reportCard.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async (e) => {
        const reportId = e.target.dataset.id;
        console.log('Report ID to delete:', reportId); // Log to ensure ID is correct
        await deleteReport(reportId);
      });

      reportList.appendChild(reportCard);
    });
  } catch (err) {
    console.error('Error fetching reports:', err);
  }
}

// Delete Report
async function deleteReport(reportId) {
  try {
    const response = await fetch(`/report/${reportId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error('Failed to delete report');

    alert('Report deleted successfully');
    fetchReports(); // Refresh report list after deletion
  } catch (err) {
    console.error('Error deleting report:', err);
    alert('Failed to delete report. Check console for errors.');
  }
}
async function filterReports() {
  const filterCategory = document.getElementById('filter-category');
  const filterStatus = document.getElementById('filter-status');

  const selectedCategory = filterCategory.value;
  const selectedStatus = filterStatus.value;

  // Initialize the URL with the base endpoint
  let url = '/reports?';

  // Add query parameters if they are selected (non-empty values)
  if (selectedCategory) {
    url += `category=${selectedCategory}&`;
  }

  if (selectedStatus) {
    url += `status=${selectedStatus}&`;
  }

  // Remove the trailing '&' if there's one
  url = url.endsWith('&') ? url.slice(0, -1) : url;

  console.log('Filter URL:', url);  // Debugging the URL to see the final request

  try {
    const response = await fetch(url);

    if (!response.ok) throw new Error('Failed to fetch filtered reports');

    const filteredReports = await response.json();
    renderReports(filteredReports);  // Render the filtered reports
  } catch (err) {
    console.error('Error fetching filtered reports:', err);
  }
}

