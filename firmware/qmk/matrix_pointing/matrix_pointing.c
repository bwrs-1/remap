// Matrix pointing settings for QMK (touchpad + auto mouse layer).
// See matrix_pointing.h and README.md next to this file.
//
// SPDX-License-Identifier: GPL-2.0-or-later
#include "matrix_pointing.h"

#include <stddef.h>
#include <stdlib.h>
#include <string.h>

#include "eeconfig.h"
#include "via.h"

#if defined(POINTING_DEVICE_DRIVER_cirque_pinnacle_i2c) || defined(POINTING_DEVICE_DRIVER_cirque_pinnacle_spi)
#    include "drivers/sensors/cirque_pinnacle_gestures.h"
#    define MP_CIRQUE
#endif

#if (EECONFIG_USER_DATA_SIZE) < (MATRIX_POINTING_EEPROM_OFFSET + MATRIX_POINTING_EEPROM_SIZE)
#    error "Set EECONFIG_USER_DATA_SIZE to at least MATRIX_POINTING_EEPROM_SIZE in config.h"
#endif

// QMK changed the user datablock API: newer versions take (data, offset,
// length) and define eeconfig_read_user_datablock_field; older ones read and
// write the whole block with (data) only.
#ifdef eeconfig_read_user_datablock_field
#    define MP_EEPROM_READ(cfg) eeconfig_read_user_datablock(&(cfg), MATRIX_POINTING_EEPROM_OFFSET, sizeof(cfg))
#    define MP_EEPROM_WRITE(cfg) eeconfig_update_user_datablock(&(cfg), MATRIX_POINTING_EEPROM_OFFSET, sizeof(cfg))
#else
#    if MATRIX_POINTING_EEPROM_OFFSET != 0
#        error "MATRIX_POINTING_EEPROM_OFFSET needs the newer QMK datablock API"
#    endif
// The legacy API always copies the whole EECONFIG_USER_DATA_SIZE block, so go
// through a buffer of that size (mp_config_t may be smaller).
#    define MP_EEPROM_READ(cfg)                                 \
        do {                                                    \
            uint8_t mp_buf[EECONFIG_USER_DATA_SIZE];            \
            eeconfig_read_user_datablock(mp_buf);               \
            memcpy(&(cfg), mp_buf, sizeof(cfg));                \
        } while (0)
#    define MP_EEPROM_WRITE(cfg)                                \
        do {                                                    \
            uint8_t mp_buf[EECONFIG_USER_DATA_SIZE];            \
            eeconfig_read_user_datablock(mp_buf);               \
            memcpy(mp_buf, &(cfg), sizeof(cfg));                \
            eeconfig_update_user_datablock(mp_buf);             \
        } while (0)
#endif

#define MP_MAGIC 0x4D58 // 'MX'
#define MP_VERSION 1

// Layout of the persisted settings. Append new fields at the end and bump
// MP_VERSION; never reorder (values stored in EEPROM would be misread).
typedef struct __attribute__((packed)) {
    uint8_t  version;
    // Touchpad
    uint16_t cpi;
    uint8_t  acceleration;
    uint8_t  glide;
    uint8_t  rotation; // 0: 0deg, 1: 90deg, 2: 180deg, 3: 270deg
    uint8_t  invert_x;
    uint8_t  invert_y;
    uint8_t  tap_to_click;
    uint8_t  two_finger_tap;
    uint8_t  tap_drag;
    uint16_t tap_term;
    uint8_t  scroll_mode; // 0: two finger, 1: circular, 2: edge
    uint8_t  scroll_divisor;
    uint8_t  natural_scroll;
    uint8_t  horizontal_scroll;
    uint8_t  sensitivity; // 0..3 = 1x..4x
    // Auto mouse layer
    uint8_t  am_enabled;
    uint8_t  am_layer;
    uint8_t  am_threshold;
    uint16_t am_timeout;
    uint16_t am_activation_delay;
    uint8_t  am_debounce;
    uint8_t  am_exit_on_other_key;
    uint8_t  am_hold_with_modifiers;
} mp_config_t;

_Static_assert(sizeof(mp_config_t) <= MATRIX_POINTING_EEPROM_SIZE, "mp_config_t does not fit MATRIX_POINTING_EEPROM_SIZE");

#ifndef MATRIX_POINTING_DEFAULT_ACCELERATION
#    define MATRIX_POINTING_DEFAULT_ACCELERATION 1
#endif
#ifndef MATRIX_POINTING_DEFAULT_AM_LAYER
#    define MATRIX_POINTING_DEFAULT_AM_LAYER 3
#endif

