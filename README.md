# Volume Percent Display

Shows volume percentage in the on-screen display (OSD) when adjusting volume.

This repository contains a GNOME Shell extension with the UUID:
`volumePercentDisplay@pic16f887.github.com`.

## Screenshots

|<img title="Horizontal" src="./images/volume_horizontal.png" alt="" width="325" height="">| <br> <img title="Vertical" src="./images/volume_vertical.png" alt="" width="325" height=""></br>|
|:-:|:-:|

## Features

- Displays the current volume percentage in the OSD while changing the system volume.
- Configurable placement: vertical or horizontal.
- Lightweight and unobtrusive.

## Installation

### From source (local install)

1. Copy the extension folder to your local GNOME extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions
   cp -r volumePercentDisplay@pic16f887.github.com ~/.local/share/gnome-shell/extensions/
   ```
2. Enable the extension:
   ```bash
   gnome-extensions enable volumePercentDisplay@pic16f887.github.com
   ```
3. Reload GNOME Shell:
   - On Xorg: press Alt+F2, type `r`, and press Enter.
   - On Wayland: log out and log back in.

## Settings

The extension provides preferences for placement:
- Orientation: choose Horizontal or Vertical placement of the percentage in the OSD.

Open preferences via:
- GNOME Extensions app, or
- Command line:
  ```bash
  gnome-extensions prefs volumePercentDisplay@pic16f887.github.com
  ```

## Usage

Once enabled, adjust your system volume (e.g., using your keyboard volume keys). The OSD will include a numeric percentage according to your placement preference.

## License

MIT License — see [LICENSE](./LICENSE) for details.
