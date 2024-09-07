# The Homie Convention

Version: **<!--VERSION-->x.x.x<!--VERSION-->**
Date: **<!--DATE-->01. Jan 2000<!--DATE-->**

## MQTT Restrictions

Homie communicates through [MQTT](http://mqtt.org) and is hence based on the basic principles of MQTT topic publication and subscription.

### Topic IDs

An MQTT topic consists of one or more topic levels, separated by the slash character (`/`).
A topic level ID MAY ONLY contain lowercase letters from `a` to `z`, numbers from `0` to `9` as well as the hyphen character (`-`).

The special character `$` is used and reserved for Homie *attributes*.

### QoS and retained messages

The recommended QoS level is **Exactly once (QoS 2)** (except for non-retained, see below).

* All messages MUST be sent as **retained**, UNLESS stated otherwise.
* Controllers setting values for device properties publish to the Property `set` topic with **non-retained** messages only.
* Controllers setting values for **non-retained** device properties should publish to the Property `/set` topic with a QoS of **At most once (QoS 0)**.
* Devices publishing values for their **non-retained** properties must use **non-retained** messages, with a QoS of **At most once (QoS 0)**.

For QoS details see [the explanation](#qos-choices-explained).

### Last Will

Homie requires the last will (LWT) to set the `homie` / `5` / `[device ID]` / `$state` attribute to the value **`lost`**, see [Device Lifecycle](#device-lifecycle).
MQTT only allows one last will message per connection, but since a device can have children, the LWT message MUST be set on the
root device (the device at the root of the parent-child tree).

### Empty string values

MQTT will treat an empty string payload as a "delete" instruction for the topic, therefor an
empty string value is represented by a 1-character string containing a single byte value 0 (Hex: `0x00`, Dec: `0`).

The empty string (passed as an MQTT payload) can only occur in 3 places;

- `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]`; reported property values (for string types)
- `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]` / `set`; the topic to set properties (of string types)
- `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]` / `$target`; the target property value (for string types)

This convention specifies no way to represent an actual value of a 1-character string with a single byte 0. If a device
needs this, then it should provide an escape mechanism on the application level.

## Payloads

- Every MQTT message payload MUST be sent as a UTF-8 encoded string
- The message MUST NOT include the UTF-8 [BOM](https://en.wikipedia.org/wiki/Byte_order_mark)
- The value published as payload MUST be valid for the respective property/attribute type as per the list below
 
### String

- String types are limited to 268,435,456 characters 
- An [empty string](#empty-string-values) ("") is a valid payload
 
### Integer

- Integer types are string literal representations of 64-bit signed whole numbers
- Integers range from -9,223,372,036,854,775,808 (-2<sup>63</sup>) to 9,223,372,036,854,775,807 (2<sup>63</sup>-1)
- The payload may only contain whole numbers and the negation character "-". No other characters including spaces (" ") are permitted 
- A string with just a negation sign ("-") is not a valid payload
- An [empty string](#empty-string-values) ("") is not a valid payload
 
### Float

- Float types are string literal representations of 64-bit signed floating point numbers
- Floats range from +/-(2^-1074) to +/-((2 - 2^-52) * 2^1023)
- The payload may only contain whole numbers, the negation character "-", the exponent character "e" or "E" and the decimal separator ".", no other characters, including spaces (" ") are permitted 
- The dot character (".") is the decimal separator (used if necessary) and may only have a single instance present in the payload
- Representations of numeric concepts such as "NaN" (Not a Number) and "Infinity" are not a valid payload
- A string with just a negation sign ("-") is not a valid payload
- An [empty string](#empty-string-values) ("") is not a valid payload
 
### Boolean

- Booleans must be converted to the string literals "true" or "false"
- Representation is case sensitive, e.g. "TRUE" or "FALSE" are not valid payloads.
- An [empty string](#empty-string-values) ("") is not a valid payload
 
### Enum

- Enum payloads must be one of the values specified in the format definition of the property
- Enum payloads are case sensitive, e.g. "Car" will not match a format definition of "car"
- Leading- and trailing-whitespace is significant, e.g. "Car" will not match " Car".
- An [empty string](#empty-string-values) ("") is not a valid payload
 
### Color

- Color payload validity varies depending on the property format definition of either "rgb", "hsv", or "xyz"
- All payload types contain comma-separated data of differing restricted ranges. The first being the type, followed by numbers. The numbers must conform to the [float](#float) format
- The encoded string may only contain the type, the [float](#float) numbers and the comma character ",", no other characters are permitted, including spaces (" ")
- Payloads for type "rgb" contain 3 comma-separated values of [floats](#float) (`r`, `g`, `b`) with a valid range between 0 and 255 (inclusive). e.g. `"rgb,100,100,100"`
- Payloads for type "hsv" contain 3 comma-separated values of [floats](#float). The first number (`h`) has a range of 0 to 360 (inclusive), and the second and third numbers (`s` and `v`) have a range of 0 to 100 (inclusive).  e.g. `"hsv,300,50,75"`
- Payloads for type "xyz" contain 2 comma separated values of [floats](#float) (`x`, `y`) with a valid range between 0 and 1 (inclusive). The "z" value can be calculated via `z=1-x-y` and is therefore not transmitted. (see [CIE_1931_color_space](https://en.wikipedia.org/wiki/CIE_1931_color_space)). e.g. `"xyz,0.25,0.34"`
- *Note*: The `rgb` and `hsv` formats encode both color and brightness, whereas `xyz` only encodes the color, so;
  - when brightness encoding is required: do not use `xyz`, or optionally add another property for the brightness (such that setting `hsv` and `rgb` values changes both the color property and the brightness one if required)
  - if color only is encoded: ignore the `v` value in `hsv`, and use the relative colors of `rgb`
    eg. `color_only_r = 255 * r / max(r, g, b)`, etc.
- An [empty string](#empty-string-values) ("") is not a valid payload

### DateTime

- DateTime payloads must use the ISO [8601 format](https://en.wikipedia.org/wiki/ISO_8601). 
- An [empty string](#empty-string-values) ("") is not a valid payload

### Duration

- Duration payloads must use the [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations)
- The format is `PTxHxMxS`, where:
`P`: Indicates a period/duration (required).
`T`: Indicates a time (required).
`xH`: Hours, where `x` represents the number of hours (optional).
`xM`: Minutes, where `x` represents the number of minutes (optional).
`xS`: Seconds, where `x` represents the number of seconds (optional).
- Examples: `PT12H5M46S` (12 hours, 5 minutes, 46 seconds), `PT5M` (5 minutes)
- An [empty string](#empty-string-values) ("") is not a valid payload

### JSON

- Contains a JSON string for transporting complex data formats that cannot be exposed as single value attributes.
- The payload MUST be either a JSON-Array or JSON-Object type, for other types the standard Homie types should be used.

## Base Topic

The root topic in this convention is `"homie/5/"`.
If this root topic does not suit your needs (in case of, e.g., a public broker or because of branding),
you can change the first segment, but the `"/5/"` segment must be retained. This allows controllers
to subscribe to only the devices they are compatible with.

## Auto-Discovery

Homie 5 controllers must by default perform auto-discovery on the wildcard topic `"+/5/+/$state"`.
Controllers are free to restrict discovery to a specific root topic, configurable by the user.
A zero length payload published on the `$state` topic indicates a device removal, see [device lifecycle](#device-lifecycle).

## Topology and structure

**Devices:**
An instance of a physical piece of hardware is called a *device*.
For example, a car, an Arduino/ESP8266, or a coffee machine.
Within the convention devices can be modelled to have children. For example, bridge
devices; a zwave bridge device (the parent) exposes many child devices (the
zwave devices). There is no depth limit set on additionally nested children.

**Nodes:**
A *device* can expose multiple *nodes*.
Nodes are independent or logically separable parts of a device.
For example, a car might expose a `wheels` node, an `engine` node, and a `lights` node.

**Properties:**
A *node* can have multiple *properties*.
Properties represent basic characteristics of the node/device, often given as numbers or finite states.
For example, the `wheels` node might expose an `angle` property.
The `engine` node might expose a `speed`, `direction`, and `temperature` property.
The `lights` node might expose an `intensity` and a `color` property.

**Attributes:**
*Devices, nodes and properties* have specific *attributes* characterizing them.
Attributes are represented by a topic identifier starting with `$`.
The precise definition of attributes is important for the automatic discovery of devices following the Homie convention.

Examples: A device might have an `IP` attribute, a node will have a `name` attribute, and a property will have a `unit` attribute.

### Devices

* `homie` / `5` / **`[device ID]`**: this is the base topic of a device.
Each device must have a unique device ID that adheres to the [ID format](#topic-ids).

#### Device Attributes

The following topic structure will be used to expose the device attributes:

* `homie` / `5` / `[device ID]` / **`[$device-attribute]`**:

Devices have the following attributes:

| Attribute   | Required |                                                    Description            |
|-------------|----------|----------------------------------------------------------------|
| `$state`      | yes | Reflects the current state of the device. See [Device Lifecycle](#device-lifecycle) |
| `$description`| yes | The description document (JSON), describing the device, nodes, and properties of this device. **Important**: this value may only change when the device `$state` is either `init`, `disconnected`, or `lost`. |
| `$log`        | no | A topic that allows devices to log messages. See [Logging](#logging) |

The JSON description document is a JSON object with the following fields;

| Field     | Type         | Required | Default | Nullable | Description |
|-----------|--------------|----------|---------|----------|-------------|
| `homie`     |string        | yes      |         | no       | The implemented Homie convention version, without the "patch" level. So the format is `"5.x"`, where the `'x'` is the minor version. |
| `version`   | integer      | yes      |         | no       | The version of the description document. Whenever the document changes, a new higher version must be assigned. This does not need to be sequential, eg. a timestamp could be used. |
| `nodes`     |object        | no       | `{}`    | no       | The [Nodes](#nodes) the device exposes. An object containing the [Nodes](#nodes), indexed by their [ID](#topic-ids). Defaults to an empty object.|
| `name`      |string        | yes      |         | no       | Friendly name of the device. |
| `type`      |string        | no       |         | no       | Type of Device. Please ensure proper namespacing to prevent naming collisions. |
| `children`  |array-strings | no       | `[]`    | no       | Array of [ID](#topic-ids)'s of child devices. Defaults to an empty array.|
| `root`      |string        | yes/no   |         | no       | [ID](#topic-ids) of the root parent device. **Required** if the device is NOT the root device, MUST be omitted otherwise. |
| `parent`    |string        | yes/no   | same as `root`| no | [ID](#topic-ids) of the parent device. **Required** if the parent is NOT the root device. Defaults to the value of the `root` property. |
| `extensions`|array-strings | no       | `[]`    | no       | Array of supported extensions. Defaults to an empty array.|

For example, a device with an ID of `super-car` that comprises of a `wheels`, `engine`, and a `lights` node would send:
```java
homie/5/super-car/$state → "init"
homie/5/super-car/$description → following JSON document;
```
```json
      {
        "homie": "5.0",
        "name": "Supercar",
        "version": 7,
        "nodes": { 
          "wheels": { ... },
          "engine": { ... },
          "lights": { ... }
        }
      }
```

#### Device hierarchy

Devices can be organized in parent-child relationships. These are expressed via the device
attributes `root`, `parent`, and `children`. In any parent-child tree, there is only one
"root" device, which is the top-level device that has no parent, but only children.

Example: a ZWave bridge (`id = "bridge"`), which exposes a ZWave device with a dual-relay (`id = "dualrelay"`),
which respectively control Light1 (`id = "light1"`) and Light2 (`id = "light2"`). So there are 4 devices in total.
Then these are the attribute values:

|              | id          | children             | root     | parent      |
|--------------|-------------|----------------------|----------|-------------|
| Zwave bridge | "bridge"    | ["dualrelay"]        |          |             |
| Zwave relay  | "dualrelay" | ["light1", "light2"] | "bridge" |             |
| First light  | "light1"    |                      | "bridge" | "dualrelay" |
| Second light | "light2"    |                      | "bridge" | "dualrelay" |

To monitor the state of child devices in this tree 2 topic subscriptions are needed. The `$state` attribute of the device itself, as well as the `$state` attribute of its root device.
Because if the root device loses its connection to the MQTT server, the last will (LWT), will set its `$state` attribute to `"lost"`, but it will not update the child-device states. Hence the need for 2 topic subscriptions.

The `state` of any device should be determined as follows:
| has a `root` set | `root` state | device state |
|------------------|--------------|--------------|
| no               | n.a.         | device state is the `$state` attribute of the device itself
| yes              | not `"lost"` | device state is the `$state` attribute of the device itself
| yes              | `"lost"`     | device state is `"lost"` (`$state` attribute of the root device)


#### Device Lifecycle

The `$state` device attribute represents the current state of the device. A device exists once a valid value is set in the `$state` attribute. It doesn't mean the device is complete and valid (yet), but it does mean it exists.

There are 5 possible state values:

* **`init`**: this is the state the device is in when it is connected to the MQTT broker, but has not yet sent all Homie messages and is not yet ready to operate.
This state is optional and may be sent if the device takes a long time to initialize, but wishes to announce to consumers that it is coming online. 
A device may fall back into this state to do some reconfiguration.
* **`ready`**: this is the state the device is in when it is connected to the MQTT broker and has sent all Homie messages describing the device attributes, nodes, properties, and their values. The device has subscribed to all appropriate `/set` topics and is ready to receive messages. 
* **`disconnected`**: this is the state the device is in when it is cleanly disconnected from the MQTT broker.
You must send this message before cleanly disconnecting.
* **`sleeping`**: this is the state the device is in when the device is sleeping.
You have to send this message before sleeping.
* **`lost`**: this is the state the device is in when the device has been "badly" disconnected. **Important**: If a root-device `$state` is `"lost"` then the state of **every child device in its tree** is also `"lost"`.
You must define this message as the last will (LWT) for root devices.

In order to permanently remove a device the following steps should be performed in order:
1. remove the retained `$state` attribute from the broker by publishing a zero length payload message to its topic. The device will cease to exist.
2. any other retained attributes or property values should be cleared via the same method afterwards.

### Nodes

* `homie` / `5` / `[device ID]` / **`[node ID]`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adheres to the [ID format](#topic-ids).

#### Node Attributes

There are no node attributes in MQTT topics for this level.

The Node object itself is described in the `homie` / `5` / `[device ID]` / `$description` JSON document. The Node object has the following fields:

| Field       | Type         | Required | Default | Nullable | Description |
|-------------|--------------|----------|---------|----------|-------------|
| `name`      |string        | no       | [node-id] | no       | Friendly name of the Node. Defaults to the [ID](#topic-ids) of the node. |
| `type`      |string        | no       |         | no       | Type of Node. Please ensure proper namespacing to prevent naming collisions. |
| `properties`|object        | no       | `{}`    | no       | The [Properties](#properties) the Node exposes. An object containing the [Properties](#properties), indexed by their [ID](#topic-ids). Defaults to an empty object.|

For example, our `engine` node would look like this:

```json
      ...
      "engine": {
        "name": "Car engine",
        "properties": {
          "speed": { ... },
          "direction": { ... },
          "temperature": { ... }
        }
      }
      ...
```

### Properties

* `homie` / `5` / `[device ID]` / `[node ID]` / **`[property ID]`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adheres to the [ID format](#topic-ids).

#### Property Attributes

| Attribute | Required |   Description            |
|-----------|----------|----------------------------------------------------------------|
|           | yes      | A property value (e.g. a sensor reading) is directly published to the property topic, e.g.: `homie/5/super-car/engine/temperature → "21.5"` |
| `$target` | no       | Describes an intended state change. The `$target` attribute must either be used for every value update (including the initial one), or it must never be used. |

The Property object itself is described in the `homie` / `5` / `device ID` / `$description` JSON document. The Property object has the following fields:

| Field     | Type         | Required | Default  | Nullable | Description |
|-----------|--------------|----------|----------|----|---------|
| `name`    | string       | no       | [property-id] | no | Friendly name of the Property. Defaults to the [ID](#topic-ids) of the property. |
| `datatype`| string       | yes      |          | no | The data type. See [Payloads](#payload). Any of the following values: `"integer", "float", "boolean", "string", "enum", "color", "datetime", "duration", "json"`. |
| `format`  | string       | see [formats](#formats)    | see [formats](#formats) | no | Specifies restrictions or options for the given data type. |
| `settable`| boolean      | no       | `false`  | no | Whether the Property is settable. |
| `retained`| boolean      | no       | `true`   | no | Whether the Property is retained. |
| `unit`    | string       | no       |          | no | Unit of this property. See [units](#units). |


For example, our `temperature` property would look like this in the device/node description document:

```json
      ...
      "temperature": {
        "name": "Engine temperature",
        "unit": "°C",
        "datatype": "float",
        "format": "-20:120"
      }
      ...
```
And the following MQTT topic with the reported property value:
```java
homie/5/super-car/engine/temperature → "21.5"
```

#### Settable and retained properties

Properties can be **settable** and/or **retained**. For example, you don't want your `temperature`
property to be settable in case of a temperature sensor (like the car example), but it should be
settable in the case of a thermostat setpoint.

A property is retained by default. A non-retained property would be useful for momentary events
(e.g. doorbell pressed). See also [QoS settings](#qos-and-retained-messages).

A combination of the **settable** and **retained** flags compiles into this list:

| retained | settable | description |
|----------|----------|-------------|
| yes      | yes      | The node publishes a property state and can receive commands for the property (by a controller or other party) (lamp power)
| yes      | no       | (**default**) The node publishes a property state (temperature sensor)
| no       | yes      | The node publishes momentary events and can receive commands for the property from a controller (brew coffee)
| no       | no       | The node publishes momentary events (doorbell pressed)


#### Formats

The format attribute specifies restrictions or options for the given data type. User interfaces can derive hints from
the formats for displaying values.

| Type         | Required | Default | Description |
|--------------|----------|----------|-------------|
| float        | no       | `:`      | `[min]:[max][:step]` where min and max are the respective minimum and maximum (inclusive) allowed values, both represented in the format for [float types](#float). Eg. `10.123:15.123`. If the minimum and/or maximum are missing from the format, then they are open-ended, so `0:` allows a value >= 0.<br/>The optional `step` determines the step size, eg. `2:6:2` will allow values `2`, `4`, and `6`. It must be greater than 0. The base for calculating a proper value based on `step` should be `min`, `max`, or the current property value (in that order). The implementation should round property values to the nearest step (which can be outside the min/max range). The min/max validation must be done after rounding. |
| integer      | no       | `:`      | `[min]:[max][:step]` where min and max are the respective minimum and maximum (inclusive) allowed values, both represented in the format for [integer types](#integer). Eg. `5:35`. If the minimum and/or maximum are missing from the format, then they are open-ended, so `:10` allows a value <= 10. <br/>The optional `step` determines the step size, eg. `2:6:2` will allow values `2`, `4`, and `6`. It must be greater than 0. The base for calculating a proper value based on `step` should be `min`, `max`, or the current property value (in that order). The implementation should round property values to the nearest step (which can be outside the min/max range). The min/max validation must be done after rounding. |
| enum         | yes      |          | A comma-separated list of non-quoted values. Eg. `value1,value2,value3`. Leading- and trailing whitespace is significant. Individual values can not be an empty string, hence at least 1 value must be specified in the format. |
| color        | yes      |          | A comma-separated list of color formats supported; `rgb`, `hsv`, and/or `xyz`. The formats should be listed in order of preference (most preferred first, least preferred last). See the [color type](#color) for the resulting value formats. E.g. a device supporting RGB and HSV, where RGB is preferred, would have its format set to `"rgb,hsv"`. |
| boolean      | no       | `false,true` | Identical to an enum with 2 entries. The first represents the `false` value and the second is the `true` value. Eg. `close,open` or `off,on`. If provided, then both entries must be specified. **Important**:  the format does NOT specify valid payloads, they are descriptions of the valid payloads `false` and `true`. |
| json         | no       | `{"anyOf": [{"type": "array"},{"type": "object"}]}` | A [JSONschema](http://json-schema.org/) definition, which is added as a string (escaped), NOT as a nested json-object. See [JSON considerations](#json-considerations), for some ideas wrt compatibility. If a client fails to parse/compile the JSONschema, then it should ignore the given schema and fall back to the default schema.


#### Units

Recommended unit strings:

* `°C`: Degree Celsius (see 'Degree' for encoding)
* `°F`: Degree Fahrenheit (see 'Degree' for encoding)
* `°`: Degree
  * Character '°' is [Unicode: `U+00B0`](https://www.compart.com/en/unicode/U+00B0), Hex: `0xc2 0xb0`, Dec: `194 176`
* `L`: Liter
* `gal`: Gallon
* `V`: Volts
* `W`: Watt
* `kW`: Kilowatt
* `kWh`: Kilowatt-hour
* `A`: Ampere
* `Hz`: Hertz
* `rpm`: Revolutions per minute
* `%`: Percent
* `m`: Meter
* `m³`: Cubic meter
  * Character '³' is [Unicode: `U+00B3`](https://www.compart.com/en/unicode/U+00B3), Hex: `0xc2 0xb3`, Dec: `194 179`
* `ft`: Feet
* `m/s`: Meters per Second
* `kn`: Knots
* `Pa`: Pascal
* `psi`: PSI
* `ppm`: Parts Per Million
* `s`: Seconds
* `min`: Minutes
* `h`: Hours
* `lx`: Lux
* `K`: Kelvin
* `MK⁻¹`: Mired
  * Character '⁻' is [Unicode: `U+207B`](https://www.compart.com/en/unicode/U+207B), Hex: `0xe2 0x81 0xbb`, Dec: `226 129 187`
  * Character '¹' is [Unicode: `U+00B9`](https://www.compart.com/en/unicode/U+00B9), Hex: `0xc2 0xb9`, Dec: `194 185`
* `#`: Count or Amount

The non-ASCII characters are specified as Unicode codepoints and the UTF-8 byte sequence that represents them. Since the same characters can be created in many visually similar ways it is important to stick to the exact byte sequences to enable proper interoperability.

You are not limited to the recommended values, although they are the only well known ones that will have to be recognized by any Homie consumer.

#### Target attribute

The `$target` attribute for properties allows a device to communicate an intended state change of a property. This serves 2 main
purposes;

1. closing the control loop for a controller setting a value (if the property is settable).
2. feedback in case a change is not instantaneous (e.g. a light that slowly dimms over a longer period, or a
   motorized valve that takes several minutes to fully open)

If implemented, then a device must first update the `$target` attribute, then start the transition (with
optional state-value updates during the transition), and when done update the property value to match the
`$target` value (functional equivalent, not necessarily a byte-by-byte equality).

If a new target is received (and accepted) from a controller by publishing to the property's `set` topic, then the exact value received must be published to the `$target` topic (byte-by-byte equality). To allow for closing the control loop.

**Notes:**

- a controller can only assume that the command it send to the `set` topic was received and accepted. Not necessarily that it will ever reach the target state, since if another controller updates the property again, it might never reach the target state.
- The same goes for possible conversions (colors), rounding (number formats), etc. it will be very hard to check functional equivalence, since the value published may have a different format. So a controller should NOT implement a retry loop checking the final value. At best they should implement retries until the value set is being accepted.
- Homie devices representing remote hardware (typically when bridging) should NOT set the `$target` attribute upon receiving a change from the hardware device. This is only allowed if the hardware explicitly distinguishes between current value and target value. This is to prevent a loop; e.g. a homie controller sets 100% as target, software instructs hardware to change, intermediate updates received from hardware; 20%, 40%, etc, should NOT overwrite the `$target` value, since that still is 100.


#### Property command topic

* `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]` / **`set`**: The device must subscribe to this topic if the property is **settable** (in the case of actuators for example).

A Homie controller publishes to the `set` command topic with non-retained messages only. See [retained messages](#qos-and-retained-messages).

The assigned and processed payload must be reflected by the Homie device in the property topic `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]` or target attribute `homie` / `5` / `[device ID]` / `[node ID]` / `[property ID]` / `$target` as soon as possible.
This property state update not only informs other devices about the change but closes the control loop for the commanding controller, important for deterministic interaction with the client device.

To give an example: A `kitchen-light` device exposing the `light` node with a settable `power` property subscribes to the topic `homie/5/kitchen-light/light/power/set` for commands:

```java
homie/5/kitchen-light/light/power/set ← "true"
```

In response, the device will turn on the light and upon success update its `power` property state accordingly:

```java
homie/5/kitchen-light/light/power → "true"
```

If the `light` were a dimmable light with a `brightness` property (0-100%), and it would be set to slowly dim over 5 seconds, then the `$target` attribute can be used (assuming once per second updates);

```java
homie/5/kitchen-light/light/brightness/set ← 100
homie/5/kitchen-light/light/brightness/$target → 100
homie/5/kitchen-light/light/brightness → 20  (after 1 second)
homie/5/kitchen-light/light/brightness → 40  (after 2 seconds)
homie/5/kitchen-light/light/brightness → 60  (after 3 seconds)
homie/5/kitchen-light/light/brightness → 80  (after 4 seconds)
homie/5/kitchen-light/light/brightness → 100  (after 5 seconds)
```

## Alert topic

Devices can raise alerts. Alerts are user facing messages that have an ID, they can be set and removed.
The alert topic is defined as;

* `homie` / `5` / `[device ID]` / `$alert` / `[alert ID]` → "alert message"

A device can raise a message on a specific ID. Once the alert is no longer usefull or has been resolved, it can be removed by deleting the topic. Alerts must be send as retained messages. The alert ID must have a valid [ID format](#topic-ids), where topic ID's starting with `$` are reserved for Homie usage.

Examples;
```java
/homie/5/mydevid/$alert/childlost = "Sensor xyz in livingroom hasn't reported updates for 3 hours"
/homie/5/mydevid/$alert/battery = "Battery is low, at 8%"
```

In the examples above, once the situation is resolved (the sensor comes back to live, or the batteries are replaced), the device will delete the topics again, indicating the alerts have been handled.

## Broadcast Topic

Homie defines a broadcast topic, so a controller can broadcast a message to all Homie devices:

* `homie` / `5` / `$broadcast` / **`[subtopic]`**: where `subtopic` can be any topic with single or multiple levels. Each segement must adhere to the [ID format](#topic-ids).

The messages SHOULD be non-retained.

For example, you might want to broadcast an `alert` event with the alert reason as the payload.
Devices are then free to react or not.
In our case, every buzzer of your home automation system would start buzzing.

```java
homie/5/$broadcast/alert ← "Intruder detected"
homie/5/$broadcast/security/alert ← "Intruder detected"
```

## Logging

Since devices may be resource constraint they might not have logging capabilities. Homie provides a specific
topic where devices can send log messages. The topic is defined as;

* `homie` / `5` / `[device ID]` / `$log` / `[level]` 

The topic-value is the logged message, no sub-topics are allowed.
All log messages send should be non-retained.
The `level` is set according to the following table:

level   | description
--------|------------
`debug` | detailed information for troubleshooting purposes
`info`  | informational message, device is working as expected
`warn`  | something potentially harmful happened
`error` | an error happened, the device will continue to operate but functionality might be impaired
`fatal` | a non-recoverable error occured, operation of the device is likely suspended/stopped

```java
homie/5/my-device/$log/warn → "battery low"
homie/5/my-device/$log/error → "sensor value is out of range"
```

Note that MQTT is not meant to be a logging solution, and hence it should be used with care. The implementation should
try and limit the traffic on the MQTT bus. If devices implement messages and levels that can be "noisy", then the
device should provide a configuration option to turn them off, to limit the bandwidth consumed.

## Extensions

This convention only covers the discoverability of devices and their capabilities.
The aim is to have standardized MQTT topics for all kinds of complex scenarios.
A Homie device may therefore support extensions, defined in separate documents.
Every extension is identified by a unique ID.

The ID consists of the reverse domain name and a freely chosen suffix.
The proper term `homie` is reserved and must not be used as a suffix or as part of the domain name.

For example, an organization `example.org` wanting to add a feature `our-feature` would choose the extension ID `org.example.our-feature`.

Every extension must be published using a license.
The license can be chosen freely, even proprietary licenses are possible.
The recommended license is the [CCA 4.0](https://homieiot.github.io/license) since this is the license Homie itself uses.


## Implementation notes

### Device initialization

Some devices require knowledge of their settable retained properties to function properly.
The homie convention does not specify how to initialize/recover them e.g. after a power cycle.
A few common approaches are:

* A device can simply load default values from some configuration file.
* A device can restore its previous state from some local storage. This is the recommended way.
* A device may try to restore its state using MQTT. This can be done by subscribing to the respective channels.
  The controller could set all properties of a device once it becomes `ready`.
  An alternative way is to recover the state from other MQTT channels that are external to the Homie specification.
* If a property is not critical for correctly functioning, there is no need to recover it.

### Device reconfiguration

If a device wishes to modify any of its nodes or properties, it can

* disconnect and reconnect with other values, or
* set `$state=init` and then modify any of the attributes.

Devices can remove old properties and nodes by deleting the respective MQTT topics by publishing an empty message
to those topics (an actual empty string on MQTT level, so NOT the escaped `0x00` byte, see also [empty string values](#empty-string-values)).

When adding many child devices, implementations should take care of not publishing too many parent-updates, since every controller would have to parse the description again and again.

#### Adding children

The recommended way to add child device is as follows:

1. first publish any child-devices, as any other device
    1. set child-device state to `"init"`
    1. publish child-device details (including parent details in `root` and `parent` fields)
    1. set child-device state to `"ready"`
1. update the parent device, as any other change
    1. set parent state to `"init"`
    1. update parent description (add any child IDs to its `children` array)
    1. set parent state to `"ready"`

Be aware that due to MQTT message ordering the consistency at any stage in this process cannot be guaranteed.

#### Removing children

The recommended way to remove child device is as follows:

1. update the parent device
    1. set parent state to `"init"`
    1. update parent description (remove any child IDs from its `children` array)
    1. set parent state to `"ready"`
1. clear any child-device(s) topics, starting with the `$state` topic

Be aware that due to MQTT message ordering the consistency at any stage in this process cannot be guaranteed.

### Versioning

Some considerations related to versioning in this specification;

* compatibility is assumed to be major version only, so version 5 for this spec.
* the base topic includes the major version. This allows controllers to only subscribe to devices they are
compatible with.

#### Backward compatibility

* backward compatibility: a v5 controller controlling a v5 device with a smaller minor version. Eg. a v5.3 
controller sending commands to a v5.0 device.
* Controllers should be aware of unsupported features in older major or minor versions they subscribe to because the spec for that version is known.

#### Forward compatibility

* forward compatibility: a v5 controller controlling a v5 device with a higher minor version. Eg. a v5.0
controller sending commands to a v5.2 device.
* Controllers should ignore unknown fields, properties, attributes, etc. within an object (device, node, or property), but keep the object itself.
* Controllers should ignore the entire object (device, node, or property) if in a known field, property, or attribute an illegal value is encountered. For example;
  * illegal characters in a topic or name
  * unknown data type
  * unknown/illegal format
  * required element missing

### JSON considerations

Validation of JSON payloads is hard. The most common approach to validate JSON data is to use [JSONschema](http://json-schema.org/).
Unfortunately JSONschema is not a standard, it is a long list of mostly incompatible drafts of a potential standard. And as such one
has to take into account the potential differences in implementations. This is about the JSONschema specifics itself as well as its reliance on RegEx engines for string validations, which are also known to be riddled with incompatibilities (typically language/platform specific).

The most popular JSONschema versions over time tend to be [`draft 4`](http://json-schema.org/specification-links.html#draft-4), [`draft 7`](http://json-schema.org/specification-links.html#draft-7) and the latest (at the time of writing) [`2020-12`](http://json-schema.org/specification-links.html#2020-12).

General recommendations;
- If possible use a library that implements the latest JSONschema version available
- When writing schema's make sure they are compatible with the popular versions mentioned above
- Try to avoid RegEx'es, if you have to use them, then;
  - restrict them to character classes and modifiers (`"+", "-", "*", "?"`)
  - do not use back-tracking and OR (`"|"`) constructs (the OR construct can typically be handled on the JSONschema level using an `anyOf` construct)
- If a device fails to parse the JSONschema, or a RegEx, then by default it should skip validation and assume the payload is valid.

### QoS choices explained

The nature of the Homie convention makes it safe about duplicate messages, so QoS levels for reliability **At least once (QoS 1)** 
and **Exactly once (QoS 2)** should both be fine. The recommended level is **Exactly once (QoS 2)**, since a resend on QoS 1 might have a different order, and hence is slightly less reliable, in case another device sends a new message that lands in between the 'send' and 'resend' of the first message. However, the probability of that happening is most likely negligible.

Keep in mind that if you change the QoS level to **At least once (QoS 1)**, then it should be done so for the entire Homie network.
Because the MQTT order will not hold if the QoS levels of messages are different. That said; anyone who accepts the lesser reliability of
**At least once (QoS 1)**, will most likely also not care about the potential ordering issue of mixed QoS levels.

For **non-retained** properties the QoS level is **At most once (QoS 0)** to ensure that events don't arrive late or multiple times. Because the events and commands are time-sensitive. With **At most once (QoS 0)** messages will not be queued by the broker for delivery if the subscriber (a device or controller) is currently disconnected. Which effectively translates to "either you get it now, or you don't get it at all".
