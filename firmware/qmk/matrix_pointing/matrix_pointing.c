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
#define MP_VERSION 4
// Bytes of mp_config_t that earlier versions stored (index = version).
static const uint8_t mp_version_size[] = {0, 28, 39, 47};

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
    // --- version 2 ---
    // Tap-hold keys (LT / MT)
    uint16_t tapping_term;
    uint8_t  hold_mode; // 0: hold preferred, 1: balanced, 2: tap preferred
    // 3-finger swipe keycodes: left, right, up, down
    uint16_t swipe_kc[4];
    // --- version 3 ---
    // LED color per layer (RGB Matrix): 0 = keep the effect, 1 = off,
    // 2.. = red, green, yellow, blue, magenta, cyan, white
    uint8_t led_layer_color[8];
    // --- version 4 ---
    // Multitouch fork: 1 = act as a Windows precision touchpad when the
    // host asks for it (native gestures, but the host then gets digitizer
    // reports, so the auto mouse layer and the report transforms do not
    // apply). 0 = always send mouse reports.
    uint8_t precision_touchpad;
} mp_config_t;

_Static_assert(offsetof(mp_config_t, tapping_term) == 28, "version 1 layout changed");
_Static_assert(offsetof(mp_config_t, led_layer_color) == 39, "version 2 layout changed");
_Static_assert(offsetof(mp_config_t, precision_touchpad) == 47, "version 3 layout changed");

_Static_assert(sizeof(mp_config_t) <= MATRIX_POINTING_EEPROM_SIZE, "mp_config_t does not fit MATRIX_POINTING_EEPROM_SIZE");

// CPI range and default (some drivers clamp to their own range, e.g. the
// digitizer driver of the multitouch QMK fork: 50..1200).
#ifndef MATRIX_POINTING_CPI_MIN
#    define MATRIX_POINTING_CPI_MIN 400
#endif
#ifndef MATRIX_POINTING_CPI_MAX
#    define MATRIX_POINTING_CPI_MAX 3200
#endif
#ifndef MATRIX_POINTING_DEFAULT_CPI
#    define MATRIX_POINTING_DEFAULT_CPI 1600
#endif
#ifndef MATRIX_POINTING_DEFAULT_TAP_TERM
#    define MATRIX_POINTING_DEFAULT_TAP_TERM 200
#endif
#ifndef MATRIX_POINTING_DEFAULT_ACCELERATION
#    define MATRIX_POINTING_DEFAULT_ACCELERATION 1
#endif
#ifndef MATRIX_POINTING_DEFAULT_AM_LAYER
#    define MATRIX_POINTING_DEFAULT_AM_LAYER 3
#endif
#ifndef MATRIX_POINTING_DEFAULT_TAPPING_TERM
#    ifdef TAPPING_TERM
#        define MATRIX_POINTING_DEFAULT_TAPPING_TERM TAPPING_TERM
#    else
#        define MATRIX_POINTING_DEFAULT_TAPPING_TERM 200
#    endif
#endif
#define MP_HOLD_PREFERRED 0
#define MP_HOLD_BALANCED 1
#define MP_HOLD_TAP_PREFERRED 2
#ifndef MATRIX_POINTING_DEFAULT_HOLD_MODE
#    define MATRIX_POINTING_DEFAULT_HOLD_MODE MP_HOLD_TAP_PREFERRED // QMK's default
#endif
// Same defaults as the multitouch fork's DIGITIZER_SWIPE_*_KC.
#ifndef MATRIX_POINTING_DEFAULT_SWIPE_LEFT
#    define MATRIX_POINTING_DEFAULT_SWIPE_LEFT QK_MOUSE_BUTTON_3
#endif
#ifndef MATRIX_POINTING_DEFAULT_SWIPE_RIGHT
#    define MATRIX_POINTING_DEFAULT_SWIPE_RIGHT QK_MOUSE_BUTTON_4
#endif
#ifndef MATRIX_POINTING_DEFAULT_SWIPE_UP
#    define MATRIX_POINTING_DEFAULT_SWIPE_UP KC_LEFT_GUI
#endif
#ifndef MATRIX_POINTING_DEFAULT_SWIPE_DOWN
#    define MATRIX_POINTING_DEFAULT_SWIPE_DOWN KC_ESC
#endif

