import Adw from 'gi://Adw';
import Gio from 'gi://Gio';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class VolumePercentDisplayPreferences extends ExtensionPreferences {
    fillPreferencesWindow(window) {
        const settings = this.getSettings();

        const page = new Adw.PreferencesPage({
            title: null,
            icon_name: null,
        });
        window.add(page);

        const volumePercentPosition = new Adw.PreferencesGroup({ title: _('Position')});
        volumePercentPosition.set_separate_rows?.(true);
        page.add(volumePercentPosition);

        const volumePositionSwitchRow = new Adw.SwitchRow({
            title: _('Show label below slider'),
            subtitle: _('When disabled, label appears to the right'),
        });

        volumePercentPosition.add(volumePositionSwitchRow);

        settings.bind('position-right-bottom', volumePositionSwitchRow, 'active',
        Gio.SettingsBindFlags.DEFAULT);
    }
}
