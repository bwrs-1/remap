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

## Feature flags

The editor shows the **Touchpad** and **Mouse Layer** tabs only when the
definition declares them in `customFeatures`:

```json
"customFeatures": ["matrix_touchpad", "matrix_auto_mouse_layer"]
```

Only declare a flag when the firmware implements the handler below. A firmware
without it answers `id_unhandled` (`0xFF`), which the editor cannot match to the
request.

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

### Touchpad (`matrix_touchpad`)

| ID     | Key                | Size | Range / meaning                               | Default |
| ------ | ------------------ | ---- | --------------------------------------------- | ------- |
| `0x01` | `cpi`              | 2    | 400 – 3200                                    | 1600    |
| `0x02` | `acceleration`     | 1    | 0 / 1                                         | 1       |
| `0x03` | `glide`            | 1    | 0 / 1 (cursor glide / inertia)                | 0       |
| `0x04` | `rotation`         | 1    | 0: 0°, 1: 90°, 2: 180°, 3: 270°               | 0       |
| `0x05` | `invertX`          | 1    | 0 / 1                                         | 0       |
| `0x06` | `invertY`          | 1    | 0 / 1                                         | 0       |
| `0x07` | `tapToClick`       | 1    | 0 / 1                                         | 1       |
| `0x08` | `twoFingerTap`     | 1    | 0 / 1 (right click, multi-touch sensors only) | 1       |
| `0x09` | `tapDrag`          | 1    | 0 / 1                                         | 0       |
| `0x0A` | `tapTerm`          | 2    | 100 – 400 ms                                  | 200     |
| `0x0B` | `scrollMode`       | 1    | 0: two finger, 1: circular, 2: edge           | 0       |
| `0x0C` | `scrollDivisor`    | 1    | 1 – 32 (smaller = faster)                     | 8       |
| `0x0D` | `naturalScroll`    | 1    | 0 / 1                                         | 0       |
| `0x0E` | `horizontalScroll` | 1    | 0 / 1                                         | 1       |
| `0x0F` | `sensitivity`      | 1    | 0: 1x, 1: 2x, 2: 3x, 3: 4x                    | 1       |

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
