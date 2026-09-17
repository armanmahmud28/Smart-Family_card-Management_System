let allApplications = [];

// Ensure Admin is logged in
if (!localStorage.getItem('token') || localStorage.getItem('role') !== 'admin') {
  window.location.href = 'index.html';
}

function logout() {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  window.location.href = 'index.html';
}

async function loadDashboard() {
  try {
    // Load Stats
    const statsData = await fetchWithAuth('/admin/stats');
    if (statsData.success) {
      if(document.getElementById('stat-total')) document.getElementById('stat-total').textContent = statsData.data.total;
      if(document.getElementById('stat-pending')) document.getElementById('stat-pending').textContent = statsData.data.pending;
      if(document.getElementById('stat-approved')) document.getElementById('stat-approved').textContent = statsData.data.approved;
      if(document.getElementById('stat-rejected')) document.getElementById('stat-rejected').textContent = statsData.data.rejected;
      if(document.getElementById('stat-duplicates')) document.getElementById('stat-duplicates').textContent = statsData.data.duplicates;

      // Render Chart if canvas exists
      const ctx = document.getElementById('statusChart');
      if (ctx) {
        new Chart(ctx, {
          type: 'pie',
          data: {
            labels: ['অপেক্ষমান (Pending)', 'অনুমোদিত (Approved)', 'বাতিল (Rejected)', 'ডুপ্লিকেট (Duplicates)'],
            datasets: [{
              data: [statsData.data.pending, statsData.data.approved, statsData.data.rejected, statsData.data.duplicates],
              backgroundColor: ['#f59e0b', '#10b981', '#ef4444', '#8b5cf6'],
              borderWidth: 2,
              borderColor: '#ffffff'
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: { 
                  font: { family: "'Hind Siliguri', 'Outfit', sans-serif", size: 13 },
                  color: '#334155',
                  padding: 20
                }
              }
            }
          }
        });
      }
    }

    // Load Applications Table
    if (document.getElementById('app-table-body')) {
      const appData = await fetchWithAuth('/admin/applications');
      if (appData.success) {
        allApplications = appData.data;
        renderTable(allApplications);
      }
    }
  } catch (err) {
    console.error(err);
  }
}

function renderTable(data) {
  const tbody = document.getElementById('app-table-body');
  tbody.innerHTML = '';
  
  if (data.length === 0) {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center;">কোনো আবেদন নেই</td></tr>';
    return;
  }

  data.forEach(app => {
    let badgeClass = app.status === 'Pending' ? 'pending' :
                     app.status === 'Approved' ? 'approved' :
                     app.status === 'Rejected' ? 'rejected' : 'review';
                     
    let statusText = app.status === 'Pending' ? 'অপেক্ষমান' :
                     app.status === 'Approved' ? 'অনুমোদিত' :
                     app.status === 'Rejected' ? 'বাতিল' : 'পর্যালোচনাধীন';

    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${app.personalInfo.firstName} ${app.personalInfo.lastName}</td>
      <td>${app.personalInfo.nid}</td>
      <td>${app.user.phone}</td>
      <td><span class="badge ${badgeClass}">${statusText}</span></td>
      <td>
        <button onclick="openActionModal('${app._id}')" style="padding: 5px 10px; background: var(--primary-color); color: white; border: none; border-radius: 4px; cursor: pointer;">সিদ্ধান্ত</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

function filterTable(status) {
  if (status === 'All') {
    renderTable(allApplications);
  } else if (status === 'Duplicate') {
    renderTable(allApplications.filter(a => a.isDuplicate));
  } else {
    renderTable(allApplications.filter(a => a.status === status));
  }
}

function openActionModal(id) {
  document.getElementById('action-app-id').value = id;
  document.getElementById('actionModal').style.display = 'flex';
}

function closeModal() {
  document.getElementById('actionModal').style.display = 'none';
}

async function submitAction() {
  const id = document.getElementById('action-app-id').value;
  const status = document.getElementById('action-status').value;
  const remarks = document.getElementById('action-remarks').value;

  try {
    const res = await fetchWithAuth(`/admin/applications/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, remarks })
    });

    if (res.success) {
      showAlert('সিদ্ধান্ত সফলভাবে সংরক্ষিত হয়েছে', 'success');
      closeModal();
      loadDashboard();
    } else {
      showAlert(res.message, 'error');
    }
  } catch (err) {
    showAlert('সার্ভারে সমস্যা হয়েছে', 'error');
  }
}

document.addEventListener('DOMContentLoaded', loadDashboard);
