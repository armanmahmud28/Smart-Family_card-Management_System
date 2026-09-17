document.addEventListener('DOMContentLoaded', () => {
  const roleRadios = document.querySelectorAll('input[name="role"]');
  const phoneGroup = document.getElementById('phone-group');
  const userIdGroup = document.getElementById('user-id-group');
  const loginForm = document.getElementById('login-form');
  const registerBtn = document.getElementById('register-btn');

  // Toggle between User and Admin login fields
  if (roleRadios.length > 0) {
    roleRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
        if (e.target.value === 'admin') {
          if (phoneGroup) phoneGroup.style.display = 'none';
          if (userIdGroup) userIdGroup.style.display = 'block';
          if (registerBtn) registerBtn.style.display = 'none';
        } else {
          if (phoneGroup) phoneGroup.style.display = 'block';
          if (userIdGroup) userIdGroup.style.display = 'none';
          if (registerBtn) registerBtn.style.display = 'block';
        }
      });
    });
  }

  // Handle Login
  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const roleElement = document.querySelector('input[name="role"]:checked');
      const role = roleElement ? roleElement.value : 'user';
      const passwordElement = document.getElementById('password');
      const password = passwordElement ? passwordElement.value : '';
      
      let payload = { password };
      let endpoint = '/auth/login';

      if (role === 'admin') {
        const adminPhone = document.getElementById('adminPhone').value;
        if (!adminPhone) return showAlert('মোবাইল নম্বর দিন (Provide Phone Number)');
        payload.phone = adminPhone;
        endpoint = '/auth/admin/login';
      } else {
        const phone = document.getElementById('phone').value;
        if (!phone) return showAlert('ফোন নম্বর দিন (Provide Phone Number)');
        payload.phone = phone;
      }

      try {
        const response = await fetch(`${API_URL}${endpoint}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        
        const data = await response.json();
        
        if (data.success) {
          localStorage.setItem('accessToken', data.accessToken);
          localStorage.setItem('refreshToken', data.refreshToken);
          localStorage.setItem('role', role);
          if (data.admin) {
            localStorage.setItem('adminName', data.admin.full_name);
            localStorage.setItem('adminRole', data.admin.role);
          }
          window.location.href = role === 'admin' ? 'admin-dashboard.html' : 'user-dashboard.html';
        } else {
          showAlert(data.message, 'error');
        }
      } catch (err) {
        console.error(err);
        showAlert('সার্ভারে সমস্যা হচ্ছে। দয়া করে অপেক্ষা করুন (Server Error)', 'error');
      }
    });
  }

  // Handle Registration Redirect
  if (registerBtn) {
    registerBtn.addEventListener('click', () => {
      window.location.href = 'register.html';
    });
  }
});