// Defaults match the Matrix editor's defaults (the auto mouse layer can be
// set per keyboard with MATRIX_POINTING_DEFAULT_AM_LAYER).
static const mp_config_t mp_defaults = {
    .version                = MP_VERSION,
    .cpi                    = MATRIX_POINTING_DEFAULT_CPI,
    .acceleration           = MATRIX_POINTING_DEFAULT_ACCELERATION,
    .glide                  = 0,
    .rotation               = 0,
    .invert_x               = 0,
    .invert_y               = 0,
    .tap_to_click           = 1,
    .two_finger_tap         = 1,
    .tap_drag               = 0,
    .tap_term               = MATRIX_POINTING_DEFAULT_TAP_TERM,
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
    .tapping_term           = MATRIX_POINTING_DEFAULT_TAPPING_TERM,
    .hold_mode              = MATRIX_POINTING_DEFAULT_HOLD_MODE,
    .swipe_kc               = {MATRIX_POINTING_DEFAULT_SWIPE_LEFT, MATRIX_POINTING_DEFAULT_SWIPE_RIGHT, MATRIX_POINTING_DEFAULT_SWIPE_UP, MATRIX_POINTING_DEFAULT_SWIPE_DOWN},
    .led_layer_color        = {0},
    .precision_touchpad     = 0,
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
    MP_FIELD(0x01, cpi, MATRIX_POINTING_CPI_MIN, MATRIX_POINTING_CPI_MAX),
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
    MP_FIELD(0x10, precision_touchpad, 0, 1),
    MP_FIELD(0x20, am_enabled, 0, 1),
    MP_FIELD(0x21, am_layer, 1, 31),
    MP_FIELD(0x22, am_threshold, 1, 50),
    MP_FIELD(0x23, am_timeout, 200, 3000),
    MP_FIELD(0x24, am_activation_delay, 0, 1000),
    MP_FIELD(0x25, am_debounce, 0, 100),
    MP_FIELD(0x26, am_exit_on_other_key, 0, 1),
    MP_FIELD(0x27, am_hold_with_modifiers, 0, 1),
    MP_FIELD(0x30, tapping_term, 100, 400),
    MP_FIELD(0x31, hold_mode, 0, 2),
    MP_FIELD(0x40, swipe_kc[0], 0, 0xFFFF),
    MP_FIELD(0x41, swipe_kc[1], 0, 0xFFFF),
    MP_FIELD(0x42, swipe_kc[2], 0, 0xFFFF),
    MP_FIELD(0x43, swipe_kc[3], 0, 0xFFFF),
    MP_FIELD(0x50, led_layer_color[0], 0, 8),
    MP_FIELD(0x51, led_layer_color[1], 0, 8),
    MP_FIELD(0x52, led_layer_color[2], 0, 8),
    MP_FIELD(0x53, led_layer_color[3], 0, 8),
    MP_FIELD(0x54, led_layer_color[4], 0, 8),
    MP_FIELD(0x55, led_layer_color[5], 0, 8),
    MP_FIELD(0x56, led_layer_color[6], 0, 8),
    MP_FIELD(0x57, led_layer_color[7], 0, 8),
};

