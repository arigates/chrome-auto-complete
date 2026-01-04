function generateUUID() { // Simple UUID generator
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

const DEFAULT_PROFILE_NAME = "Personal";

document.addEventListener('DOMContentLoaded', () => {
  const profileSelector = document.getElementById('profile-selector');
  const deleteBtn = document.getElementById('delete-profile-btn');
  const addBtn = document.getElementById('add-profile-btn');
  const fillBtn = document.getElementById('fill-btn');
  const customFieldsContainer = document.getElementById('custom-fields-container');

  let profiles = [];
  let activeProfileId = null;

  // --- HELPER FUNCs ---

  function getFormData() {
    const customFields = [];
    document.querySelectorAll('#custom-fields-container .input-group').forEach(div => {
      const k = div.querySelector('.custom-key').value.trim();
      const v = div.querySelector('.custom-value').value.trim();
      if (k && v) customFields.push({ key: k, value: v });
    });

    return {
      name: document.getElementById('name').value,
      email: document.getElementById('email').value,
      username: document.getElementById('username').value,
      address: document.getElementById('address').value,
      password: document.getElementById('password').value,
      phone: document.getElementById('phone').value,
      whatsapp: document.getElementById('whatsapp').value,
      customFields: customFields
    };
  }

  function setFormData(data) {
    document.getElementById('name').value = data.name || '';
    document.getElementById('email').value = data.email || '';
    document.getElementById('username').value = data.username || '';
    document.getElementById('address').value = data.address || '';
    document.getElementById('password').value = data.password || '';
    document.getElementById('phone').value = data.phone || '';
    document.getElementById('whatsapp').value = data.whatsapp || '';

    customFieldsContainer.innerHTML = '';
    if (data.customFields && Array.isArray(data.customFields)) {
      data.customFields.forEach(field => addCustomFieldUI(field.key, field.value));
    }
  }

  function addCustomFieldUI(key = '', value = '') {
    const div = document.createElement('div');
    div.className = 'input-group';
    div.style.position = 'relative';
    div.innerHTML = `
            <input type="text" placeholder="Key" class="custom-key" value="${key}" style="width: 45%; display: inline-block;">
            <input type="text" placeholder="Value" class="custom-value" value="${value}" style="width: 45%; display: inline-block;">
            <button class="remove-field" style="background: #e74c3c; padding: 4px 8px; font-size: 10px; position:absolute; top: 12px; right: 5px;">X</button>
        `;
    div.querySelector('.remove-field').addEventListener('click', () => div.remove());
    customFieldsContainer.appendChild(div);
  }

  function renderProfileOptions() {
    profileSelector.innerHTML = '';
    profiles.forEach(p => {
      const option = document.createElement('option');
      option.value = p.id;
      option.textContent = p.name;
      if (p.id === activeProfileId) option.selected = true;
      profileSelector.appendChild(option);
    });
    // Disable delete if only one profile
    deleteBtn.disabled = profiles.length <= 1;
    deleteBtn.style.opacity = profiles.length <= 1 ? "0.5" : "1";
  }

  function saveToStorage(msg = "Settings saved!") {
    // Update current profile data before saving
    const currentProfileIndex = profiles.findIndex(p => p.id === activeProfileId);
    if (currentProfileIndex !== -1) {
      profiles[currentProfileIndex].data = getFormData();
    }

    chrome.storage.local.set({ profiles, activeProfileId }, () => {
      const status = document.getElementById('status');
      status.textContent = msg;
      status.className = 'status-success';
      status.style.display = 'block';
      setTimeout(() => { status.style.display = 'none'; }, 2000);
    });
  }

  // --- MIGRATION & INIT ---
  chrome.storage.local.get(null, (items) => {
    // Case 1: Already has profiles
    if (items.profiles && Array.isArray(items.profiles)) {
      profiles = items.profiles;
      activeProfileId = items.activeProfileId || profiles[0].id;
    }
    // Case 2: Legacy data (or fresh install)
    else {
      const initialData = {
        name: items.name || '',
        email: items.email || '',
        username: items.username || '',
        address: items.address || '',
        password: items.password || '',
        phone: items.phone || '',
        whatsapp: items.whatsapp || '',
        customFields: items.customFields || []
      };

      const newId = generateUUID();
      profiles = [{ id: newId, name: DEFAULT_PROFILE_NAME, data: initialData }];
      activeProfileId = newId;

      // Save immediately to complete migration
      chrome.storage.local.set({ profiles, activeProfileId });
      // Clean up old keys? Optional. Let's keep them for safety or delete.
      // chrome.storage.local.remove(['name', 'email', ...]); 
    }

    renderProfileOptions();
    const activeProfile = profiles.find(p => p.id === activeProfileId) || profiles[0];
    setFormData(activeProfile.data);
  });

  // --- EVENT LISTENERS ---

  // Switch Profile
  profileSelector.addEventListener('change', (e) => {
    // Save previous profile state first? 
    // Ideally yes, but users might expect "Cancel" behavior if they didn't hit save.
    // However, standard specific-save buttons usually imply manual saving.
    // Let's AUTO-SAVE on switch to be user friendly, or warn?
    // User asked for "add multiple profile", standard pattern is auto-save or simple switch.
    // Let's implement: "Save Current" -> Switch. OR just load new one.
    // Let's stick to EXPLICIT SAVE for now, meaning if you switch without saving, you lose unsaved edits. 

    activeProfileId = e.target.value;
    const profile = profiles.find(p => p.id === activeProfileId);
    if (profile) {
      setFormData(profile.data);
      // Update active ID in storage so background knows
      chrome.storage.local.set({ activeProfileId });
    }
  });

  // Add Profile
  addBtn.addEventListener('click', () => {
    const name = prompt("Enter profile name:", "Work");
    if (name) {
      const newId = generateUUID();
      const newProfile = {
        id: newId,
        name: name,
        data: {} // Start empty
      };
      profiles.push(newProfile);
      activeProfileId = newId;
      renderProfileOptions();
      setFormData({});
      saveToStorage(`Profile "${name}" created!`);
    }
  });

  // Delete Profile
  deleteBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to delete this profile?")) {
      profiles = profiles.filter(p => p.id !== activeProfileId);
      activeProfileId = profiles[0].id; // Fallback to first
      renderProfileOptions();
      setFormData(profiles[0].data);
      saveToStorage("Profile deleted.");
    }
  });

  // Save Button
  document.getElementById('save').addEventListener('click', () => {
    saveToStorage();
  });

  // Add Custom Field UI
  document.getElementById('add-custom-field').addEventListener('click', () => addCustomFieldUI());

  // Fill Form Button
  fillBtn.addEventListener('click', () => {
    // We need to send the CURRENTLY DISPLAYED data, or the saved data?
    // usually saved data.

    // Ensure we are using the Active Profile's data as source of truth
    // But we should also sync background to know what is active.

    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (!tabs[0]) return;
      chrome.tabs.sendMessage(tabs[0].id, { action: "fill_forms" }, function (response) {
        // handled in background/content
      });
    });
  });
});
