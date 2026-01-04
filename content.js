function getAllInputs() {
    return Array.from(document.querySelectorAll('input, textarea, select'));
}

function getLabelText(input) {
    if (input.id) {
        const label = document.querySelector(`label[for="${input.id}"]`);
        if (label) return label.innerText.toLowerCase();
    }
    const parentLabel = input.closest('label');
    if (parentLabel) return parentLabel.innerText.toLowerCase();
    if (input.getAttribute('aria-label')) return input.getAttribute('aria-label').toLowerCase();
    if (input.placeholder) return input.placeholder.toLowerCase();
    return '';
}

function setNativeValue(element, value) {
    if (!value) return;
    const lastValue = element.value;
    element.value = value;
    const event = new Event('input', { bubbles: true });
    // Hack for React 15/16
    const tracker = element._valueTracker;
    if (tracker) {
        tracker.setValue(lastValue);
    }
    element.dispatchEvent(event);
    element.dispatchEvent(new Event('change', { bubbles: true }));
}

function matchAndFill(input, profile) {
    if (!profile) return;

    const type = input.type ? input.type.toLowerCase() : 'text';
    const name = input.name ? input.name.toLowerCase() : '';
    const id = input.id ? input.id.toLowerCase() : '';
    const label = getLabelText(input);
    const combinedAttrs = `${name} ${id} ${label}`;

    // 1. Password
    if (type === 'password') {
        if (profile.password) setNativeValue(input, profile.password);
        return;
    }

    // 2. Email
    if (type === 'email' || combinedAttrs.includes('email') || combinedAttrs.includes('e-mail')) {
        if (profile.email) setNativeValue(input, profile.email);
        return;
    }

    // 3. Phone / WhatsApp
    const isPhone = type === 'tel' || combinedAttrs.includes('phone') || combinedAttrs.includes('mobile');
    const isWhatsApp = combinedAttrs.includes('whatsapp') || combinedAttrs.includes('wa ');

    if (isWhatsApp) {
        if (profile.whatsapp) setNativeValue(input, profile.whatsapp);
        else if (profile.phone) setNativeValue(input, profile.phone);
        return;
    }

    if (isPhone) {
        if (profile.phone) setNativeValue(input, profile.phone);
        return;
    }

    // 4. Username
    if (combinedAttrs.includes('username') || combinedAttrs.includes('user name') || (combinedAttrs.includes('user') && !combinedAttrs.includes('address'))) {
        if (profile.username) setNativeValue(input, profile.username);
        return;
    }

    // 5. Address
    if (combinedAttrs.includes('address') || combinedAttrs.includes('location') || combinedAttrs.includes('street')) {
        if (profile.address) setNativeValue(input, profile.address);
        return;
    }

    // 6. Name
    const isName = (combinedAttrs.includes('name') || combinedAttrs.includes('full name')) &&
        !combinedAttrs.includes('username') &&
        !combinedAttrs.includes('file');

    if (isName) {
        if (profile.name) setNativeValue(input, profile.name);
        return;
    }

    // --- DYNAMIC FIELDS ---
    if (profile.customFields && Array.isArray(profile.customFields)) {
        for (const field of profile.customFields) {
            const key = field.key.toLowerCase();
            if (combinedAttrs.includes(key)) {
                setNativeValue(input, field.value);
                return;
            }
        }
    }
}

function fillForms() {
    // UPDATED: Now fetches 'profiles' and 'activeProfileId' instead of flat keys
    chrome.storage.local.get(['profiles', 'activeProfileId', 'name', 'email', 'username', 'address'], (result) => {
        let profileData = {};

        if (result.profiles && result.activeProfileId) {
            // New Multi-Profile Mode
            const activeProfile = result.profiles.find(p => p.id === result.activeProfileId);
            if (activeProfile) {
                profileData = activeProfile.data;
            }
        } else {
            // Fallback: Legacy Mode (if migration hasn't happened yet for some reason)
            profileData = {
                name: result.name,
                email: result.email,
                username: result.username,
                address: result.address,
                password: result.password, // Warning: password needed to be in get() list or it's undefined
                phone: result.phone,
                whatsapp: result.whatsapp,
                customFields: result.customFields
            };
        }

        const inputs = getAllInputs();
        inputs.forEach(input => {
            matchAndFill(input, profileData);
        });
    });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "fill_forms") {
        fillForms();
        sendResponse({ status: "done" });
    }
});