// Read-only value 0x7E: which settings this build actually applies. Bit n
// of the low word = value ID n + 1 (touchpad 0x01..0x0F); the high word:
// bit 0 timing (0x30/0x31), bit 1 swipes (0x40..), bit 2 layer LEDs
// (0x50..), bit 3 combos (0x60/0x61), bit 4 the precision touchpad
// switch (0x10). Older firmware answers id_unhandled:
// the editor then assumes everything is applied.
#define MP_CAPABILITIES_VALUE_ID 0x7E
#define MP_CAP(id) (1UL << ((id) - 1))
static uint32_t mp_capabilities(void) {
    uint32_t caps = 0;
#ifdef POINTING_DEVICE_ENABLE
    // Applied by this module's report transform / QMK's CPI setting.
    caps |= MP_CAP(0x01) | MP_CAP(0x02) | MP_CAP(0x04) | MP_CAP(0x05) | MP_CAP(0x06) | MP_CAP(0x0C) | MP_CAP(0x0D) | MP_CAP(0x0E);
#endif
#ifdef POINTING_DEVICE_DRIVER_digitizer
    caps |= MP_CAP(0x08) | MP_CAP(0x09); // filtered in matrix_pointing_task()
#    ifdef DIGITIZER_MOUSE_TAP_DETECTION_TIMEOUT
    caps |= MP_CAP(0x07) | MP_CAP(0x0A); // through matrix_pointing_tap_term()
#    endif
#endif
#ifdef MP_CIRQUE
#    ifdef POINTING_DEVICE_GESTURES_CURSOR_GLIDE_ENABLE
    caps |= MP_CAP(0x03);
#    endif
#    if defined(CIRQUE_PINNACLE_TAP_ENABLE) && CIRQUE_PINNACLE_POSITION_MODE
    caps |= MP_CAP(0x07);
#    endif
#    ifdef CIRQUE_PINNACLE_CIRCULAR_SCROLL_ENABLE
    caps |= MP_CAP(0x0B);
#    endif
#endif
#ifdef POINTING_DEVICE_AUTO_MOUSE_ENABLE
    caps |= 0x8000; // marks that the auto mouse layer exists (not a touchpad ID)
#endif
#if defined(TAPPING_TERM_PER_KEY) && !defined(MATRIX_POINTING_NO_TAPPING_HOOKS)
    caps |= 1UL << 16;
#endif
#ifdef DIGITIZER_SWIPE_LEFT_KC
    caps |= 1UL << 17;
#endif
#if defined(RGB_MATRIX_ENABLE) && !defined(MATRIX_POINTING_NO_LED_HOOK)
    caps |= 1UL << 18;
#endif
#if defined(COMBO_ENABLE) && !defined(MATRIX_POINTING_NO_COMBOS)
    caps |= 1UL << 19;
#endif
#ifdef POINTING_DEVICE_DRIVER_digitizer
    caps |= 1UL << 20; // precision touchpad switch (0x10)
#endif
    return caps;
}

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
#    ifdef MATRIX_POINTING_NATIVE_CPI
    // Software speed: the driver keeps its own resolution (gestures such as
    // swipes and taps are measured in it) and the reports are scaled.
    pointing_device_set_cpi(MATRIX_POINTING_DRIVER_CPI);
#    else
    pointing_device_set_cpi(mp_config.cpi);
#    endif
#endif
#ifdef POINTING_DEVICE_DRIVER_digitizer
    // Multitouch QMK fork (digitizer mouse fallback): taps as clicks.
    // The tap timing is wired through DIGITIZER_MOUSE_TAP_DETECTION_TIMEOUT
    // (see matrix_pointing_tap_term() / README).
    extern bool digitizer_taps_as_clicks;
    digitizer_taps_as_clicks = mp_config.tap_to_click;
    // Windows switches a touchpad to digitizer reports; QMK's auto mouse
    // layer and this module only see mouse reports, so keep sending those
    // unless the precision touchpad mode is chosen.
    extern bool force_digitizer_send_mouse_reports;
    force_digitizer_send_mouse_reports = !mp_config.precision_touchpad;
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

static void mp_combos_load(void);
static void mp_combos_clear(void);
static void mp_split_register(void);
static void mp_config_changed(void);

