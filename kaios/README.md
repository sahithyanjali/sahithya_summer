# Sphoorthi Seva Trust — KaiOS & JioPhone Application

Official lightweight **KaiOS 2.5 / 3.0** application for **Sphoorthi Seva Trust (Reg: 402/2021)** designed for smart feature phones (JioPhone, Nokia 2720 Flip, Nokia 800 Tough).

## Highlights
- **240x320 Screen Precision**: Strict layout geometry optimized for compact physical key-operated displays.
- **Physical D-Pad Navigation**: Full arrow-key selection (`ArrowUp`, `ArrowDown`, `Enter/CenterKey`) with auto-scrolling into view.
- **Dedicated SoftKeys**:
  - `SoftLeft` (or `F1`): Quick Seva Donation trigger via USSD/UPI
  - `CenterKey` (`Enter`): Select / Open active drive
  - `SoftRight` (`F2`): Real-time backend synchronization
- **Ultra-low payload**: Less than 35KB total bundle size, designed to run smoothly on 2G/3G connections in rural Karnataka.

## Project Structure
```text
kaios/
├── manifest.webapp                       # KaiOS application definition & permissions
├── index.html                            # 240x320 semantic HTML layout
├── package.json                          # Packaging scripts
├── README.md                             # KaiStore deployment guide
├── css/
│   └── kaios.css                         # Focused high-contrast outline & pinned softkey bar
└── js/
    ├── dpad_navigation.js                # Keydown event listener for keypad buttons
    └── app.js                            # REST API sync & offline fallback logic
```

## Running in the KaiOS Simulator or Browser
1. Open `kaios/index.html` in any modern browser.
2. Toggle Device Emulation in Chrome DevTools to `240 x 320`.
3. Use the keyboard Arrow Up / Down keys to navigate, Enter to select, `F1` for Left SoftKey, `F2` for Right SoftKey.
4. To package for JioStore / KaiStore submission:
   ```bash
   npm run package
   ```
