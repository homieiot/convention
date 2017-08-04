![Homie banner](banner.png)

<h1 align="center">The Homie convention</h1>
<p align="center">A lightweight MQTT convention for the IoT</p>

**![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) Please note this v2 branch is a work-in-progress. It might change before the final release.**

Version: **2.1.0**.

You can find an implementation of the Homie convention:

* An Arduino library built for the ESP8266: [marvinroger/homie-esp8266](https://github.com/marvinroger/homie-esp8266)
* ![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) **WIP** - An opinionated Web UI built with Node.js: [marvinroger/homie-server](https://github.com/marvinroger/homie-server)
* ![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) **WIP** - Some Node-RED nodes for automation: [marvinroger/node-red-contrib-homie](https://github.com/marvinroger/node-red-contrib-homie)
* A Python-implementation for Raspberry Pi & Co.: [jalmeroth/homie-python](https://github.com/jalmeroth/homie-python).
* A Ruby-implementation including a command-line-client with OTA-Support for easy adminstration of multiple Homie-devices: [rttools/hodmin](https://github.com/rttools/hodmin)

------
------

## Background

An instance of a physical piece of hardware (an Arduino, an ESP8266...) is called a **device**.

A device can expose multiple **nodes**. For example, a weather station with two sensors might expose a `base` node and an `windsensor` node.

A node can have multiple **properties**. The `base` node might for example expose a `temperature` property containing the actual temperature, and an `humidity` property containing the actual humidity.
Properties can be **arrays**.
For example, if you have a LED strip, you can have a property `led` ranging from `1` to `10`, to control LEDs independently.
Properties can be **settable**.
For example, you don't want your `temperature` property to be settable in case of a temperature sensor: this depends on the environment and it would not make sense to change it.
However, you will want the `temperature` property to be settable in case of a thermostat.

Devices, nodes and properties have specific **attributes**.
For instance, a device will have an `IP` attribute, a node will have a `name` attribute, and a property will have a `unit` attribute.

## QoS and retained messages

Homie devices communicate through MQTT.

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **QoS 1**.
All messages MUST be sent as **retained**, UNLESS stated otherwise.

## ID format

An ID MAY contain only lowercase letters from `a` to `z`, numbers from `0` to `9`, and it MAY contain `-`, but MUST NOT start or end with a `-`.

------
------

## Convention

### Base

To efficiently parse messages, Homie defines a few rules related to topic names.
The base topic you will see in the following convention will be `homie/`.
If this base topic does not suit you (in case of a public broker, for example), you can choose whatever base topic you want.

A part of a topic starting with a `$` represent an attribute. Its position in the topic define whether the attribute is a device one, node one, or property one.

------

### Device

* `homie` / **`device ID`**: this is the base topic of a device.
Each device must have a unique device ID which adhere to the [ID format](#id-format).

#### Device attributes

* `homie` / `device ID` / `$` **`device attribute`**:
A device attribute MUST be one of these:

<table>
  <tr>
    <th>Topic</th>
    <th>Direction</th>
    <th>Description</th>
    <th>Retained</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>$homie</td>
    <td>Device → Controller</td>
    <td>Version of the Homie convention the device conforms to</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$online</td>
    <td>Device → Controller</td>
    <td>
      <code>true</code> when the device is online, <code>false</code> when the device is offline (through LWT).
      When sending the device is online, this message must be sent last, to indicate every other required messages are sent and the device is ready
    </td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$name</td>
    <td>Device → Controller</td>
    <td>Friendly name of the device</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$localip</td>
    <td>Device → Controller</td>
    <td>IP of the device on the local network</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$mac</td>
    <td>Device → Controller</td>
    <td>Mac address of the device network interface. The format MUST be of the type <code>A1:B2:C3:D4:E5:F6</code></td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$stats/uptime</td>
    <td>Device → Controller</td>
    <td>Time elapsed in seconds since the boot of the device</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$stats/interval</td>
    <td>Device → Controller</td>
    <td>Interval in seconds at which the <code>$stats/uptime</code> is refreshed</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$fw/name</td>
    <td>Device → Controller</td>
    <td>Name of the firmware running on the device. Allowed characters are the same as the device ID</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$fw/version</td>
    <td>Device → Controller</td>
    <td>Version of the firmware running on the device</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$implementation</td>
    <td>Device → Controller</td>
    <td>An identifier for the Homie implementation (example <code>esp8266</code>)</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$implementation/#</td>
    <td>Controller → Device or Device → Controller</td>
    <td>You can use any subtopics of <code>$implementation</code> for anything related to your specific Homie implementation.</td>
    <td>Yes or No, depending of your implementation</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$nodes</td>
    <td>Device → Controller</td>
    <td>
      Nodes the device exposes, with format <code>id</code> separated by a <code>,</code> if there are multiple nodes.
    </td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
</table>

For example, a device with an ID of `686f6d6965` with a temperature and an humidity sensor would send:

```
homie/686f6d6965/$online → true
homie/686f6d6965/$name → Bedroom temperature sensor
homie/686f6d6965/$localip → 192.168.0.10
homie/686f6d6965/$fw/name → 1.0.0
homie/686f6d6965/$fw/version → 1.0.0
```

------

### Node

* `homie` / `device ID` / **`node ID`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adhere to the [ID format](#id-format).

#### Node attributes

* `homie` / `device ID` / `node ID` / `$` **`node attribute`**:
A node attribute MUST be one of these:

<table>
  <tr>
    <th>Topic</th>
    <th>Direction</th>
    <th>Description</th>
    <th>Retained</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>$type</td>
    <td>Device → Controller</td>
    <td>Type of the node</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$name</td>
    <td>Device → Controller</td>
    <td>Friendly name of the Node</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$properties</td>
    <td>Device → Controller</td>
    <td>
      Properties the node exposes, with format <code>id</code> separated by a <code>,</code> if there are multiple nodes.
      To make a property an array, append <code>[]</code> to the ID.
    </td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
</table>

------

### Property

* `homie` / `device ID` / `node ID` / **`property ID`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adhere to the [ID format](#id-format).

#### Property attributes

* `homie` / `device ID` / `node ID` / `property ID` / `$` **`property attribute`**:
A property attribute MUST be one of these:

<table>
    <tr>
        <th>Topic</th>
        <th>Direction</th>
        <th>Description</th>
        <th>Valid values</th>
        <th>Retained</th>
        <th>Required</th>
    </tr>
    <tr>
        <td>$settable</td>
        <td>Device → Controller</td>
        <td>Specifies whether the property is settable (<code>true</code>) or readonly (<code>false</code>)</td>
        <td><code>true</code>,<code>false</code></td>
        <td>Yes</td>
        <td>Yes</td>
    </tr>
    <tr>
        <td>$unit</td>
        <td>Device → Controller</td>
        <td>
          A string containing the unit of this property.
          You are not limited to the recommended values, although they are the only well known ones that will have to be recognized by any Homie consumer.
        </td>
        <td>
            Recommended: <br>
            <code>°C</code> Degree Celsius<br>
            <code>°F</code> Degree Fahrenheit<br>
            <code>°</code> Degree<br>
            <code>L</code> Liter<br>
            <code>gal</code> Galon<br>
            <code>V</code> Volts<br>
            <code>W</code> Watt<br>
            <code>A</code> Ampere<br>
            <code>%</code> Percent<br>
            <code>m</code> Meter<br>
            <code>ft</code> Feet<br>
            <code>Pa</code> Pascal<br>
            <code>psi</code> PSI<br>
            <code>#</code> Count or Amount
        </td>
        <td>Yes</td>
        <td>Yes</td>
    </tr>
    <tr>
       <td>$datatype</td>
       <td>Device → Controller</td>
       <td>Describes the format of data.</td>
       <td>
         <code>integer</code>,
         <code>float</code>,
         <code>boolean</code> (<code>true</code> or <code>false</code>),
         <code>string</code>,
         <code>enum</code>
       </td>
       <td>Yes</td>
       <td>Yes</td>
    </tr>
    <tr>
       <td>$name</td>
       <td>Device → Controller</td>
       <td>Friendly name of the property.</td>
       <td>Any String </td>
       <td>Yes</td>
       <td>Yes</td>
    </tr>
    <tr>
       <td>$format</td>
       <td>Device → Controller</td>
       <td>
        Describes what are valid values for this property.
       </td>
       <td>
         <ul>
           <li>
             <code>from:to</code> Describes a range of values e.g. <code>10:15</code>.
             <br>Valid for datatypes <code>integer</code>, <code>float</code>
           </li>
           <li>
             <code>value,value,value</code> for enumerating all valid values.
             Escape <code>,</code> by using <code>,,</code>. e.g. <code>A,B,C</code> or <code>ON,OFF,PAUSE</code>.
             <br>Valid for datatypes <code>enum</code>
           </li>
           <li>
             <code>regex:pattern</code> to provide a regex that can be used to match the value. e.g. <code>regex:[A-Z][0-9]+</code>.
             <br>Valid for datatype <code>string</code>
           </li>
         </ul>
       </td>
       <td>Yes</td>
       <td>Yes</td>
    </tr>
    <tr>
       <td>$array</td>
       <td>Device → Controller</td>
       <td>Defines the range for an array.</td>
       <td>Range separated by a <code>-</code>. e.g. <code>0-2</code> for an array with the indexes <code>0</code>, <code>1</code> and <code>2</code></td>
       <td>Yes</td>
       <td>Yes, if the property is an array</td>
    </tr>
</table>

For example, our `686f6d6965` above would send:

```
homie/686f6d6965/temperature/$type → temperature
homie/686f6d6965/temperature/$properties → degrees,unit
homie/686f6d6965/temperature/degrees/$settable → false
homie/686f6d6965/temperature/degrees/$unit → C
homie/686f6d6965/temperature/degrees/$datatype → float
homie/686f6d6965/temperature/degrees/$format → -20.0:60
homie/686f6d6965/temperature/degrees → 12.07

homie/686f6d6965/humidity/$type → humidity
homie/686f6d6965/humidity/$properties → percentage
homie/686f6d6965/humidity/percentage/$settable → false
homie/686f6d6965/humidity/percentage/$unit → %
homie/686f6d6965/humidity/percentage/$datatype → integer
homie/686f6d6965/humidity/percentage/$format → 0:100
homie/686f6d6965/humidity/percentage → 79
```

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: the device can subscribe to this topic if the property is **settable** from the controller, in case of actuators.

Homie is state-based.
You don't tell your smartlight to `turn on`, but you tell it to put it's `power` state to `on`.
This especially fits well with MQTT, because of retained message.

For example, a `kitchen-light` device exposing a `light` node would subscribe to `homie/kitchen-light/light/power/set` and it would receive:

```
homie/kitchen-light/light/power/set ← on
```

The device would then turn on the light, and update its `power` state.
This provides pessimistic feedback, which is important for home automation.

```
homie/kitchen-light/light/power → true
```

#### Array

A property can be an array if you've added `[]` to its ID in the `$properties` node attribute, and if its `$array` attribute is set to the range of the array.
A LED strip node would look like this. Note that the topic for an element of the array property is the name of the property followed by a `_` and the index getting updated:

```
homie/ledstrip-device/ledstrip/$type → ledstrip
homie/ledstrip-device/ledstrip/$properties → led[1-3]

homie/ledstrip-device/ledstrip/led/$settable → true
homie/ledstrip-device/ledstrip/led/$unit →
homie/ledstrip-device/ledstrip/led/$datatype → enum
homie/ledstrip-device/ledstrip/led/$format → on,off

homie/ledstrip-device/ledstrip/led_1/$name → Red LEDs
homie/ledstrip-device/ledstrip/led_1 → on
homie/ledstrip-device/ledstrip/led_2/$name → Green LEDs
homie/ledstrip-device/ledstrip/led_2 → off
homie/ledstrip-device/ledstrip/led_3/$name → Blue LEDs
homie/ledstrip-device/ledstrip/led_3 → off
```

------

### Broadcast channel

Homie defines a broadcast channel, so a controller is able to broadcast a message to every Homie devices:

* `homie` / `$broadcast` / **`level`**: `level` is an arbitrary broadcast identifier.
It must adhere to the [ID format](#id-format).

For example, you might want to broadcast an `alert` event with the alert reason as the payload.
Devices are then free to react or not.
In our case, every buzzer of your home automation system would start buzzing.

```
homie/$broadcast/alert ← Intruder detected
```

Any other topic is not part of the Homie convention.