static void mp_load(void) {
    mp_loaded = true;
    MP_EEPROM_READ(mp_config);
    if (mp_config.version >= 1 && mp_config.version < MP_VERSION) {
        // Keep the settings of the older version; new fields get defaults.
        mp_config_t migrated = mp_defaults;
        memcpy(&migrated, &mp_config, mp_version_size[mp_config.version]);
        migrated.version = MP_VERSION;
        mp_config        = migrated;
        MP_EEPROM_WRITE(mp_config);
    } else if (mp_config.version != MP_VERSION) {
        mp_config = mp_defaults;
        MP_EEPROM_WRITE(mp_config);
        mp_combos_clear();
    }
    mp_combos_load();
    // Re-clamp everything in case the stored bytes are out of range.
    for (uint8_t i = 0; i < ARRAY_SIZE(mp_fields); i++) {
        mp_write_field(&mp_fields[i], mp_read_field(&mp_fields[i]));
    }
}

// Drivers may ask for settings before keyboard_post_init_user() runs.
static void mp_ensure_loaded(void) {
    if (!mp_loaded) mp_load();
}

uint16_t matrix_pointing_tap_term(void) {
    mp_ensure_loaded();
    // With tap-to-click off no touch is short enough to count as a tap, so
    // the digitizer fallback never sends tap clicks (or tap-and-drag).
    return mp_config.tap_to_click ? mp_config.tap_term : 0;
}

uint16_t matrix_pointing_get_cpi(void) {
    mp_ensure_loaded();
    return mp_config.cpi;
}

uint16_t matrix_pointing_driver_cpi(void) {
#ifdef MATRIX_POINTING_NATIVE_CPI
    return MATRIX_POINTING_DRIVER_CPI;
#else
    return matrix_pointing_get_cpi();
#endif
}

void matrix_pointing_init(void) {
    mp_load();
    mp_apply();
    mp_split_register();
}

// ---------------------------------------------------------------------------
// Tap-hold timing (LT / MT keys)

uint16_t matrix_pointing_tapping_term(void) {
    mp_ensure_loaded();
    return mp_config.tapping_term;
}

uint8_t matrix_pointing_hold_mode(void) {
    mp_ensure_loaded();
    return mp_config.hold_mode;
}

#ifndef MATRIX_POINTING_NO_TAPPING_HOOKS
#    ifdef TAPPING_TERM_PER_KEY
uint16_t get_tapping_term(uint16_t keycode, keyrecord_t *record) {
    return matrix_pointing_tapping_term();
}
#    endif
#    ifdef PERMISSIVE_HOLD_PER_KEY
// "Balanced": a key pressed and released while the tap-hold key is held
// makes it a hold.
bool get_permissive_hold(uint16_t keycode, keyrecord_t *record) {
    return matrix_pointing_hold_mode() == MP_HOLD_BALANCED;
}
#    endif
#    ifdef HOLD_ON_OTHER_KEY_PRESS_PER_KEY
// "Hold preferred": any other key press makes it a hold right away.
bool get_hold_on_other_key_press(uint16_t keycode, keyrecord_t *record) {
    return matrix_pointing_hold_mode() == MP_HOLD_PREFERRED;
}
#    endif
#endif // MATRIX_POINTING_NO_TAPPING_HOOKS

// ---------------------------------------------------------------------------
// 3-finger swipes (multitouch fork): see MATRIX_POINTING_SWIPE_KC in the
// header. Sends the configured keycode (basic keycode with modifiers) and
// returns KC_NO, so the fork's own tap_code() does nothing.

static void mp_send_swipe(uint8_t direction) {
    if (direction >= ARRAY_SIZE(mp_config.swipe_kc)) return;
    const uint16_t keycode = mp_config.swipe_kc[direction];
    if (keycode != KC_NO && keycode <= QK_MODS_MAX) tap_code16(keycode);
}

#if defined(SPLIT_KEYBOARD) && defined(MATRIX_POINTING_SPLIT_SYNC)
static volatile uint8_t mp_pending_swipe = 0; // direction + 1, on the target half
#endif