// Defaults match the Matrix editor's defaults (the auto mouse layer can be
// set per keyboard with MATRIX_POINTING_DEFAULT_AM_LAYER).
static const mp_config_t mp_defaults = {
    .version                = MP_VERSION,
    .cpi                    = 1600,
    .acceleration           = MATRIX_POINTING_DEFAULT_ACCELERATION,
    .glide                  = 0,
    .rotation               = 0,
    .invert_x               = 0,
    .invert_y               = 0,
    .tap_to_click           = 1,
    .two_finger_tap         = 1,
    .tap_drag               = 0,
    .tap_term               = 200,
    .scroll_mode            = 0,
    .scroll_divisor         = 8,
    .natural_scroll         = 0,
    .horizontal_scroll      = 1,
    .sensitivity            = 1,
    .am_enabled             = 1,
    .am_layer               = MATRIX_POINTING_DEFAULT_AM_LAYER,
    .am_threshold           = 10,
    .am_timeout             = 650,
    .am_activation_delay    = 200,
    .am_debounce            = 25,
    .am_exit_on_other_key   = 1,
    .am_hold_with_modifiers = 1,
};

static mp_config_t mp_config;
static bool        mp_loaded = false;

// Writing any value to 0x7F reboots into the bootloader (RP2040: BOOTSEL),
// so the editor can flash new firmware over WebUSB.
#define MP_BOOTLOADER_VALUE_ID 0x7F
#define MP_BOOTLOADER_DELAY_MS 100
static bool     mp_bootloader_requested = false;
static uint16_t mp_bootloader_time      = 0;

// Value IDs on the VIA custom channel. Must match the editor
// (src/services/pointing/PointingSettings.ts).
typedef struct {
    uint8_t  id;
    uint8_t  size;
    uint16_t min;
    uint16_t max;
    uint8_t  offset;
} mp_field_t;

#define MP_FIELD(_id, _field, _min, _max) \
    { .id = (_id), .size = sizeof(((mp_config_t *)0)->_field), .min = (_min), .max = (_max), .offset = offsetof(mp_config_t, _field) }

static const mp_field_t mp_fields[] = {
    MP_FIELD(0x01, cpi, 400, 3200),
    MP_FIELD(0x02, acceleration, 0, 1),
    MP_FIELD(0x03, glide, 0, 1),
    MP_FIELD(0x04, rotation, 0, 3),
    MP_FIELD(0x05, invert_x, 0, 1),
    MP_FIELD(0x06, invert_y, 0, 1),
    MP_FIELD(0x07, tap_to_click, 0, 1),
    MP_FIELD(0x08, two_finger_tap, 0, 1),
    MP_FIELD(0x09, tap_drag, 0, 1),
    MP_FIELD(0x0A, tap_term, 100, 400),
    MP_FIELD(0x0B, scroll_mode, 0, 2),
    MP_FIELD(0x0C, scroll_divisor, 1, 32),
    MP_FIELD(0x0D, natural_scroll, 0, 1),
    MP_FIELD(0x0E, horizontal_scroll, 0, 1),
    MP_FIELD(0x0F, sensitivity, 0, 3),
    MP_FIELD(0x20, am_enabled, 0, 1),
    MP_FIELD(0x21, am_layer, 1, 31),
    MP_FIELD(0x22, am_threshold, 1, 50),
    MP_FIELD(0x23, am_timeout, 200, 3000),
    MP_FIELD(0x24, am_activation_delay, 0, 1000),
    MP_FIELD(0x25, am_debounce, 0, 100),
    MP_FIELD(0x26, am_exit_on_other_key, 0, 1),
    MP_FIELD(0x27, am_hold_with_modifiers, 0, 1),
};

static const mp_field_t *mp_find_field(uint8_t id) {
    for (uint8_t i = 0; i < ARRAY_SIZE(mp_fields); i++) {
        if (mp_fields[i].id == id) return &mp_fields[i];
    }
    return NULL;
}

static uint16_t mp_read_field(const mp_field_t *field) {
    const uint8_t *base = (const uint8_t *)&mp_config + field->offset;
    if (field->size == 2) {
        uint16_t value;
        memcpy(&value, base, sizeof(value));
        return value;
    }
    return *base;
}

static void mp_write_field(const mp_field_t *field, uint16_t value) {
    if (value < field->min) value = field->min;
    if (value > field->max) value = field->max;
    uint8_t *base = (uint8_t *)&mp_config + field->offset;
    if (field->size == 2) {
        memcpy(base, &value, sizeof(value));
    } else {
        *base = (uint8_t)value;
    }
}

