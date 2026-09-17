// Config
const API_URL = 'http://localhost:5000/api';

// Utility: Show Alert
function showAlert(message, type = 'error') {
  const alertBox = document.getElementById('alert-box');
  if (alertBox) {
    alertBox.textContent = message;
    alertBox.className = `alert ${type}`;
    alertBox.style.display = 'block';
    setTimeout(() => {
      alertBox.style.display = 'none';
      alertBox.className = 'alert';
    }, 5000);
  } else {
    alert(message);
  }
}

// Utility: Fetch with Auth
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('accessToken'); // Updated to use accessToken
  const headers = {
    ...options.headers,
    'Authorization': `Bearer ${token}`
  };

  try {
    const response = await fetch(`${API_URL}${url}`, {
      ...options,
      headers
    });

    if (response.status === 401) {
      // Basic refresh token logic could go here, or redirect
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      window.location.href = 'index.html';
    }

    return await response.json();
  } catch (err) {
    console.error(`Fetch error for ${url}:`, err);
    return { success: false, message: 'নেটওয়ার্ক এরর (Network Error)' };
  }
}

// Automatically Redesign and Enhance Frontend UI elements
document.addEventListener('DOMContentLoaded', () => {
  // 1. Add Animations class to body
  document.body.classList.add('animate-fade-in');

  // 2. Enhance Sidebar Menu Items with Beautiful Icons
  const sidebarLinks = document.querySelectorAll('.sidebar-menu li a');
  sidebarLinks.forEach(link => {
    const text = link.textContent.toLowerCase();
    let iconClass = 'fa-circle';

    if (text.includes('dashboard') || text.includes('ড্যাশবোর্ড')) {
      iconClass = 'fa-chart-pie';
    } else if (text.includes('new application') || text.includes('নতুন আবেদন') || text.includes('আবেদন করুন')) {
      iconClass = 'fa-file-signature';
    } else if (text.includes('profile') || text.includes('প্রোফাইল')) {
      iconClass = 'fa-user-gear';
    } else if (text.includes('status') || text.includes('আবেদন অবস্থা')) {
      iconClass = 'fa-receipt';
    } else if (text.includes('home') || text.includes('হোম')) {
      iconClass = 'fa-house-user';
    } else if (text.includes('applications') || text.includes('আবেদনসমূহ')) {
      iconClass = 'fa-folder-open';
    } else if (text.includes('logout') || text.includes('লগআউট')) {
      iconClass = 'fa-arrow-right-from-bracket';
    } else if (text.includes('সকল আবেদন')) {
      iconClass = 'fa-list';
    }

    if (!link.querySelector('i')) {
      const icon = document.createElement('i');
      icon.className = `fa-solid ${iconClass}`;
      icon.style.marginRight = '12px';
      link.prepend(icon);
    }
  });

  // 3. Initialize Responsive Sidebar Drawer
  const topbar = document.querySelector('.topbar');
  const sidebar = document.querySelector('.sidebar');
  if (topbar && sidebar) {
    if (!document.querySelector('.menu-toggle')) {
      const toggleBtn = document.createElement('button');
      toggleBtn.className = 'menu-toggle';
      toggleBtn.innerHTML = '<i class="fa-solid fa-bars"></i>';
      topbar.prepend(toggleBtn);

      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('mobile-open');
      });
    }

    document.addEventListener('click', (e) => {
      const toggleBtn = document.querySelector('.menu-toggle');
      if (sidebar.classList.contains('mobile-open') && !sidebar.contains(e.target) && (!toggleBtn || !toggleBtn.contains(e.target))) {
        sidebar.classList.remove('mobile-open');
      }
    });
  }

  // Logout handler
  const logoutBtns = document.querySelectorAll('a[href="#logout"]');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');
      window.location.href = 'index.html';
    });
  });
});