uint8_t matrix_pointing_swipe(uint8_t direction) {
    mp_ensure_loaded();
#if defined(SPLIT_KEYBOARD) && defined(MATRIX_POINTING_SPLIT_SYNC)
    // Keys tapped on the half without USB never reach the host: hand the
    // swipe to the master (polled in matrix_pointing_housekeeping()).
    if (!is_keyboard_master()) {
        if (direction < ARRAY_SIZE(mp_config.swipe_kc)) mp_pending_swipe = direction + 1;
        return KC_NO;
    }
#endif
    mp_send_swipe(direction);
    return KC_NO;
}

// ---------------------------------------------------------------------------
// Split keyboards: the touchpad's gestures run on the half it is wired to.
// When USB is on the other half, settings changed from the editor only reach
// the master, so the master sends them over (and collects swipes).
//
// config.h:
//   #define MATRIX_POINTING_SPLIT_SYNC
//   #define SPLIT_TRANSACTION_IDS_USER MP_SYNC_CONFIG, MP_SYNC_SWIPE
//   #define RPC_M2S_BUFFER_SIZE 64

#if defined(SPLIT_KEYBOARD) && defined(MATRIX_POINTING_SPLIT_SYNC)
#    include "transactions.h"
_Static_assert(sizeof(mp_config_t) <= RPC_M2S_BUFFER_SIZE, "Set RPC_M2S_BUFFER_SIZE to at least 64 in config.h");

static uint8_t  mp_generation        = 1;
static uint8_t  mp_synced_generation = 0;
static uint16_t mp_last_sync         = 0;

static void mp_config_changed(void) {
    mp_generation++;
}

static void mp_sync_config_slave(uint8_t in_len, const void *in, uint8_t out_len, void *out) {
    if (in_len < sizeof(mp_config_t)) return;
    memcpy(&mp_config, in, sizeof(mp_config_t));
    mp_loaded = true;
#    ifdef POINTING_DEVICE_DRIVER_digitizer
    extern bool digitizer_taps_as_clicks;
    digitizer_taps_as_clicks = mp_config.tap_to_click;
    extern bool force_digitizer_send_mouse_reports;
    force_digitizer_send_mouse_reports = !mp_config.precision_touchpad;
#    endif
}

static void mp_sync_swipe_slave(uint8_t in_len, const void *in, uint8_t out_len, void *out) {
    if (out_len < 1) return;
    ((uint8_t *)out)[0] = mp_pending_swipe;
    mp_pending_swipe    = 0;
}

static void mp_split_register(void) {
    transaction_register_rpc(MP_SYNC_CONFIG, mp_sync_config_slave);
    transaction_register_rpc(MP_SYNC_SWIPE, mp_sync_swipe_slave);
}

void matrix_pointing_housekeeping(void) {
    if (!is_keyboard_master()) return;
    mp_ensure_loaded();
    // Send on change, and every 2 s in case the other half restarted.
    if (mp_synced_generation != mp_generation || timer_elapsed(mp_last_sync) > 2000) {
        mp_last_sync = timer_read();
        if (transaction_rpc_send(MP_SYNC_CONFIG, sizeof(mp_config_t), &mp_config)) {
            mp_synced_generation = mp_generation;
        }
    }
    static uint16_t last_poll = 0;
    if (timer_elapsed(last_poll) >= 20) {
        last_poll         = timer_read();
        uint8_t direction = 0;
        if (transaction_rpc_recv(MP_SYNC_SWIPE, sizeof(direction), &direction) && direction) {
            mp_send_swipe(direction - 1);
        }
    }
}
#else
static void mp_config_changed(void) {}
static void mp_split_register(void) {}
void        matrix_pointing_housekeeping(void) {}
#endif

#ifndef MATRIX_POINTING_NO_HOUSEKEEPING
void housekeeping_task_user(void) {
    matrix_pointing_housekeeping();
}
#endif

// ---------------------------------------------------------------------------
// LED color per layer (RGB Matrix)

