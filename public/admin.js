document.addEventListener('DOMContentLoaded', () => {
    fetchReports();
    fetchUserProfile();
    setupFiltering();
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
  // Fetch Reports
  async function fetchReports() {
    try {
      const response = await fetch('/reports'); // Fetch all reports from the server
      if (!response.ok) throw new Error('Failed to fetch reports');
  
      const reports = await response.json();
      renderReports(reports); // Render fetched reports
    } catch (err) {
      console.error('Error fetching reports:', err);
    }
  }
  
  // Function to render the reports
  function renderReports(reports) {
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
        <button class="resolve-btn" data-id="${report._id}">Mark as Resolved</button>
        <button class="delete-btn" data-id="${report._id}">Delete</button>
      `;
  
      // Add event listener for the resolve button
      const resolveBtn = reportCard.querySelector('.resolve-btn');
      resolveBtn.addEventListener('click', async (e) => {
        const reportId = e.target.dataset.id;
        await resolveReport(reportId); // Mark the report as resolved
      });
  
      // Add event listener for the delete button
      const deleteBtn = reportCard.querySelector('.delete-btn');
      deleteBtn.addEventListener('click', async (e) => {
        const reportId = e.target.dataset.id;
        await deleteReport(reportId); // Delete the report
      });
  
      reportList.appendChild(reportCard);
    });
  }
  
  // Mark Report as Resolved
  async function resolveReport(reportId) {
    try {
      const response = await fetch(`/report/${reportId}/resolve`, {
        method: 'PUT',
      });
  
      if (!response.ok) throw new Error('Failed to resolve report');
  
      alert('Report marked as resolved');
      fetchReports(); // Refresh report list after updating the status
    } catch (err) {
      console.error('Error resolving report:', err);
      alert('Failed to resolve report. Check console for errors.');
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
  
  // Set up Filtering
  function setupFiltering() {
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
  
    // Filter reports based on selected category and status
    filterCategory.addEventListener('change', filterReports);
    filterStatus.addEventListener('change', filterReports);
  }
  
  async function filterReports() {
    const filterCategory = document.getElementById('filter-category');
    const filterStatus = document.getElementById('filter-status');
  
    const selectedCategory = filterCategory.value;
    const selectedStatus = filterStatus.value;
  
    // Fetch filtered reports from the server
    try {
      const response = await fetch(`/reports?category=${selectedCategory}&status=${selectedStatus}`);
      if (!response.ok) throw new Error('Failed to fetch filtered reports');
      
      const filteredReports = await response.json();
      renderReports(filteredReports); // Render filtered reports
    } catch (err) {
      console.error('Error fetching filtered reports:', err);
    }
  }
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