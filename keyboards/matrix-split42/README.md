# Matrix Split 42 — keyboard definition template & firmware protocol

`matrix-split42.json` is a **template** keyboard definition for a 3x6 + 3 thumb
split keyboard with a touchpad mounted on the top (inner side) of the right
half and knobs (rotary encoders) on the outermost thumb key of each half.

Replace the following before using it with real hardware:

| Field                             | Template value                                 | Replace with                                |
| --------------------------------- | ---------------------------------------------- | ------------------------------------------- |
| `name`                            | `Matrix Split 42 (template)`                   | Your keyboard name                          |
| `vendorId` / `productId`          | `0xFEED` / `0x0000`                            | Values from your firmware's `keyboard.json` |
| `matrix` and the `row,col` labels | rows 0-3 = left, rows 4-7 = right, 6 cols      | Your actual matrix wiring                   |
| Key positions (`x` / `y`)         | Approximate column stagger traced from a photo | Your PCB / case coordinates (KLE)           |

Encoders: left outermost thumb key = `e0` (`3,3`), right outermost thumb key = `e1` (`7,2`).

## Firmware detection

The editor always lists **Touchpad** and **Mouse Layer**. When one of them is
opened, it first reads value `0x00` (2 bytes) and continues only if the
firmware returns the magic `0x4D58` (`'MX'`). Anything else — the
`id_unhandled` (`0xFF`) reply of a VIA firmware without a custom value handler,
or a different custom handler on channel 0 — is treated as "not supported":
nothing else is read or written, and the screen can only be previewed.

The `customFeatures` entries in the template (`matrix_touchpad`,
`matrix_auto_mouse_layer`) are informational; detection does not rely on them.

## Protocol (VIA custom channel)

All values use the standard VIA custom value commands on **channel 0**
(`id_custom_channel`). Multi-byte values are big endian.

| Command               | Request bytes                   | Response                        |
| --------------------- | ------------------------------- | ------------------------------- |
| `id_custom_get_value` | `0x08, 0x00, value_id`          | `0x08, 0x00, value_id, data...` |
| `id_custom_set_value` | `0x07, 0x00, value_id, data...` | echo of the request             |
| `id_custom_save`      | `0x09, 0x00`                    | echo of the request             |

The editor sends `set_value` only for changed values, then one `save` to
persist them (e.g. to EEPROM / `eeconfig_update_kb_datablock`).

| ID     | Key          | Size | Meaning                                                                            |
| ------ | ------------ | ---- | ---------------------------------------------------------------------------------- |
| `0x00` | `magic`      | 2    | Read-only. Must return `0x4D58` (`'MX'`)                                           |
| `0x7F` | `bootloader` | 1    | Write-only. Any value reboots into the bootloader (RP2040: BOOTSEL) after replying |

### Touchpad (`matrix_touchpad`)

| ID     | Key                 | Size | Range / meaning                                                                   | Default |
| ------ | ------------------- | ---- | --------------------------------------------------------------------------------- | ------- |
| `0x01` | `cpi`               | 2    | 400 – 3200                                                                        | 1600    |
| `0x02` | `acceleration`      | 1    | 0 / 1                                                                             | 1       |
| `0x03` | `glide`             | 1    | 0 / 1 (cursor glide / inertia)                                                    | 0       |
| `0x04` | `rotation`          | 1    | 0: 0°, 1: 90°, 2: 180°, 3: 270°                                                   | 0       |
| `0x05` | `invertX`           | 1    | 0 / 1                                                                             | 0       |
| `0x06` | `invertY`           | 1    | 0 / 1                                                                             | 0       |
| `0x07` | `tapToClick`        | 1    | 0 / 1                                                                             | 1       |
| `0x08` | `twoFingerTap`      | 1    | 0 / 1 (right click, multi-touch sensors only)                                     | 1       |
| `0x09` | `tapDrag`           | 1    | 0 / 1                                                                             | 0       |
| `0x0A` | `tapTerm`           | 2    | 100 – 400 ms                                                                      | 200     |
| `0x0B` | `scrollMode`        | 1    | 0: two finger, 1: circular, 2: edge                                               | 0       |
| `0x0C` | `scrollDivisor`     | 1    | 1 – 32 (smaller = faster)                                                         | 8       |
| `0x0D` | `naturalScroll`     | 1    | 0 / 1                                                                             | 0       |
| `0x0E` | `horizontalScroll`  | 1    | 0 / 1                                                                             | 1       |
| `0x0F` | `sensitivity`       | 1    | 0: 1x, 1: 2x, 2: 3x, 3: 4x                                                        | 1       |
| `0x10` | `precisionTouchpad` | 1    | 0: always a mouse, 1: Windows precision touchpad when the host asks (protocol v4) | 0       |

### Auto mouse layer (`matrix_auto_mouse_layer`)

| ID     | Key                 | Size | Range / meaning                                    | Default |
| ------ | ------------------- | ---- | -------------------------------------------------- | ------- |
| `0x20` | `enabled`           | 1    | 0 / 1                                              | 1       |
| `0x21` | `layer`             | 1    | 1 – 31 (target layer)                              | 3       |
| `0x22` | `threshold`         | 1    | 1 – 50 (movement needed to activate)               | 10      |
| `0x23` | `timeout`           | 2    | 200 – 3000 ms idle before release                  | 650     |
| `0x24` | `activationDelay`   | 2    | 0 – 1000 ms after key input before it can activate | 200     |
| `0x25` | `debounce`          | 1    | 0 – 100 ms                                         | 25      |
| `0x26` | `exitOnOtherKey`    | 1    | 0 / 1 — release when a non-mouse key is pressed    | 1       |
| `0x27` | `holdWithModifiers` | 1    | 0 / 1 — keep the layer while modifiers are held    | 1       |

