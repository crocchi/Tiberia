# Tiberia
AI TESTING PURPOSE GUIDE FOR CAPRI

## Browser Search Functionality Test

This document records the test of browser functionality to search for information.

### Test Executed
The following websites were tested using the Playwright browser tools:
- Google (https://www.google.com)
- DuckDuckGo (https://duckduckgo.com)
- Bing (https://www.bing.com)
- Wikipedia (https://en.wikipedia.org)
- GitHub (https://github.com)

### Results
The browser navigation functionality was successfully invoked using the Playwright MCP tools. However, external website access is restricted in this sandboxed environment for security purposes.

### Browser Tools Available
The following browser functions are available for use:
- `browser_navigate` - Navigate to a URL
- `browser_snapshot` - Capture accessibility snapshot
- `browser_click` - Click on elements
- `browser_type` - Type text into elements
- `browser_take_screenshot` - Capture screenshots
- `browser_fill_form` - Fill form fields

These tools can be used for web automation, testing, and information retrieval when external access is permitted.
