# Auto Complete Form Extension

A simple yet powerful Google Chrome Extension to automatically fill web forms with your stored profile data. Designed to speed up repeated form filling for developers, testers, and power users.

<img src="images/icon128.png" width="64" height="64" alt="Icon">

## Features

- **Standard Fields**: Automatically detects and fills common fields:
  - Full Name
  - Email
  - Username
  - Address
  - Password
  - Phone Number
  - WhatsApp Number
- **Dynamic / Custom Fields**: Define your own key-value pairs (e.g., "Price", "Size", "Zip Code") to fill strictly matched fields.
- **Smart Detection**: Uses advanced heuristics to identify fields by `id`, `name`, `label`, `placeholder`, and `aria-label`.
- **Privacy Focused**: All data is stored locally in your browser's `chrome.storage.local`. No cloud sync, no tracking.
- **Context Menu**: Right-click on any page -> `Fill Form`.
- **Quick Action**: "Fill Form" button directly in the extension popup.

## Installation

Since this is a developer version (not yet on the Chrome Web Store), you need to load it as an "Unpacked Extension".

1.  Clone or download this repository.
2.  Open Google Chrome and navigate to `chrome://extensions`.
3.  Enable **Developer mode** in the top right corner.
4.  Click **Load unpacked**.
5.  Select the folder containing this project (the folder with `manifest.json`).

## Usage

### 1. Configure Your Profile
1.  Click the **Auto Complete Form** icon in your browser toolbar.
2.  Fill in your details (Name, Email, etc.).
3.  Add any **Custom Fields** you need (e.g., Key: `Employee ID`, Value: `12345`).
4.  Click **Save Profile**.

### 2. Fill a Form
1.  Navigate to a page with a form.
2.  **Option A**: Click the extension icon and press the green **Fill Form Info** button.
3.  **Option B**: Right-click anywhere on the page and select **Fill Form**.

## Development

### Project Structure
- `manifest.json`: Configuration and permissions (Manifest V3).
- `popup.html` & `popup.js`: The user interface for managing data.
- `content.js`: The script injected into pages to find and fill inputs.
- `background.js`: Handles the context menu events.

### Testing
A `test_form.html` is included to verify functionality. Open it in Chrome to test the auto-fill logic.

## License
MIT
