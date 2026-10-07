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
#define MATRIX_POINTING_EEPROM_SIZE 32

#ifndef MATRIX_POINTING_EEPROM_OFFSET
#    define MATRIX_POINTING_EEPROM_OFFSET 0
#endif

// Call from keyboard_post_init_user().
void matrix_pointing_init(void);

// Current CPI setting, e.g. for digitizer_get_cpi_user().
uint16_t matrix_pointing_get_cpi(void);

// Call from pointing_device_task_user(); returns the transformed report.
report_mouse_t matrix_pointing_task(report_mouse_t mouse_report);

// Call from process_record_user() (before your own handling); always
// returns true. Tracks key presses for the "delay after typing" setting.
bool matrix_pointing_process_record(uint16_t keycode, keyrecord_t *record);

// Call from is_mouse_record_user() if you define it yourself; otherwise this
// module defines is_mouse_record_user() (see MATRIX_POINTING_NO_MOUSE_RECORD).
bool matrix_pointing_is_mouse_record(uint16_t keycode, keyrecord_t *record);
