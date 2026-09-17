document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('application-form');

  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();
      
      const submitBtn = document.getElementById('submit-btn');
      submitBtn.disabled = true;
      submitBtn.textContent = 'জমা দেওয়া হচ্ছে...';

      const formData = new FormData();
      
      const applicationData = {
        personalInfo: {
          firstName: document.getElementById('firstName').value,
          lastName: document.getElementById('lastName').value,
          nid: document.getElementById('nid').value,
          dob: document.getElementById('dob').value,
          maritalStatus: document.getElementById('maritalStatus').value,
        },
        addressInfo: {
          present: {
            houseNo: document.getElementById('p_houseNo').value,
            roadNo: document.getElementById('p_roadNo').value,
            villageArea: document.getElementById('p_villageArea').value,
            district: document.getElementById('p_district').value,
            upazila: document.getElementById('p_upazila').value,
          }
        },
        eligibility: {
          govtEmployee: document.getElementById('e_govtEmployee').value === 'true',
          landAmount: parseFloat(document.getElementById('e_landAmount').value),
        }
      };

      formData.append('data', JSON.stringify(applicationData));

      // Append files
      const applicantPhoto = document.getElementById('applicantPhoto').files[0];
      const utilityBill = document.getElementById('utilityBill').files[0];
      const chairmanCert = document.getElementById('chairmanCert').files[0];

      if (applicantPhoto) formData.append('applicantPhoto', applicantPhoto);
      if (utilityBill) formData.append('utilityBill', utilityBill);
      if (chairmanCert) formData.append('chairmanCert', chairmanCert);

      try {
        const token = localStorage.getItem('token');
        const response = await fetch(`${API_URL}/applications`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });

        const data = await response.json();
        
        if (data.success) {
          showAlert('আবেদন সফলভাবে জমা দেওয়া হয়েছে (Application submitted successfully)', 'success');
          setTimeout(() => {
            window.location.href = 'user-dashboard.html';
          }, 2000);
        } else {
          showAlert(data.message, 'error');
          submitBtn.disabled = false;
          submitBtn.textContent = 'আবেদন জমা দিন (Submit Application)';
        }
      } catch (err) {
        showAlert('সার্ভারে সমস্যা হয়েছে', 'error');
        submitBtn.disabled = false;
        submitBtn.textContent = 'আবেদন জমা দিন (Submit Application)';
      }
    });
  }
});
