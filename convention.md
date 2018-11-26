# The Homie Convention

Version: **<!--VERSION-->x.x.x<!--VERSION-->**
Date: **<!--DATE-->01. Jan 2000<!--DATE-->**

## MQTT Restrictions

Homie communicates through [MQTT](http://mqtt.org) and is hence based on the basic principles of MQTT topic publication and subscription.

### Topic IDs

An MQTT topic consists of one or more topic levels, separated by the slash character (`/`).
A topic level ID MAY contain lowercase letters from `a` to `z`, numbers from `0` to `9` as well as the hyphen character (`-`).

A topic level ID MUST NOT start or end with a hyphen (`-`).
The special character `$` is used and reserved for Homie *attributes*.
The underscore (`_`) is used and reserved for Homie *node arrays*.

### Payload

- Every MQTT message payload MUST be sent as a UTF-8 encoded string
- The value published as payload MUST be valid for the respective property/attribute type as per the list below
 
String
- String types are limited to 268,435,456 characters 
- An empty string ("") is a valid payload
 
Integer
- Integer types are UTF-8 encoded string literal representations of 64-bit signed whole numbers
- Integers range from -9,223,372,036,854,775,808 (-2<sup>63</sup>) to 9,223,372,036,854,775,807 (2<sup>63</sup>-1)
- The payload may only contain whole numbers and the negation character "-". No other characters including spaces (" ") are permitted 
- A string with just a negation sign ("-") is not a valid payload
- An empty string ("") is not a valid payload
 
Float
- Float types are UTF-8 encoded string literal representations of 64-bit signed floating point numbers
- Floats range from 2<sup>-1074</sup> to (2-2<sup>-52</sup>)&ast;2<sup>1023</sup>
- The payload may only contain whole numbers, the negation character "-", the exponent character "e" or "E" and the decimal separator ".", no other characters, including spaces (" ") are permitted 
- The dot character (".") is the decimal separator (used if necessary) and may only have a single instance present in the payload
- Representations of numeric concepts such as "NaN" (Not a Number) and "Infinity" are not a valid payload
- A string with just a negation sign ("-") is not a valid payload
- An empty string ("") is not a valid payload
 
Boolean
- Booleans must be converted to the string literals "true" or "false"
- Representation is case sensitive, e.g. "TRUE" or "FALSE" are not valid payloads.
- An empty string ("") is not a valid payload
 
Enum
- Enum payloads must be one of the values specified in the format definition of the property
- Enum payloads are case sensitive, e.g. "Car" will not match a format definition of "car"
- Payloads should have leading and trailing whitespace removed
- An empty string ("") is not a valid payload
 
Color
- Color payload validity varies depending on the property format definition of either "rgb" or "hsv"
- Both payload types contain comma separated whole numbers of differing restricted ranges
- The encoded string may only contain whole numbers and the comma character ",", no other characters are permitted, including spaces (" ")
- Payloads for type "rgb" contains 3 comma separated values of numbers with a valid range between 0 and 255. e.g. 100,100,100
- Payloads for type "hsv" contains 3 comma separated values of numbers. The first number has a range of 0 to 360, the second and third numbers have a range of 0 to 100.  e.g. 300,50,75
- An empty string ("") is not a valid payload
 

### QoS and retained messages

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **QoS 1**.
All messages MUST be sent as **retained**, UNLESS stated otherwise.

### Last will

MQTT only allows one last will message per connection.
Homie requires a last will for the `homie` / `device ID` / `$ready` attribute, see [Device Behavior](#device-behavior).
As a consequence a new MQTT connection to the brocker is required per published device.

## Base Topic

The root topic in this document is `homie/`.
If this root topic does not suit your needs (in case of, e.g., a public broker or because of branding),
you can choose another.

Homie controllers must by default perform auto-discovery on the wildcard topic "+/+/$homie".
Controllers are free to restrict discovery to a specific root topic, configurable by the user.

## Timings

As soon as a device starts to publish any Homie related topic,
it MUST finish with all topics within a timeframe of 500ms.
Otherwise a controller can assume that the topic is not set.

## Topology

**Devices:**
An instance of a physical piece of hardware is called a *device*.
For example, a car, an Arduino/ESP8266 or a coffee machine.

**Nodes:**
A *device* can expose multiple *nodes*.
Nodes are independent or logically separable parts of a device.
For example, a car might expose a `wheels` node, an `engine` node and a `lights` node.

Nodes can be **arrays**.
For example, instead of creating two `lights` node to control front lights and back lights independently, we can set the `lights` node to be an array with two elements.

**Properties:**
A *node* can have multiple *properties*.
Properties represent basic characteristics of the node/device, often given as numbers or finite states.
For example the `wheels` node might expose an `angle` property.
The `engine` node might expose a `speed`, `direction` and `temperature` property.
The `lights` node might expose an `intensity` and a `color` property.

Properties can be **settable**.
For example, you don't want your `temperature` property to be settable in case of a temperature sensor (like the car example), but to be settable in case of a thermostat.

Properties can be **retained**.
A property is retained by default. A non-retained property would be useful for momentary events (door bell pressed).

A combination of those flags compiles into this list:

* **retained + non-settable**: The node publishes a property state (temperature sensor)
* **retained + settable**: The node publishes a property state, and can receive commands for the property (by controller or other party) (lamp power)
* **non-retained + non-settable**: The node publishes momentary events (door bell pressed)
* **non-retained + settable**: The node publishes momentary events, and can receive commands for the property (by controller or other party) (brew coffee)

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

The following device attributes are mandatory and MUST be send, even if it is just an empty string.

| Topic       |                                                    Description            |
|-------------|--------------------------------------------------------------------------:|
| $homie      | The implemented Homie convention version                                  |
| $name       | Friendly name of the device                                               |
| $state      | See [Device behavior](#device-behavior)                                   |
| $nodes      | [Nodes](#nodes) the device exposes, separated by `,` for multiple ones.   |
| $extensions | Supported extensions, separated by `,` for multiple ones.                 |

Optional topics include:

| Topic           | Description                   |
|-----------------|-------------------------------|
| $implementation | An identifier for the Homie implementation (example "esp8266")                     |
| $stats          | See [Device statistics](#device-statistics), separated by `,` for multiple ones.   |

For example, a device with an ID of `super-car` that comprises off a `wheels`, `engine` and a `lights` node would send:

```java
homie/super-car/$homie → "2.1.0"
homie/super-car/$name → "Super car"
homie/super-car/$nodes → "wheels,engine,lights[]"
homie/super-car/$implementation → "esp8266"
homie/super-car/$state → "ready"
```

#### Device Behavior

The `$state` device attribute represents, as the name suggests, the current state of the device.
There are 6 different states:

* **`init`**: this is the state the device is in when it is connected to the MQTT broker, but has not yet sent all Homie messages and is not yet ready to operate.
This state is optional, and may be sent if the device takes a long time to initialize, but wishes to announce to consumers that it is coming online. 
* **`ready`**: this is the state the device is in when it is connected to the MQTT broker, has sent all Homie messages and is ready to operate.
You have to send this message after all other announcements message have been sent.
* **`disconnected`**: this is the state the device is in when it is cleanly disconnected from the MQTT broker.
You must send this message before cleanly disconnecting.
* **`sleeping`**: this is the state the device is in when the device is sleeping.
You have to send this message before sleeping.
* **`lost`**: this is the state the device is in when the device has been "badly" disconnected.
You must define this message as LWT.
* **`alert`**: this is the state the device is when connected to the MQTT broker, but something wrong is happening. E.g. a sensor is not providing data and needs human intervention.
You have to send this message when something is wrong.

#### Device Statistics

* `homie` / `device ID` / `$stats`/ **`$device-statistic-attribute`**:
The `$stats/` hierarchy allows to send device attributes that change over time. All defined topic are optional.
The interval defined in `$stats/interval` in seconds is a hint to the controller how often the statistics will be updated.

| Topic           | Description                                                       |
|-----------------|-------------------------------------------------------------------|
| $stats/interval | A hint to the controller how often the statistics will be updated |
| $stats/uptime   | Time elapsed in seconds since the boot of the device              |
| $stats/signal   | Signal strength in %                                              |
| $stats/cputemp  | CPU Temperature in °C                                             |
| $stats/cpuload  | CPU Load in %. Average of last $interval including all CPUs       |
| $stats/battery  | Battery level in %                                                |
| $stats/freeheap | Free heap in bytes                                                |
| $stats/supply   | Supply Voltage in V                                               |

For example, our `super-car` device with `$stats/interval` value "60" is supposed to send its current values every 60 seconds:

```java
homie/super-car/$stats → "uptime,cputemp,signal,battery"
homie/super-car/$stats/interval → "60"
homie/super-car/$stats/uptime → "120"
homie/super-car/$stats/cputemp → "48"
homie/super-car/$stats/signal → "24"
homie/super-car/$stats/battery → "80"
```

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

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: the device can subscribe to this topic if the property is **settable** from the controller, in case of actuators.

Homie is state-based.
You don't tell your smartlight to `turn on`, but you tell it to put its `power` state to `on`.
This especially fits well with MQTT, because of retained message.

For example, a `kitchen-light` device exposing a `light` node would subscribe to `homie/kitchen-light/light/power/set` and it would receive:

```java
homie/kitchen-light/light/power/set ← "true"
```

The device would then turn on the light, and update its `power` state.
This provides pessimistic feedback, which is important for home automation.

```java
homie/kitchen-light/light/power → "true"
```

## Arrays

A node can be an array if you've added `[]` to its ID in the `$nodes` device attribute.

You need to specify these additional attributes on the array node:

| Topic       | Description                                                                               |
|-------------|-------------------------------------------------------------------------------------------|
| $array      | Range separated by a -. e.g. 0-2 for an array with the indexes 0, 1 and 2                 |

The topic for an element of the array node is the name of the node followed by a `_` and the index.

Example:
In the following example two lights are grouped in an array:

```java
homie/super-car/$nodes → "lights[]"

homie/super-car/lights/$name → "Lights"
homie/super-car/lights/$properties → "intensity"
homie/super-car/lights/$array → "0-1"

homie/super-car/lights/intensity/$name → "Intensity"
homie/super-car/lights/intensity/$settable → "true"
homie/super-car/lights/intensity/$unit → "%"
homie/super-car/lights/intensity/$datatype → "integer"
homie/super-car/lights/intensity/$format → "0:100"

homie/super-car/lights_0/$name → "Back lights"
homie/super-car/lights_0/intensity → "0"
homie/super-car/lights_1/$name → "Front lights"
homie/super-car/lights_1/intensity → "100"
```

Note that you can name each element in your array individually ("Back lights", etc.).

## Broadcast Channel

Homie defines a broadcast channel, so a controller is able to broadcast a message to every Homie devices:

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

In addition to homie-core the device may support multiple extensions which are defined in separate conventions.
Every extension is identified by a unique id.
The id consists of the reverse domain name and a freely choosen prefix. For example a company `example.org` that likes to extend homie a cool feature would choose `org.example.cool-feature`. The prefix `homie` is reserved.
