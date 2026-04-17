import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VolumePercentDisplayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        window._settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: null,
            icon_name: null,
        });
        window.add(page);

        const volumePercentPosition = new Adw.PreferencesGroup({ title: _('Position')});
        volumePercentPosition.set_separate_rows?.(true);
        page.add(volumePercentPosition);

        const volumePositionSwitchRow = new Adw.SwitchRow({
            title: _('Volume percent position'),
            subtitle: _('Volume percent position right or bottom'),
        });

        volumePercentPosition.add(volumePositionSwitchRow);

        window._settings.bind('position-right-bottom', volumePositionSwitchRow, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    }
}
