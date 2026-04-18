import Clutter from 'gi://Clutter';
import GObject from 'gi://GObject';
import St from 'gi://St';

import * as Main from 'resource:///org/gnome/shell/ui/main.js';
import { Extension, InjectionManager } from 'resource:///org/gnome/shell/extensions/extension.js';
import { OsdWindowManager as OsdWindowManagerOrig, OsdWindow } from "resource:///org/gnome/shell/ui/osdWindow.js";

export default class VolumePercentExtension extends Extension {
    enable() {
        this._osdWindows = [];
        this._settings = this.getSettings();
        this._injectionManager = new InjectionManager();

        this._monitorsChangedId = Main.layoutManager.connect('monitors-changed',
            this._monitorsChanged.bind(this));

        this._monitorsChanged();

        this._injectionManager.overrideMethod(OsdWindowManagerOrig.prototype, '_showOsdWindow',
            originalMethod => {
                return (monitorIndex, icon, label, level, maxLevel) => {
                    maxLevel = Number.isFinite(maxLevel) && maxLevel !== 0 ? Math.abs(maxLevel) : 1;
                    const percentValue = Number.isFinite(level) ? Math.round(level / maxLevel * 100).toString() + '%' : null;
                    const sanitizedLabel = typeof label === "string" ? label : "";
                    const effectiveLabel = Number.isFinite(level) ? sanitizedLabel : null;

                    if (monitorIndex >= 0 && monitorIndex < this._osdWindows.length) {
                        this._osdWindows[monitorIndex]._setLabelPercent(percentValue);
                    }

                    originalMethod.call(this, monitorIndex, icon, effectiveLabel, level, maxLevel);
                };
            }
        );
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
        Main.layoutManager.disconnect(this._monitorsChangedId);
        this._monitorsChangedId = null;

        this._injectionManager.clear();
        this._injectionManager = null;

        for (let i = 0; i < this._osdWindows.length; i++) {
            this._osdWindows[i].destroy();
            this._osdWindows[i] = null;
        }
        this._osdWindows = null;

        this._settings = null;
    }
}

export const VolumePercentOsdWindow = GObject.registerClass(
    class VolumePercentOsdWindow extends OsdWindow {
    _init(monitorIndex, settings) {
        super._init(monitorIndex);
        this._settings = settings;
        this._percent_label_position = this._settings.get_boolean('position-right-bottom');
        this._positionRightBottomChangedId = this._settings.connect(
            'changed::position-right-bottom', this._positionMoved.bind(this)
        );

        this._label_percent = new St.Label();
        this._vbox.add_style_class_name('osd-window-box');
        this._label.add_style_class_name('osd-window-label');
        this._empty_box = null;
        this._right_box = null;

        this._positionMoved();
        this._resetPercentLabel();
    }

    _positionMoved() {
        this._percent_label_position = this._settings.get_boolean('position-right-bottom');

        if (this._percent_label_position) {
            this._clearLayout();

            if (!this._vbox.contains(this._label_percent)) {
                this._vbox.add_child(this._label_percent);
            }
        } else {
            if (this._vbox.contains(this._label_percent)) {
                this._vbox.remove_child(this._label_percent);
            }

            if (this._empty_box === null) {
                this._empty_box = new St.BoxLayout({
                    orientation: Clutter.Orientation.VERTICAL,
                    y_align: Clutter.ActorAlign.CENTER,
                    height: this._label.height,
                });
                this._vbox.add_child(this._empty_box);
            }

            if (this._right_box === null) {
                this._right_box = new St.BoxLayout({
                    orientation: Clutter.Orientation.VERTICAL,
                    y_align: Clutter.ActorAlign.CENTER,
                });
                this._right_box.add_child(this._label_percent);

                this._hbox.add_child(this._right_box);
            }
        }
    }

    _clearLayout() {
        if (this._empty_box !== null) {
            if (this._vbox.contains(this._empty_box)) {
                this._vbox.remove_child(this._empty_box);
            }
            this._empty_box.destroy();
            this._empty_box = null;
        }

        if (this._right_box !== null) {
            if (this._right_box.contains(this._label_percent)) {
                this._right_box.remove_child(this._label_percent);
            }

            if (this._hbox.contains(this._right_box)) {
                this._hbox.remove_child(this._right_box);
            }
            this._right_box.destroy();
            this._right_box = null;
        }
    }

    _setLabelPercent(label) {
        if (label === null) {
            this._clearLayout();

            if (this._vbox.contains(this._label_percent)) {
                this._vbox.remove_child(this._label_percent);
            }
        } else {
            if (!this._label_percent.get_parent()) {
                this._positionMoved();
            }

            this._label_percent.text = String(label);
            this._label_percent.visible = true;
        }
    }

    _resetPercentLabel() {
        this._setLabelPercent(null);
    }

    destroy() {
        if (this._positionRightBottomChangedId !== null) {
            this._settings.disconnect(this._positionRightBottomChangedId);
            this._positionRightBottomChangedId = null;
        }

        super.destroy();
    }
});