#if defined(RGB_MATRIX_ENABLE) && !defined(MATRIX_POINTING_NO_LED_HOOK)
// Index 2.. of led_layer_color: hue / saturation (QMK HSV).
static const uint8_t mp_led_hs[][2] = {
    {0, 255},   // red
    {85, 255},  // green
    {43, 255},  // yellow
    {170, 255}, // blue
    {213, 255}, // magenta
    {128, 255}, // cyan
    {0, 0},     // white
};

bool matrix_pointing_rgb_indicators(uint8_t led_min, uint8_t led_max) {
    mp_ensure_loaded();
    const uint8_t layer = get_highest_layer(layer_state | default_layer_state);
    if (layer >= ARRAY_SIZE(mp_config.led_layer_color)) return true;
    const uint8_t color = mp_config.led_layer_color[layer];
    if (color == 0) return true; // keep the running effect
    rgb_t rgb = {0, 0, 0};
    if (color >= 2 && color - 2 < (int)ARRAY_SIZE(mp_led_hs)) {
        hsv_t hsv = {mp_led_hs[color - 2][0], mp_led_hs[color - 2][1], rgb_matrix_get_val()};
        rgb       = hsv_to_rgb(hsv);
    }
    for (uint8_t i = led_min; i < led_max; i++) {
        rgb_matrix_set_color(i, rgb.r, rgb.g, rgb.b);
    }
    return false;
}

bool rgb_matrix_indicators_advanced_user(uint8_t led_min, uint8_t led_max) {
    return matrix_pointing_rgb_indicators(led_min, led_max);
}
#endif

// ---------------------------------------------------------------------------
// Combos stored in EEPROM, after the settings. Combos match the keycodes of
// layer 0 at the pressed positions (COMBO_ONLY_FROM_LAYER 0), so the editor
// can define them by key position.
//
// Value 0x60 (read): number of combo slots.
// Value 0x61: data[0] = slot; data[1..16] = keys[4], keycode, term (ms),
// all 16-bit big endian, then the layer mask (bit n = layer n, 0 = all).

#define MP_COMBO_KEYS 4
typedef struct __attribute__((packed)) {
    uint16_t keys[MP_COMBO_KEYS]; // KC_NO for unused
    uint16_t keycode;
    uint16_t term; // 0 = COMBO_TERM
    uint8_t  layers;
    uint8_t  reserved[3];
} mp_combo_entry_t;
_Static_assert(sizeof(mp_combo_entry_t) == 16, "combo entry size");

#if defined(COMBO_ENABLE) && !defined(MATRIX_POINTING_NO_COMBOS)
#    ifndef MATRIX_POINTING_COMBO_COUNT
#        define MATRIX_POINTING_COMBO_COUNT 16
#    endif
#    define MP_COMBO_EEPROM_OFFSET (MATRIX_POINTING_EEPROM_OFFSET + MATRIX_POINTING_EEPROM_SIZE)
#    if (EECONFIG_USER_DATA_SIZE) < (MATRIX_POINTING_EEPROM_OFFSET + MATRIX_POINTING_EEPROM_SIZE + MATRIX_POINTING_COMBO_COUNT * 16)
#        error "Set EECONFIG_USER_DATA_SIZE to MATRIX_POINTING_EEPROM_SIZE + MATRIX_POINTING_COMBO_COUNT * 16 (default 64 + 256 = 320)"
#    endif
#    ifndef eeconfig_read_user_datablock_field
#        error "Combos stored by matrix_pointing need the newer QMK datablock API"
#    endif
#    ifndef COMBO_ONLY_FROM_LAYER
#        error "Define COMBO_ONLY_FROM_LAYER 0 in config.h (combos are set by key position on layer 0)"
#    endif

static mp_combo_entry_t mp_combo_entries[MATRIX_POINTING_COMBO_COUNT];
static uint16_t         mp_combo_keys[MATRIX_POINTING_COMBO_COUNT][MP_COMBO_KEYS + 1];
static combo_t          mp_combos[MATRIX_POINTING_COMBO_COUNT];
static bool             mp_combos_dirty = false;

