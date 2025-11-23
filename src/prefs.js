import Adw from 'gi://Adw';
import Gio from 'gi://Gio';
import Gtk from 'gi://Gtk';

import {ExtensionPreferences,
    gettext as _ } from 'resource:///org/gnome/Shell/Extensions/js/extensions/prefs.js';

export default class MonitorSmartSaverPreferences extends ExtensionPreferences {
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

        const volumeStepGroup = new Adw.PreferencesGroup({ title: _('Volume Control')});
        volumeStepGroup.set_separate_rows?.(true);
        page.add(volumeStepGroup);

        const volumeStepRow = new Adw.SpinRow({
            title: _('Volume step size'),
            subtitle: _('Percentage to increase/decrease volume with each key press'),
            adjustment: new Gtk.Adjustment({
                lower: 1,
                upper: 20,
                step_increment: 1,
            }),
        });

        volumeStepGroup.add(volumeStepRow);

        window._settings.bind('volume-step', volumeStepRow, 'value',
        Gio.SettingsBindFlags.DEFAULT);
    }
}
