# The Homie Convention

Version: **<!--VERSION-->x.x.x<!--VERSION-->**
Date: **<!--DATE-->01. Jan 2000<!--DATE-->**

## MQTT Restrictions

Homie communicates through [MQTT](http://mqtt.org) and is hence based on the basic principles of MQTT topic publication and subscription.

### Topic IDs

An MQTT topic consists of one or more topic levels, separated by the slash character (`/`).
A topic level ID MAY ONLY contain lowercase letters from `a` to `z`, numbers from `0` to `9` as well as the hyphen character (`-`).

A topic level ID MUST NOT start or end with a hyphen (`-`).
The special character `$` is used and reserved for Homie *attributes*.

### QoS and retained messages

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **At least once (QoS 1)**.

* All messages MUST be sent as **retained**, UNLESS stated otherwise.
* Devices publishing values for their non-retained properties must use **non-retained** messages only.
* Controllers setting values for device properties publish to the Property `set` topic with **non-retained** messages only.
* Controllers setting values for Non-retained device properties should publish to the Property `/set` topic with a QoS of **At most once (QoS 0)** to ensure that events don't arrive late or multiple times.

### Last will

Homie requires the last will (LWT) to set the `homie` / `device ID` / `$state` attribute to the value **`lost`**, see [Device Lifecycle](#device-lifecycle).
MQTT only allows one last will message per connection, but since a device can have children, the LWT message MUST be set on the
root device (the device at the root of the parent-child tree).

### Empty string values

MQTT will treat an empty string payload as a "delete" instruction for the topic. Therefor an
empty string value is represented by a 1 character string containing a single byte value 0 (Hex: `0x00`, Dec: `0`).

The empty string (passed as an MQTT payload) can only occur in 2 places;

- `homie5` / `device ID` / `node ID` / `property ID`; reported property values (for string types)
- `homie5` / `device ID` / `node ID` / `property ID` / `set`; the topic to set properties (of string types)

This convention specifies no way to represent an actual value of a 1 character string with a single byte 0. If a device
needs this, then it should provide for an escape mechanism on application level.

### Payload

- Every MQTT message payload MUST be sent as a UTF-8 encoded string
- The value published as payload MUST be valid for the respective property/attribute type as per the list below
 
#### String

- String types are limited to 268,435,456 characters 
- An empty string ("") is a valid payload
 
#### Integer

- Integer types are UTF-8 encoded string literal representations of 64-bit signed whole numbers
- Integers range from -9,223,372,036,854,775,808 (-2<sup>63</sup>) to 9,223,372,036,854,775,807 (2<sup>63</sup>-1)
- The payload may only contain whole numbers and the negation character "-". No other characters including spaces (" ") are permitted 
- A string with just a negation sign ("-") is not a valid payload
- An empty string ("") is not a valid payload
 
#### Float

- Float types are UTF-8 encoded string literal representations of 64-bit signed floating point numbers
- Floats range from +/-(2^-1074) to +/-((2 - 2^-52) * 2^1023)
- The payload may only contain whole numbers, the negation character "-", the exponent character "e" or "E" and the decimal separator ".", no other characters, including spaces (" ") are permitted 
- The dot character (".") is the decimal separator (used if necessary) and may only have a single instance present in the payload
- Representations of numeric concepts such as "NaN" (Not a Number) and "Infinity" are not a valid payload
- A string with just a negation sign ("-") is not a valid payload
- An empty string ("") is not a valid payload
 
#### Boolean

- Booleans must be converted to the string literals "true" or "false"
- Representation is case sensitive, e.g. "TRUE" or "FALSE" are not valid payloads.
- An empty string ("") is not a valid payload
 
#### Enum

- Enum payloads must be one of the values specified in the format definition of the property
- Enum payloads are case sensitive, e.g. "Car" will not match a format definition of "car"
- Payloads should have leading and trailing whitespace removed
- An empty string ("") is not a valid payload
 
#### Color

- Color payload validity varies depending on the property format definition of either "rgb" or "hsv"
- Both payload types contain comma separated numbers of differing restricted ranges. The numbers must conform to the [float](#float) format
- The encoded string may only contain the [float](#float) numbers and the comma character ",", no other characters are permitted, including spaces (" ")
- Payloads for type "rgb" contain 3 comma separated values of [floats](#float) with a valid range between 0 and 255 (inclusive). e.g. 100,100,100
- Payloads for type "hsv" contain 3 comma separated values of [floats](#float). The first number has a range of 0 to 360 (inclusive), the second and third numbers have a range of 0 to 100 (inclusive).  e.g. 300,50,75
- An empty string ("") is not a valid payload

#### DateTime

- DateTime payloads must use the ISO [8601 format](https://en.wikipedia.org/wiki/ISO_8601). 
- An empty string ("") is not a valid payload

#### Duration

- Duration payloads must use the [ISO 8601 duration format](https://en.wikipedia.org/wiki/ISO_8601#Durations)
- The format is PTHHMMSSS, where:
P: Required and indicates a duration.
T: Required and indicates a time.
H: Indicates hour and is preceded by the number of hours, if hours are specified.
M: Indicates minutes, and is preceded by the number of minutes, if minutes are specified.
S: Indicates seconds, preceded by the number of seconds, if seconds are specified.
- An empty string ("") is not a valid payload

## Base Topic

The root topic in this document is `"homie/5/"`.
If this root topic does not suit your needs (in case of, e.g., a public broker or because of branding),
you can change the first segment, but the `"/5/"` segment must be retained. This allows controllers
to subscribe to only the devices they are compatible with.

Homie 5 controllers must by default perform auto-discovery on the wildcard topic `"+/5/+/$state"`.
Controllers are free to restrict discovery to a specific root topic, configurable by the user.

## Topology

**Devices:**
An instance of a physical piece of hardware is called a *device*.
For example, a car, an Arduino/ESP8266 or a coffee machine.
Within the convention devices can be modelled to have children. For example bridge
devices; a zwave bridge device (the parent) exposing many child devices (the
zwave devices). There is no depth limit set on additionally nested children.

**Nodes:**
A *device* can expose multiple *nodes*.
Nodes are independent or logically separable parts of a device.
For example, a car might expose a `wheels` node, an `engine` node and a `lights` node.

**Properties:**
A *node* can have multiple *properties*.
Properties represent basic characteristics of the node/device, often given as numbers or finite states.
For example the `wheels` node might expose an `angle` property.
The `engine` node might expose a `speed`, `direction` and `temperature` property.
The `lights` node might expose an `intensity` and a `color` property.

**Attributes:**
*Devices, nodes and properties* have specific *attributes* characterizing them.
Attributes are represented by topic identifier starting with `$`.
The precise definition of attributes is important for the automatic discovery of devices following the Homie convention.

Examples: A device might have an `IP` attribute, a node will have a `name` attribute, and a property will have a `unit` attribute.

### Devices

* `homie` / **`device ID`**: this is the base topic of a device.
Each device must have a unique device ID which adhere to the [ID format](#topic-ids).

#### Device Attributes

* `homie` / `device ID` / **`$device-attribute`**:

The following device attributes are mandatory and MUST be sent.

| Topic       |                                                    Description            |
|-------------|--------------------------------------------------------------------------|
| $state      | Reflects the current state of the device. See [Device Lifecycle](#device-lifecycle) |
| $description| The description document (JSON), describing the device, nodes and properties of this device. **Important**: this value may only change when the device `$state` is either `init`, `disconnected`, or `lost`. |

The JSON description document has the following format;

|Property   | Type         | Required | Nullable | Description |
|-----------|--------------|----------|----------|-------------|
| homie     |string        | yes      | no       | The implemented Homie convention version, without the "patch" level. So the format is `"5.x"`, where the `'x'` is the minor version. |
| version   | integer      | yes      | no       | The version of the description document. Whenever the document changes, a new higher version must be assigned. This does not need to be sequential, eg. a timestamp could be used. |
| nodes     |array-objects | no       | no       | Array of [Nodes](#nodes) the device exposes. Should be omitted if empty. |
| name      |string        | yes      | no       | Friendly name of the device |
| children  |array-strings | no       | no       | Array of [ID](#topic-ids)'s of child devices. Should be omitted if empty. |
| root      |string        | yes/no   | no       | [ID](#topic-ids) of the root parent device. **Required** if the device is not the root device, must be omitted otherwise. |
| parent    |string        | yes/no   | no       | [ID](#topic-ids) of the parent device. Defaults to the `root` ID. **Required** if the parent is NOT the root device, should be omitted otherwise. |
| extensions|array-strings | no       | no       | Array of supported extensions. Should be omitted if empty. |

For example, a device with an ID of `super-car` that comprises of a `wheels`, `engine` and a `lights` node would send:
```java
homie/5/super-car/$state → "ready"
homie/5/super-car/$description → following JSON document;
```
```json
      {
        "homie": "5.0",
        "name": "Super car",
        "version": 7,
        "nodes": [ 
          { "id": "wheels", ... },
          { "id": "engine", ... },
          { "id": "lights", ... }
        ]
      }
```

#### Device hierarchy

Devices can be organized in parent-child relationships. These are expressed via the device
attributes `root`, `parent`, and `children`. In any parent-child tree there is only one
"root" device, which is the top level device that has no parent, but only children.

Example: a ZWave bridge (`id = "bridge"`), which exposes a ZWave device with a dual-relay (`id = "dualrelay"`),
which respectively control Light1 (`id = "light1"`) and Light2 (`id = "light2"`). So there are 4 devices in total.
Then these are the attribute values:

|Attribute  | Zwave bridge   | Relay                | first light | second light |
|-----------|----------------|----------------------|-------------|--------------|
| id        | "bridge"       | "dualrelay"          | "light1"    | "light2"     |
| children  | ["dualrelay"]  | ["light1", "light2"] |             |              |
| root      |                | "bridge"             | "bridge"    | "bridge"     |
| parent    |                |                      | "dualrelay" | "dualrelay"  |

To monitor the `state` of child devices in this tree 2 topic subscriptions are needed. The `$state` attribute of the device itself, as well as the `$state` attribute of its root device.
Because if the root device looses its connection to the MQTT server, the last will (LWT), will set its `$state` attribute to `"lost"`, but it will not update the child-device states. Hence the need for 2 topic subscriptions.

#### Device Lifecycle

The `$state` device attribute represents the current state of the device. **Important**: for child devices also the root-device state should be taken into account.

There are 6 different states:

* **`init`**: this is the state the device is in when it is connected to the MQTT broker, but has not yet sent all Homie messages and is not yet ready to operate.
This state is optional, and may be sent if the device takes a long time to initialize, but wishes to announce to consumers that it is coming online. 
A device may fall back into this state to do some reconfiguration.
* **`ready`**: this is the state the device is in when it is connected to the MQTT broker and has sent all Homie messages for describing the device attributes, nodes, properties and their values. The device has subscribed to all appropriate `/set` topics and is ready to receive messages. 
* **`disconnected`**: this is the state the device is in when it is cleanly disconnected from the MQTT broker.
You must send this message before cleanly disconnecting.
* **`sleeping`**: this is the state the device is in when the device is sleeping.
You have to send this message before sleeping.
* **`lost`**: this is the state the device is in when the device has been "badly" disconnected. **Important**: If a root-device `$state` is `"lost"` then the state of **every child device in its tree** is also `"lost"`.
You must define this message as last will (LWT) for root devices.
* **`alert`**: this is the state the device is when connected to the MQTT broker, but something wrong is happening. E.g. a sensor is not providing data and needs human intervention.
You have to send this message when something is wrong.


### Nodes

* `homie` / `device ID` / **`node ID`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adhere to the [ID format](#topic-ids).

#### Node Attributes

There are no node properties in MQTT topics for this level.

The Node object itself is described in the `homie` / `device ID` / `$description` JSON document. The Node object has the following fields:

|Property   | Type         | Required | Nullable | Description |
|-----------|--------------|----------|----------|-------------|
| id        |string        | yes      | no       | [ID](#topic-ids) of the Node. |
| name      |string        | yes      | no       | Friendly name of the Node. |
| properties|array-objects | no       | no       | Array of [Properties](#properties) the Node exposes. Should be omitted if empty. |

For example, our `engine` node would look like this:

```json
      {
        "id": "engine",
        "name": "Car engine",
        "properties": [ 
          { "id": "speed", ... },
          { "id": "direction", ... },
          { "id": "temperature", ... }
        ]
      }
```

### Properties

* `homie` / `device ID` / `node ID` / **`property ID`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adhere to the [ID format](#topic-ids).

* A property payload (e.g. a sensor reading) is directly published to the property topic, e.g.:
  ```java
  homie/5/super-car/engine/temperature → "21.5"
  ```
  
* Properties can be **settable**.
  For example, you don't want your `temperature` property to be settable in case of a temperature sensor
  (like the car example), but to be settable in case of a thermostat.

* Properties can be **retained**.
  A property is retained by default. A non-retained property would be useful for momentary events (door bell pressed).
  See also [QoS settings](#qos-and-retained-messages).

A combination of those flags compiles into this list:

| retained | settable | description |
|----------|----------|-------------|
| yes      | yes      | The node publishes a property state, and can receive commands for the property (by controller or other party) (lamp power)
| yes      | no       | (default) The node publishes a property state (temperature sensor)
| no       | yes      | The node publishes momentary events, and can receive commands for the property (by controller or other party) (brew coffee)
| no       | no       | The node publishes momentary events (door bell pressed)


#### Property Attributes

There are no properties in MQTT topics for this level.

The Property object itself is described in the `homie` / `device ID` / `$description` JSON document. The Property object has the following fields:

|Property   | Type         | Required | Default | Description |
|-----------|--------------|----------|----------|-------------|
| id        | string       | yes      |          | [ID](#topic-ids) of the Property. |
| name      | string       | yes      |          | Friendly name of the Property. |
| datatype  | string       | yes      |          | The data type. See [Payloads](#payload). Any of the following values: `"integer", "float", "boolean", "string", "enum", "color", "datetime", "duration"`. |
| format    | string       | see [formats](#formats)   | see [formats](#formats) | Specifies restrictions or options for the given data type. |
| settable  | boolean      | no       | `false`  | Whether the Property is settable. Should be omitted if `false`. |
| retained  | boolean      | no       | `true`   | Whether the Property is retained. Should be omitted if `true`. |
| unit      | string       | no       |          | Unit of this property. See [units](#units). |


For example, our `temperature` property would look like this in the device/node description document:

```json
      {
        "id": "temperature",
        "name": "Engine temperature",
        "unit": "°C",
        "datatype": "float",
        "format": "-20:120"
      }
```
And the following MQTT topic with the reported property value:
```java
homie/5/super-car/engine/temperature → "21.5"
```

#### Formats

The format attribute specifies restrictions or options for the given data type.

| Type         | Required | Default | Description |
|--------------|----------|----------|-------------|
| float        | no       | `:`      | `min:max` where min and max are the respective minimum and maximum (inclusive) allowed values, both represented in the format for [float types](#float). Eg. `10.123:15.123`. If the minimum and/or maximum are missing from the format, then they are open-ended, so `0:` allows a value >= 0.|
| integer      | no       | `:`      | `min:max` where min and max are the respective minimum and maximum (inclusive) allowed values, both represented in the format for [integer types](#integer). Eg. `5:35`. If the minimum and/or maximum are missing from the format, then they are open-ended, so `:10` allows a value <= 10 |
| enum         | yes      |          | A comma-separated list of non-quoted values. Eg. `value1,value2,value3`. If quotes or whitespace are used adjacent of the '`,`' (comma), then they are part of the value. Individual values can not be an empty string, hence at least 1 value must be specified in the format. |
| color        | yes      |          | `rgb` or `hsv`. See the [color type](#integer) for the resulting value formats. |
| boolean      | no       | `false,true` | Identical to an enum with 2 entries. The first represent the `false` value and the second the `true` value. Eg. `close,open` or `off,on`. If provided, then both entries must be specified. **Important**:  the format does NOT specify valid payloads, they are descriptions of the valid payloads `false` and `true`. |


#### Units

Recommended unit strings:

* `°C`: Degree Celsius
* `°F`: Degree Fahrenheit
* `°`: Degree (UTF8: `U+00B0`, Hex: `0xc2 0xb0`, Dec: `194 176`)
* `L`: Liter
* `gal`: Galon
* `V`: Volts
* `W`: Watt
* `kW`: Kilowatt
* `kWh`: Kilowatt-hour
* `A`: Ampere
* `%`: Percent
* `m`: Meter
* `m³`: Cubic meter ('³' is UTF8: `U+00B3`, Hex: `0xc2 0xb3`, Dec: `194 179`)
* `ft`: Feet
* `Pa`: Pascal
* `psi`: PSI
* `#`: Count or Amount

You are not limited to the recommended values, although they are the only well known ones that will have to be recognized by any Homie consumer.

#### Property command topic

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: The device must subscribe to this topic if the property is **settable** (in case of actuators for example).

A Homie controller publishes to the `set` command topic with non-retained messages only. See [retained messages](#qos-and-retained-messages).

The assigned and processed payload must be reflected by the Homie device in the property topic `homie` / `device ID` / `node ID` / `property ID` as soon as possible.
This property state update not only informs other devices about the change but closes the control loop for the commanding controller, important for deterministic interaction with the client device.

To give an example: A `kitchen-light` device exposing the `light` node with a settable `power` property subscribes to the topic `homie/5/kitchen-light/light/power/set` for commands:

```java
homie/5/kitchen-light/light/power/set ← "true"
```

In response the device will turn on the light and upon success update its `power` property state accordingly:

```java
homie/5/kitchen-light/light/power → "true"
```

## Broadcast Topic

Homie defines a broadcast topic, so a controller is able to broadcast a message to all Homie devices:

* `homie` / `$broadcast` / **`subtopic`**: `subtopic` can be any topic with single or multiple levels.
It must adhere to the [ID format](#topic-ids).

For example, you might want to broadcast an `alert` event with the alert reason as the payload.
Devices are then free to react or not.
In our case, every buzzer of your home automation system would start buzzing.

```java
homie/5/$broadcast/alert ← "Intruder detected"
homie/5/$broadcast/security/alert ← "Intruder detected"
```

Any other topic is not part of the Homie convention.

## Extensions

This convention only covers discoverability of devices and its capabilities.
The aim is to have standardized MQTT topics for all kind of complex scenarios.
A Homie device may therefore support extensions, defined in separate documents.
Every extension is identified by a unique ID.

The ID consists of the reverse domain name and a freely chosen suffix.
The proper term `homie` is reserved and must not be used as the suffix or as part of the domain name.

For example, an organization `example.org` wanting to add a feature `our-feature` would choose the extension ID `org.example.our-feature`.

Every extension must be published using a license.
The license can be chosen freely, even proprietary licenses are possible.
The recommended license is the [CCA 4.0](https://homieiot.github.io/license), since this is the license Homie itself uses.

## Versioning

Some considerations related to versioning in this specification;

* compatibility is assumed to be major version only, so version 5 for this spec.
* the base topic includes the major version. This allows controllers to only subscribe to devices they are
compatible with.

### Backward compatibility

* backward compatibility: a v5 controller controlling a v5 device with a smaller minor version. Eg. a v5.3 
controller sending commands to a v5.0 device.
* Controllers should be aware of unsupported features in older major or minor versions they subscribe to, because the spec for that version is known.

### Forward compatibility

* forward comaptibility: a v5 controller controlling a v5 device with a higher minor version. Eg. a v5.0
controller sending commands to a v5.2 device.
* Controllers should ignore unknown fields, properties, attributes, etc. within an object (device, node, or property), but keep the object itself.
* Controllers should ignore the entire object (device, node, or property) if in a known field, property, or attribute an illegal value is encountred. For example;
  * illegal characters in a topic or name
  * unknown data type
  * unknown/illegal format
  * required element missing


## Implementation notes

### Device initialization

Some devices require knowledge of their settable retained properties to function properly.
The homie convention does not specify how to initialize/recover them e.g. after a power cycle.
A few common approaches are:

* A device can simply load default values from some configuration file.
* A device can restore its previous state from some local storage. This is the recommended way.
* A device may try to restore its state using MQTT. This can be done by subcribing to the respective channels.
  The controller could set all properties of a device once it becomes `ready`.
  An alternative way is to recover the state from other MQTT channels that are external to the Homie specification.
* If a property is not critical for correct function, there is no need to recover it.

### Device reconfiguration

If a device wishes to modify any of its nodes or properties, it can

* disconnect and reconnect with other values, or
* set `$state=init` and then modify any of the attributes.

Devices can remove old properties and nodes by publishing a zero-length payload on the respective topics.
