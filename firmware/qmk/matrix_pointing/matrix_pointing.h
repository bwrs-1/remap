// Matrix pointing settings for QMK (touchpad + auto mouse layer).
//
// Implements the protocol the Matrix editor uses on the VIA custom channel
// (channel 0): see keyboards/matrix-split42/README.md in the Matrix repo.
// Settings are stored in the user EEPROM datablock and applied at runtime.
//
// SPDX-License-Identifier: GPL-2.0-or-later
#pragma once

#include "quantum.h"

// Size of the persisted settings. Add to config.h:
//   #define EECONFIG_USER_DATA_SIZE MATRIX_POINTING_EEPROM_SIZE
// (or a larger value if your keymap stores its own data after it; see
// MATRIX_POINTING_EEPROM_OFFSET).
#define MATRIX_POINTING_EEPROM_SIZE 64

#ifndef MATRIX_POINTING_EEPROM_OFFSET
#    define MATRIX_POINTING_EEPROM_OFFSET 0
#endif

// Call from keyboard_post_init_user().
void matrix_pointing_init(void);

// Current CPI setting, e.g. for digitizer_get_cpi_user().
uint16_t matrix_pointing_get_cpi(void);

// Software speed (optional): when the driver's own CPI also changes how
// gestures are measured (multitouch fork), define in config.h
//   #define MATRIX_POINTING_NATIVE_CPI 5080  // counts per inch the reports have
//   #define MATRIX_POINTING_DRIVER_CPI 1200  // fixed driver CPI
// The driver then keeps MATRIX_POINTING_DRIVER_CPI and the reports are
// scaled to the CPI chosen in the editor. Return matrix_pointing_driver_cpi()
// from digitizer_get_cpi_user() / pointing_device_init_user().
uint16_t matrix_pointing_driver_cpi(void);

// Current tap term (ms), e.g. for
//   #define DIGITIZER_MOUSE_TAP_DETECTION_TIMEOUT matrix_pointing_tap_term()
uint16_t matrix_pointing_tap_term(void);

// Call from pointing_device_task_user(); returns the transformed report.
report_mouse_t matrix_pointing_task(report_mouse_t mouse_report);

// Call from process_record_user() (before your own handling) and return
// false when it does: it tracks key presses for the "delay after typing"
// setting and handles knob press-and-turn (MATRIX_POINTING_KNOB_KEYS).
bool matrix_pointing_process_record(uint16_t keycode, keyrecord_t *record);

#if defined(MATRIX_POINTING_EDGE_ZONES) && defined(POINTING_DEVICE_DRIVER_digitizer)
#    include "digitizer.h"
// Touchpad edge sliders / corner taps. This module defines
// digitizer_task_user() to call it (define MATRIX_POINTING_NO_DIGITIZER_HOOK
// to write your own and call this from it).
bool matrix_pointing_digitizer(digitizer_t *const state);
#endif

// Call from is_mouse_record_user() if you define it yourself; otherwise this
// module defines is_mouse_record_user() (see MATRIX_POINTING_NO_MOUSE_RECORD).
bool matrix_pointing_is_mouse_record(uint16_t keycode, keyrecord_t *record);

// Tapping term (ms) and hold mode (0: hold preferred, 1: balanced,
// 2: tap preferred) for LT / MT keys. With TAPPING_TERM_PER_KEY,
// PERMISSIVE_HOLD_PER_KEY and HOLD_ON_OTHER_KEY_PRESS_PER_KEY in config.h this
// module defines get_tapping_term() / get_permissive_hold() /
// get_hold_on_other_key_press() (define MATRIX_POINTING_NO_TAPPING_HOOKS to
// write your own and call these instead).
uint16_t matrix_pointing_tapping_term(void);
uint8_t  matrix_pointing_hold_mode(void);

// 3-finger swipe (0: left, 1: right, 2: up, 3: down) for the multitouch QMK
// fork. config.h cannot include this header, so declare it there:
//   #define MATRIX_POINTING_SWIPE_KC(dir) ({ extern uint8_t matrix_pointing_swipe(uint8_t); matrix_pointing_swipe(dir); })
//   #define DIGITIZER_SWIPE_LEFT_KC  MATRIX_POINTING_SWIPE_KC(0)
//   #define DIGITIZER_SWIPE_RIGHT_KC MATRIX_POINTING_SWIPE_KC(1)
//   #define DIGITIZER_SWIPE_UP_KC    MATRIX_POINTING_SWIPE_KC(2)
//   #define DIGITIZER_SWIPE_DOWN_KC  MATRIX_POINTING_SWIPE_KC(3)
uint8_t matrix_pointing_swipe(uint8_t direction);

// Call from housekeeping_task_user() if you define it yourself (then define
// MATRIX_POINTING_NO_HOUSEKEEPING). Syncs settings to the other half of a
// split keyboard (MATRIX_POINTING_SPLIT_SYNC) and collects its swipes.
void matrix_pointing_housekeeping(void);

#ifdef RGB_MATRIX_ENABLE
// Paints the LED color of the active layer; returns false when it did.
// Called from rgb_matrix_indicators_advanced_user() (this module defines it
// unless MATRIX_POINTING_NO_LED_HOOK).
bool matrix_pointing_rgb_indicators(uint8_t led_min, uint8_t led_max);
#endif