static void mp_combo_build(uint8_t i) {
    uint8_t n = 0;
    for (uint8_t k = 0; k < MP_COMBO_KEYS; k++) {
        if (mp_combo_entries[i].keys[k] != KC_NO) mp_combo_keys[i][n++] = mp_combo_entries[i].keys[k];
    }
    for (uint8_t k = n; k <= MP_COMBO_KEYS; k++) mp_combo_keys[i][k] = COMBO_END;
    memset(&mp_combos[i], 0, sizeof(combo_t));
    mp_combos[i].keys    = mp_combo_keys[i];
    mp_combos[i].keycode = mp_combo_entries[i].keycode;
    // A combo needs at least two keys and an output.
    mp_combos[i].disabled = n < 2 || mp_combo_entries[i].keycode == KC_NO;
}

static void mp_combos_load(void) {
    eeconfig_read_user_datablock(mp_combo_entries, MP_COMBO_EEPROM_OFFSET, sizeof(mp_combo_entries));
    for (uint8_t i = 0; i < MATRIX_POINTING_COMBO_COUNT; i++) mp_combo_build(i);
}

static void mp_combos_clear(void) {
    memset(mp_combo_entries, 0, sizeof(mp_combo_entries));
    eeconfig_update_user_datablock(mp_combo_entries, MP_COMBO_EEPROM_OFFSET, sizeof(mp_combo_entries));
}

static void mp_combos_save(void) {
    if (!mp_combos_dirty) return;
    mp_combos_dirty = false;
    eeconfig_update_user_datablock(mp_combo_entries, MP_COMBO_EEPROM_OFFSET, sizeof(mp_combo_entries));
}

static void mp_put16(uint8_t *p, uint16_t v) {
    p[0] = v >> 8;
    p[1] = v & 0xFF;
}
static uint16_t mp_get16(const uint8_t *p) {
    return (uint16_t)((p[0] << 8) | p[1]);
}

static bool mp_combo_get_value(uint8_t value_id, uint8_t *data, uint8_t length) {
    if (value_id == 0x60) {
        data[0] = MATRIX_POINTING_COMBO_COUNT;
        return true;
    }
    if (value_id != 0x61 || length < 17) return false;
    const uint8_t i = data[0];
    memset(data + 1, 0, 16);
    if (i >= MATRIX_POINTING_COMBO_COUNT) return true;
    const mp_combo_entry_t *e = &mp_combo_entries[i];
    for (uint8_t k = 0; k < MP_COMBO_KEYS; k++) mp_put16(data + 1 + k * 2, e->keys[k]);
    mp_put16(data + 9, e->keycode);
    mp_put16(data + 11, e->term);
    data[13] = e->layers;
    return true;
}

static bool mp_combo_set_value(uint8_t value_id, const uint8_t *data, uint8_t length) {
    if (value_id != 0x61) return false;
    if (length < 14 || data[0] >= MATRIX_POINTING_COMBO_COUNT) return true;
    const uint8_t     i = data[0];
    mp_combo_entry_t *e = &mp_combo_entries[i];
    memset(e, 0, sizeof(*e));
    for (uint8_t k = 0; k < MP_COMBO_KEYS; k++) e->keys[k] = mp_get16(data + 1 + k * 2);
    e->keycode = mp_get16(data + 9);
    e->term    = mp_get16(data + 11);
    if (e->term > 1000) e->term = 1000;
    e->layers = data[13];
    mp_combo_build(i);
    mp_combos_dirty = true;
    return true;
}

uint16_t combo_count(void) {
    return MATRIX_POINTING_COMBO_COUNT;
}

combo_t *combo_get(uint16_t combo_idx) {
    return combo_idx < MATRIX_POINTING_COMBO_COUNT ? &mp_combos[combo_idx] : NULL;
}

#    ifdef COMBO_TERM_PER_COMBO
uint16_t get_combo_term(uint16_t combo_index, combo_t *combo) {
    const uint16_t term = combo_index < MATRIX_POINTING_COMBO_COUNT ? mp_combo_entries[combo_index].term : 0;
    return term ? term : COMBO_TERM;
}
#    endif

