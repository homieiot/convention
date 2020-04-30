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
- Floats range from 2<sup>-1074</sup> to (2-2<sup>-52</sup>)&ast;2<sup>1023</sup>
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
- Both payload types contain comma separated whole numbers of differing restricted ranges
- The encoded string may only contain whole numbers and the comma character ",", no other characters are permitted, including spaces (" ")
- Payloads for type "rgb" contains 3 comma separated values of numbers with a valid range between 0 and 255. e.g. 100,100,100
- Payloads for type "hsv" contains 3 comma separated values of numbers. The first number has a range of 0 to 360, the second and third numbers have a range of 0 to 100.  e.g. 300,50,75
- An empty string ("") is not a valid payload

#### DateTime

- DateTime payloads must use the ISO 8601 format. 
- An empty string ("") is not a valid payload

### QoS and retained messages

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **At least once (1)**.
All messages MUST be sent as **retained**, UNLESS stated otherwise.

### Last will

MQTT only allows one last will message per connection.
Homie requires the last will (LWT) to set the `homie` / `device ID` / `$state` attribute to the value **`lost`**, see [Device Lifecycle](#device-lifecycle).
As a consequence a new MQTT connection to the broker is required per published device.

## Base Topic

The root topic in this document is `homie/`.
If this root topic does not suit your needs (in case of, e.g., a public broker or because of branding),
you can choose another.

Homie controllers must by default perform auto-discovery on the wildcard topic "+/+/$homie".
Controllers are free to restrict discovery to a specific root topic, configurable by the user.

## Topology

**Devices:**
An instance of a physical piece of hardware is called a *device*.
For example, a car, an Arduino/ESP8266 or a coffee machine.

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

The following device attributes are mandatory and MUST be sent, even if it is just an empty string.

| Topic       |                                                    Description            |
|-------------|--------------------------------------------------------------------------:|
| $homie      | The implemented Homie convention version                                  |
| $name       | Friendly name of the device                                               |
| $state      | See [Device Lifecycle](#device-lifecycle)                                   |
| $nodes      | [Nodes](#nodes) the device exposes, separated by `,` for multiple ones.   |
| $extensions | Supported extensions, separated by `,` for multiple ones.                 |

Optional topics include:

| Topic           | Description                   |
|-----------------|-------------------------------|
| $implementation | An identifier for the Homie implementation (example "esp8266")                     |

For example, a device with an ID of `super-car` that comprises of a `wheels`, `engine` and a `lights` node would send:

```java
homie/super-car/$homie → "2.1.0"
homie/super-car/$name → "Super car"
homie/super-car/$nodes → "wheels,engine,lights"
homie/super-car/$implementation → "esp8266"
homie/super-car/$state → "ready"
```

#### Device Lifecycle

The `$state` device attribute represents the current state of the device.
There are 6 different states:

* **`init`**: this is the state the device is in when it is connected to the MQTT broker, but has not yet sent all Homie messages and is not yet ready to operate.
This state is optional, and may be sent if the device takes a long time to initialize, but wishes to announce to consumers that it is coming online. 
A device may fall back into this state to do some reconfiguration.
* **`ready`**: this is the state the device is in when it is connected to the MQTT broker and has sent all Homie messages for describing the device attributes, nodes, properties and their values. The device has subscribed to all appropriate `/set` topics and is ready to receive messages. 
* **`disconnected`**: this is the state the device is in when it is cleanly disconnected from the MQTT broker.
You must send this message before cleanly disconnecting.
* **`sleeping`**: this is the state the device is in when the device is sleeping.
You have to send this message before sleeping.
* **`lost`**: this is the state the device is in when the device has been "badly" disconnected.
You must define this message as LWT.
* **`alert`**: this is the state the device is when connected to the MQTT broker, but something wrong is happening. E.g. a sensor is not providing data and needs human intervention.
You have to send this message when something is wrong.

The following MQTT topics must remain unchanged when a device is in `ready`, `sleeping` or `alert` state:

* Any device attributes except `$name` and `$state`
* The `$properties` attribute of any node
* Any attribute of any property except `$name`

### Nodes

* `homie` / `device ID` / **`node ID`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adhere to the [ID format](#topic-ids).

#### Node Attributes

* `homie` / `device ID` / `node ID` / **`$node-attribute`**:

All listed attributes are **required**. A node attribute MUST be one of these:

| Topic       | Description                                                                               |
|-------------|-------------------------------------------------------------------------------------------|
| $name       | Friendly name of the Node                                                                 |
| $type       | Type of the node                                                                          |
| $properties | Exposed properties, separated by `,` for multiple ones.                                   |

For example, our `engine` node would send:

```java
homie/super-car/engine/$name → "Car engine"
homie/super-car/engine/$type → "V8"
homie/super-car/engine/$properties → "speed,direction,temperature"
```

### Properties

* `homie` / `device ID` / `node ID` / **`property ID`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adhere to the [ID format](#topic-ids).

* A property payload (e.g. a sensor reading) is directly published to the property topic, e.g.:
  ```java
  homie/super-car/engine/temperature → "21.5"
  ```
  
* Properties can be **settable**.
  For example, you don't want your `temperature` property to be settable in case of a temperature sensor
  (like the car example), but to be settable in case of a thermostat.

* Properties can be **retained**.
  A property is retained by default. A non-retained property would be useful for momentary events (door bell pressed).
  Non-retained properties must be sent with a QoS of **Exactly once (2)** (this applies for both the value and the `/set`-command, but not for any of the attributes).

A combination of those flags compiles into this list:

* **retained + non-settable**: The node publishes a property state (temperature sensor)
* **retained + settable**: The node publishes a property state, and can receive commands for the property (by controller or other party) (lamp power)
* **non-retained + non-settable**: The node publishes momentary events (door bell pressed)
* **non-retained + settable**: The node publishes momentary events, and can receive commands for the property (by controller or other party) (brew coffee)


#### Property Attributes

* `homie` / `device ID` / `node ID` / `property ID` / **`$property-attribute`**:

The following attributes are required:

| Topic     | Description                                          | Payload type                                |
|-----------|------------------------------------------------------|---------------------------------------------|
| $name     | Friendly name of the property.                       | String                                  |
| $datatype | The data type. See [Payloads](#payloads).            | Enum: \[integer, float, boolean,string, enum, color\] |

The following attributes are optional:

| Topic     | Description                                          |  Payload type                                |
|-----------|------------------------------------------------------|---------------------------------------------|
| $format   | Specifies restrictions or options for the given data type | See below                                 |
| $settable     | Settable (<code>true</code>). Default is read-only (<code>false</code>)  | Boolean     |
| $retained     | Non-retained (<code>false</code>). Default is Retained (<code>true</code>).  | Boolean     |
| $unit     | Optional unit of this property. See list below.  | String     |

For example, our `temperature` property would send:

```java
homie/super-car/engine/temperature/$name → "Engine temperature"
homie/super-car/engine/temperature/$settable → "false"
homie/super-car/engine/temperature/$unit → "°C"
homie/super-car/engine/temperature/$datatype → "float"
homie/super-car/engine/temperature/$format → "-20:120"
homie/super-car/engine/temperature → "21.5"
```

Format:

* For `integer` and `float`: Describes a range of payloads e.g. `10:15`
* For `enum`: `payload,payload,payload` for enumerating all valid payloads.
* For `color`:
  - `rgb` to provide colors in RGB format e.g. `255,255,0` for yellow.
  - `hsv` to provide colors in HSV format e.g. `60,100,100` for yellow.

Recommended unit strings:

* `°C`: Degree Celsius
* `°F`: Degree Fahrenheit
* `°`: Degree
* `L`: Liter
* `gal`: Galon
* `V`: Volts
* `W`: Watt
* `A`: Ampere
* `%`: Percent
* `m`: Meter
* `ft`: Feet
* `Pa`: Pascal
* `psi`: PSI
* `#`: Count or Amount

You are not limited to the recommended values, although they are the only well known ones that will have to be recognized by any Homie consumer.

#### Property command topic

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: The device must subscribe to this topic if the property is **settable** (in case of actuators for example).

A Homie controller publishes to the `set` command topic with non-retained messages only.

The assigned and processed payload must be reflected by the Homie device in the property topic `homie` / `device ID` / `node ID` / `property ID` as soon as possible.
This property state update not only informs other devices about the change but closes the control loop for the commanding controller, important for deterministic interaction with the client device.

To give an example: A `kitchen-light` device exposing the `light` node with a settable `power` property subscribes to the topic `homie/kitchen-light/light/power/set` for commands:

```java
homie/kitchen-light/light/power/set ← "true"
```

In response the device will turn on the light and upon success update its `power` property state accordingly:

```java
homie/kitchen-light/light/power → "true"
```

## Broadcast Channel

Homie defines a broadcast channel, so a controller is able to broadcast a message to all Homie devices:

* `homie` / `$broadcast` / **`level`**: `level` is an arbitrary broadcast identifier.
It must adhere to the [ID format](#topic-ids).

For example, you might want to broadcast an `alert` event with the alert reason as the payload.
Devices are then free to react or not.
In our case, every buzzer of your home automation system would start buzzing.

```java
homie/$broadcast/alert ← "Intruder detected"
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

## Implementation notes

### Device initialization

Some devices require knowledge of their settable retained properties to function properly.
The homie convention does not specify how to initialize/recover them e.g. after a power cycle.
A few common approaches are:

* A device can simply load default values from some configuration file.
* A device can restore its previous state from some local storage. This is the recommended way.
* A device may try to restore its state using MQTT. This can be done by subcribing to the respective channels.
An alternative way is to recover the state from other MQTT channels that are external to the Homie specification.
This is not a recommended approach though, because retained messages are only sent by the broker in response to a new subscription.
So if a device doesn't reconnect with a clean session, then the retained messages won't be resent.
* If a property is not critical for correct function, there is no need to recover it.

### Device reconfiguration

If a device wishes to modify any of its nodes or properties, it can

* disconnect and reconnect with other values, or
* set `$state=init` and then modify any of the attributes.

Devices can remove old properties and nodes by publishing a zero-length payload on the respective topics.