### Timing & gestures (protocol version 2)

Firmware made before these values answers `id_unhandled` for them; the
editor then asks for a firmware update instead of showing defaults.

| ID     | Key           | Size | Range / meaning                                                           | Default            |
| ------ | ------------- | ---- | ------------------------------------------------------------------------- | ------------------ |
| `0x30` | `tappingTerm` | 2    | 100 – 400 ms, tapping term of LT / MT keys                                | 200                |
| `0x31` | `holdMode`    | 1    | 0: hold preferred, 1: balanced (permissive hold), 2: tap preferred        | 2                  |
| `0x40` | `swipeLeft`   | 2    | QMK keycode sent on a 3-finger swipe (basic keycode with modifiers, or 0) | `0x00D3` (MS_BTN3) |
| `0x41` | `swipeRight`  | 2    | as above                                                                  | `0x00D4` (MS_BTN4) |
| `0x42` | `swipeUp`     | 2    | as above                                                                  | `0x00E3` (LGUI)    |
| `0x43` | `swipeDown`   | 2    | as above                                                                  | `0x0029` (ESC)     |

### Protocol version 3

| ID            | Key            | Size | Meaning                                                                                                                                                                                                                                                                                                                                                                                        |
| ------------- | -------------- | ---- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `0x7E`        | `capabilities` | 4    | Read-only bit mask of what the build applies. Bits 0–14: touchpad value `0x01 + n`; bit 15: auto mouse layer; 16: timing; 17: swipes; 18: layer LEDs; 19: combos; 20: precision touchpad switch; 21: split info (`0x7D`); 22: RGB effect count (`0x7B`); 23: touchpad edge sliders / corner taps; 24: knob press-and-turn; 25: smoothing (`0x92`). `id_unhandled` (older firmware): assume all |
| `0x50`–`0x57` | `led0`–`led7`  | 1    | LED color of layer 0–7: 0 keep the effect, 1 off, 2 red, 3 green, 4 yellow, 5 blue, 6 magenta, 7 cyan, 8 white                                                                                                                                                                                                                                                                                 |
| `0x7C`        | `revision`     | 2    | Read-only. Revision of the firmware module (9 and later); the editor warns when it is older than the bundled firmware                                                                                                                                                                                                                                                                          |
| `0x60`        | `comboCount`   | 1    | Read-only. Number of combo slots                                                                                                                                                                                                                                                                                                                                                               |
| `0x61`        | `combo`        | 14   | `[slot, keys[4], keycode, term, layers]`, 16-bit values big endian. The request carries the slot; the reply echoes it. Keys are layer-0 keycodes (`0` = unused); `term` 0 = default; `layers` bit mask, 0 = all                                                                                                                                                                                |
| `0x7D`        | `splitInfo`    | 7    | Read-only (revision 11+). `[state, other half's revision (2), this build's ID (2), other half's build ID (2)]`; state 0 not known yet, 1 known, 2 the other half's firmware does not report (revision 10 or older), 3 not connected. Build ID = 16-bit hash of `QMK_BUILDDATE`                                                                                                                 |
| `0x7B`        | `rgbEffects`   | 1    | Read-only (revision 11+). `RGB_MATRIX_EFFECT_MAX` of the build, to check the editor's effect list. Lighting itself uses VIA's QMK RGB Matrix channel 3 (values 1 brightness, 2 effect, 3 speed, 4 hue + saturation)                                                                                                                                                                            |
| `0x80`        | `edgeWidth`    | 1    | Revision 12+. Width of the touchpad's edge zones, % of the pad (5–30, default 12)                                                                                                                                                                                                                                                                                                              |
| `0x81`        | `edgeStep`     | 1    | Revision 12+. Slide distance per keycode, % of the pad (2–25, default 6)                                                                                                                                                                                                                                                                                                                       |
| `0x82`–`0x89` | `edge*`        | 2    | Revision 12+. Edge slider keycodes: left, right, top, bottom (as the user sees the pad, after rotation / inversion); per edge [moving up or left, moving down or right]; 0 = off                                                                                                                                                                                                               |
| `0x8A`–`0x8D` | `corner*`      | 2    | Revision 12+. Corner tap keycodes: top-left, top-right, bottom-left, bottom-right; 0 = off                                                                                                                                                                                                                                                                                                     |
| `0x8E`–`0x91` | `knob*`        | 2    | Revision 12+. While a knob's push switch is held: left knob [counter-clockwise, clockwise], right knob [counter-clockwise, clockwise]; 0 = the encoder map keycode                                                                                                                                                                                                                             |
| `0x92`        | `smooth`       | 1    | Revision 12+. 1 = spread each sensor report over the time until the next one                                                                                                                                                                                                                                                                                                                   |

Values outside a range are clamped by the editor when read. The editor's
defaults are its own starting values; the firmware's stored values win once
they are read.

### Firmware side

Implement `via_custom_value_command_kb()` in the keyboard code: dispatch on
`data[0]` (command) and `data[1] == 0` (channel), read / write the value for
`data[2]`, and apply it to the pointing device driver and the auto mouse layer
at runtime. Which settings a given sensor can honour (e.g. two-finger gestures)
depends on the sensor and driver; settings the firmware cannot apply should
still be stored and echoed so the editor stays in sync.