#    ifdef COMBO_SHOULD_TRIGGER
bool combo_should_trigger(uint16_t combo_index, combo_t *combo, uint16_t keycode, keyrecord_t *record) {
    if (combo_index >= MATRIX_POINTING_COMBO_COUNT) return true;
    const uint8_t mask = mp_combo_entries[combo_index].layers;
    if (mask == 0) return true;
    const uint8_t layer = get_highest_layer(layer_state | default_layer_state);
    return layer < 8 && (mask & (1 << layer));
}
#    endif
#else
static void mp_combos_load(void) {}
static void mp_combos_clear(void) {}
static void mp_combos_save(void) {}
static bool mp_combo_get_value(uint8_t value_id, uint8_t *data, uint8_t length) {
    return false;
}
static bool mp_combo_set_value(uint8_t value_id, const uint8_t *data, uint8_t length) {
    return false;
}
#endif

// ---------------------------------------------------------------------------
// VIA custom channel (channel 0)
// data = [ command_id, channel_id, value_id, value_data... ]

static bool mp_combo_get_value(uint8_t value_id, uint8_t *data, uint8_t length);
static bool mp_combo_set_value(uint8_t value_id, const uint8_t *data, uint8_t length);
static void mp_combos_save(void);

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
            if (*value_id == MP_CAPABILITIES_VALUE_ID) {
                const uint32_t caps = mp_capabilities();
                value_data[0]       = caps >> 24;
                value_data[1]       = caps >> 16;
                value_data[2]       = caps >> 8;
                value_data[3]       = caps & 0xFF;
                return;
            }
            if (mp_combo_get_value(*value_id, value_data, length - 3)) return;
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
            if (mp_combo_set_value(*value_id, value_data, length - 3)) return;
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
            mp_config_changed();
            return;
        }
        case id_custom_save:
            MP_EEPROM_WRITE(mp_config);
            mp_combos_save();
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

// Digitizer fallback: taps arrive as short button pulses, tap-and-drag as a
// held button 1. Filter what the editor turned off.
#ifndef MP_DRAG_HOLD_MS
#    define MP_DRAG_HOLD_MS 80
#endif
static uint8_t mp_filter_buttons(uint8_t buttons) {
#ifdef POINTING_DEVICE_DRIVER_digitizer
    static bool     held      = false;
    static uint16_t held_time = 0;
    if (!mp_config.two_finger_tap) buttons &= ~0x02;
    if (buttons & 0x01) {
        if (!held) {
            held      = true;
            held_time = timer_read();
        }
        if (!mp_config.tap_drag && timer_elapsed(held_time) > MP_DRAG_HOLD_MS) buttons &= ~0x01;
    } else {
        held = false;
    }
#endif
    return buttons;
}

report_mouse_t matrix_pointing_task(report_mouse_t r) {
    mp_ensure_loaded();
    mp_bootloader_check();
    r.buttons = mp_filter_buttons(r.buttons);
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
#ifdef MATRIX_POINTING_NATIVE_CPI
    // Scale to the chosen speed, carrying the remainder so slow movement is
    // not lost.
    // Reports without movement arrive between sensor scans, so the
    // remainder is only dropped after a pause (not on every empty report).
    static int32_t  rem_x = 0, rem_y = 0;
    static uint16_t last_motion = 0;
    const int32_t   native = MATRIX_POINTING_NATIVE_CPI;
    if (x != 0 || y != 0) {
        if (timer_elapsed(last_motion) > 100) rem_x = rem_y = 0;
        last_motion = timer_read();
        int32_t sx  = x * (int32_t)mp_config.cpi + rem_x;
        int32_t sy  = y * (int32_t)mp_config.cpi + rem_y;
        x           = sx / native;
        y           = sy / native;
        rem_x       = sx % native;
        rem_y       = sy % native;
    }
#endif
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