// Applies the settings that QMK can change at runtime. Settings without a
// runtime API are stored and echoed back so the editor stays in sync.
static void mp_apply(void) {
#ifdef POINTING_DEVICE_ENABLE
    pointing_device_set_cpi(mp_config.cpi);
#endif
#ifdef MP_CIRQUE
#    ifdef POINTING_DEVICE_GESTURES_CURSOR_GLIDE_ENABLE
    cirque_pinnacle_enable_cursor_glide(mp_config.glide);
#    endif
#    if defined(CIRQUE_PINNACLE_TAP_ENABLE) && CIRQUE_PINNACLE_POSITION_MODE
    cirque_pinnacle_enable_tap(mp_config.tap_to_click);
#    endif
#    ifdef CIRQUE_PINNACLE_CIRCULAR_SCROLL_ENABLE
    cirque_pinnacle_enable_circular_scroll(mp_config.scroll_mode == 1);
#    endif
#endif
#ifdef POINTING_DEVICE_AUTO_MOUSE_ENABLE
    set_auto_mouse_layer(mp_config.am_layer);
#    ifndef MATRIX_POINTING_LEGACY_AUTO_MOUSE
    // Older QMK has no runtime setters for these (AUTO_MOUSE_TIME /
    // AUTO_MOUSE_DEBOUNCE are compile-time there): define
    // MATRIX_POINTING_LEGACY_AUTO_MOUSE if the build cannot find them.
    set_auto_mouse_timeout(mp_config.am_timeout);
    set_auto_mouse_debounce(mp_config.am_debounce);
#    endif
    set_auto_mouse_enable(mp_config.am_enabled);
#endif
}

static void mp_load(void) {
    mp_loaded = true;
    MP_EEPROM_READ(mp_config);
    if (mp_config.version != MP_VERSION) {
        mp_config = mp_defaults;
        MP_EEPROM_WRITE(mp_config);
    }
    // Re-clamp everything in case the stored bytes are out of range.
    for (uint8_t i = 0; i < ARRAY_SIZE(mp_fields); i++) {
        mp_write_field(&mp_fields[i], mp_read_field(&mp_fields[i]));
    }
}

// Drivers may ask for settings before keyboard_post_init_user() runs.
static void mp_ensure_loaded(void) {
    if (!mp_loaded) mp_load();
}

uint16_t matrix_pointing_get_cpi(void) {
    mp_ensure_loaded();
    return mp_config.cpi;
}

void matrix_pointing_init(void) {
    mp_load();
    mp_apply();
}

// ---------------------------------------------------------------------------
// VIA custom channel (channel 0)
// data = [ command_id, channel_id, value_id, value_data... ]

#ifndef MATRIX_POINTING_NO_VIA_HOOK
void via_custom_value_command_kb(uint8_t *data, uint8_t length) {
    uint8_t *command_id = &(data[0]);
    uint8_t *channel_id = &(data[1]);
    uint8_t *value_id   = &(data[2]);
    uint8_t *value_data = &(data[3]);

    if (*channel_id != id_custom_channel) {
        *command_id = id_unhandled;
        return;
    }

    switch (*command_id) {
        case id_custom_get_value: {
            if (*value_id == 0x00) {
                value_data[0] = MP_MAGIC >> 8;
                value_data[1] = MP_MAGIC & 0xFF;
                return;
            }
            const mp_field_t *field = mp_find_field(*value_id);
            if (field == NULL) {
                *command_id = id_unhandled;
                return;
            }
            uint16_t value = mp_read_field(field);
            if (field->size == 2) {
                value_data[0] = value >> 8;
                value_data[1] = value & 0xFF;
            } else {
                value_data[0] = value & 0xFF;
            }
            return;
        }
        case id_custom_set_value: {
            if (*value_id == MP_BOOTLOADER_VALUE_ID) {
                // Reply first; the reboot happens shortly after in
                // matrix_pointing_task() so the editor gets the echo.
                mp_bootloader_requested = true;
                mp_bootloader_time      = timer_read();
                return;
            }
            const mp_field_t *field = mp_find_field(*value_id);
            if (field == NULL) {
                *command_id = id_unhandled;
                return;
            }
            uint16_t value = field->size == 2 ? (uint16_t)((value_data[0] << 8) | value_data[1]) : value_data[0];
            mp_write_field(field, value);
            mp_apply();
            return;
        }
        case id_custom_save:
            MP_EEPROM_WRITE(mp_config);
            return;
        default:
            *command_id = id_unhandled;
            return;
    }
}
#endif // MATRIX_POINTING_NO_VIA_HOOK

// ---------------------------------------------------------------------------
// Pointing report transform (rotation, inversion, acceleration, scroll)

static void mp_bootloader_check(void) {
    if (mp_bootloader_requested && timer_elapsed(mp_bootloader_time) > MP_BOOTLOADER_DELAY_MS) {
        mp_bootloader_requested = false;
        reset_keyboard(); // enters the bootloader (BOOTSEL on RP2040)
    }
}

