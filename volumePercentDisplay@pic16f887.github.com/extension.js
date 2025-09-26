import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension, InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { OsdWindowManager as OsdWindowManagerOrig, OsdWindow } from "resource:///org/gnome/shell/ui/osdWindow.js";

export default class VolumePercentExtension extends Extension {
    enable() {
        this._settings = this.getSettings();
        this._injectionManager = new InjectionManager();
        this._osdWindows = [];
        Main.layoutManager.connect('monitors-changed',
        this._monitorsChanged.bind(this));

        this._percent_label_position = this._settings.get_boolean('position-right-bottom');
        this._monitorsChanged();

        this._injectionManager.overrideMethod(OsdWindowManagerOrig.prototype, '_showOsdWindow',
            originalMethod => {
                return (monitorIndex, icon, label, level, maxLevel) => {
                    maxLevel = Number.isFinite(maxLevel) ? maxLevel : 1;
                    this._osdWindows[monitorIndex].setIcon(icon);
                    this._osdWindows[monitorIndex].setLabel(typeof label === "string" ? label : "");
                    this._osdWindows[monitorIndex]._setLabelPercent(Math.round(level / maxLevel * 100).toString() + '%');
                    this._osdWindows[monitorIndex].setMaxLevel(maxLevel);
                    this._osdWindows[monitorIndex].setLevel(level);
                    this._osdWindows[monitorIndex].show();
                };
            });
    }

    _monitorsChanged() {
        for (let i = 0; i < Main.layoutManager.monitors.length; i++) {
            if (this._osdWindows[i] === undefined)
                this._osdWindows[i] = new VolumePercentOsdWindow(i, this._settings);
        }

        for (let i = Main.layoutManager.monitors.length; i < this._osdWindows.length; i++) {
            this._osdWindows[i].destroy();
            this._osdWindows[i] = null;
        }

        this._osdWindows.length = Main.layoutManager.monitors.length;
    }

    disable() {
        this._injectionManager.clear();
        this._injectionManager = null;

        for (let i = 0; i < this._osdWindows.length; i++) {
            this._osdWindows[i].destroy();
            this._osdWindows[i] = null;
        }
    }
}

export const VolumePercentOsdWindow = GObject.registerClass(
    class VolumePercentOsdWindow extends OsdWindow {
    _init(monitorIndex, settings) {
        super._init(monitorIndex)
        this._settings = settings;
        this._percent_label_position = this._settings.get_boolean('position-right-bottom');

        this._settings.connect('changed::position-right-bottom', this._positionMoved.bind(this));

        this._label_percent = new St.Label();
        this._vbox.add_style_class_name('osd-window-box');
        this._label.add_style_class_name('osd-window-label');

        if (this._percent_label_position) {
            this._vbox.add_child(this._label_percent);
        } else {
            this._empty_box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                y_align: Clutter.ActorAlign.CENTER,
                height: this._label.height,
            });
            this._vbox.add_child(this._empty_box);

            this._right_box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._right_box.add_child(this._label_percent);

            this._hbox.add_child(this._right_box);
        }
    }

    _positionMoved() {
        this._percent_label_position = this._settings.get_boolean('position-right-bottom');

        if (this._percent_label_position) {
            if (this._vbox.get_last_child() === this._empty_box) {
                this._vbox.remove_child(this._empty_box);
                this._empty_box.destroy();
            }

            if (this._right_box.get_last_child() === this._label_percent) {
                this._right_box.remove_child(this._label_percent);
            }

            if (this._hbox.get_last_child() === this._right_box) {
                this._hbox.remove_child(this._right_box);
                this._right_box.destroy();
            }

            this._vbox.add_child(this._label_percent);
        } else {
            if (this._vbox.get_last_child() === this._label_percent) {
                this._vbox.remove_child(this._label_percent);
            }

            this._empty_box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                y_align: Clutter.ActorAlign.CENTER,
                height: this._label.height,
            });
            this._vbox.add_child(this._empty_box);

            this._right_box = new St.BoxLayout({
                orientation: Clutter.Orientation.VERTICAL,
                y_align: Clutter.ActorAlign.CENTER,
            });
            this._right_box.add_child(this._label_percent);

            this._hbox.add_child(this._right_box);
        }
    }

    _setLabelPercent(label) {
        this._label_percent.visible = label != null;
        if (this._label_percent.visible)
            this._label_percent.text = label;
        this._updateBoxVisibility();
    }
});