#ifdef POINTING_DEVICE_ENABLE
static mouse_xy_report_t mp_clamp_xy(int32_t v) {
    if (v < MOUSE_REPORT_XY_MIN) return MOUSE_REPORT_XY_MIN;
    if (v > MOUSE_REPORT_XY_MAX) return MOUSE_REPORT_XY_MAX;
    return (mouse_xy_report_t)v;
}

static mouse_hv_report_t mp_clamp_hv(int32_t v) {
    // mouse_hv_report_t is int8_t or int16_t depending on the build.
    const int32_t max = sizeof(mouse_hv_report_t) == 1 ? INT8_MAX : INT16_MAX;
    if (v < -max) return (mouse_hv_report_t)-max;
    if (v > max) return (mouse_hv_report_t)max;
    return (mouse_hv_report_t)v;
}

report_mouse_t matrix_pointing_task(report_mouse_t r) {
    mp_ensure_loaded();
    mp_bootloader_check();
    int32_t x = r.x;
    int32_t y = r.y;

    // Same convention as QMK's POINTING_DEVICE_ROTATION_*.
    switch (mp_config.rotation) {
        case 1: { int32_t t = x; x = y;  y = -t; break; }
        case 2: { x = -x; y = -y; break; }
        case 3: { int32_t t = x; x = -y; y = t;  break; }
        default: break;
    }
    if (mp_config.invert_x) x = -x;
    if (mp_config.invert_y) y = -y;

    if (mp_config.acceleration) {
        // Up to 3x for fast movement: factor = 1 + min(speed, 32) / 16.
        int32_t speed = abs(x) + abs(y);
        if (speed > 32) speed = 32;
        x = x * (16 + speed) / 16;
        y = y * (16 + speed) / 16;
    }
    r.x = mp_clamp_xy(x);
    r.y = mp_clamp_xy(y);

    // Scroll speed: divisor 8 keeps the original speed; 4 is 2x, 16 is 0.5x.
    static int32_t acc_h = 0, acc_v = 0;
    int32_t h = mp_config.horizontal_scroll ? r.h : 0;
    int32_t v = r.v;
    if (mp_config.natural_scroll) {
        h = -h;
        v = -v;
    }
    acc_h += h * 8;
    acc_v += v * 8;
    r.h = mp_clamp_hv(acc_h / mp_config.scroll_divisor);
    r.v = mp_clamp_hv(acc_v / mp_config.scroll_divisor);
    acc_h %= mp_config.scroll_divisor;
    acc_v %= mp_config.scroll_divisor;
    return r;
}
#else
report_mouse_t matrix_pointing_task(report_mouse_t r) {
    mp_bootloader_check();
    return r;
}
#endif // POINTING_DEVICE_ENABLE

// ---------------------------------------------------------------------------
// Auto mouse layer: runtime threshold / delay / exit rules

static uint16_t mp_last_key_time = 0;
static bool     mp_key_pressed   = false;

bool matrix_pointing_process_record(uint16_t keycode, keyrecord_t *record) {
    if (record->event.pressed && !matrix_pointing_is_mouse_record(keycode, record)) {
        mp_last_key_time = timer_read();
        mp_key_pressed   = true;
    }
    return true;
}

bool matrix_pointing_is_mouse_record(uint16_t keycode, keyrecord_t *record) {
    // Keys reported as "mouse keys" do not end the auto mouse layer.
    if (!mp_config.am_exit_on_other_key) return true;
    if (mp_config.am_hold_with_modifiers && IS_MODIFIER_KEYCODE(keycode)) return true;
    return false;
}

#if defined(POINTING_DEVICE_AUTO_MOUSE_ENABLE) && !defined(MATRIX_POINTING_NO_MOUSE_RECORD)
bool is_mouse_record_user(uint16_t keycode, keyrecord_t *record) {
    return matrix_pointing_is_mouse_record(keycode, record);
}
#endif

#ifdef POINTING_DEVICE_AUTO_MOUSE_ENABLE
// Overrides QMK's weak default to use the runtime threshold and delay.
bool auto_mouse_activation(report_mouse_t mouse_report) {
    static int32_t total_x = 0, total_y = 0, total_h = 0, total_v = 0;
    if (mp_key_pressed && timer_elapsed(mp_last_key_time) < mp_config.am_activation_delay) {
        total_x = total_y = total_h = total_v = 0;
        return false;
    }
    total_x += mouse_report.x;
    total_y += mouse_report.y;
    total_h += mouse_report.h;
    total_v += mouse_report.v;
    const int32_t threshold = mp_config.am_threshold;
    bool          activate  = abs(total_x) > threshold || abs(total_y) > threshold || abs(total_h) > threshold || abs(total_v) > threshold || mouse_report.buttons;
    // Start counting again after each activation.
    if (activate) total_x = total_y = total_h = total_v = 0;
    return activate;
}
#endif // POINTING_DEVICE_AUTO_MOUSE_ENABLE
