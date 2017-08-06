![Homie banner](banner.png)

<h1 align="center">The Homie convention</h1>
<p align="center">Version: <b>2.1.0</b></p>
<p align="center"><i>A lightweight MQTT convention for the IoT</i></p>

**![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) Please note this v2 branch is a work-in-progress. It might change before the final release.**

You can find implementations of the Homie convention on [this page](implementations.md).

----
----

<!-- TODO add TOC here after document is stable -->

## Motivation

The Homie convention strives to be a **communication definition on top of MQTT** between IoT devices and controlling entities.

> [MQTT](http://mqtt.org) is a machine-to-machine (M2M)/"Internet of Things" connectivity protocol.
> It was designed as an extremely lightweight publish/subscribe messaging transport.

MQTT supports easy and unrestricted message-based communication.
However, MQTT doesn't define the structure and content of these messages and their relation.
An IoT device publishes data and provides interaction possibilities but a controlling entity will need to be specifically configured to be able to interface with the device.

The Homie convention defines a **standardized way** of how IoT devices and services announce themselves and their data on the communication channel.
The Homie convention is thereby a crucial aspect in the support of **automatic discovery, configuration and usage** of devices and services over the MQTT protocol.

----

Homie communicates through [MQTT](http://mqtt.org) and is hence based on the basic principles of MQTT topic publication and subscription.

## ID Format

IDs are the identifiers used in topic names.
An ID MAY contain:

* lowercase letters from `a` to `z`
* numbers from `0` to `9`
* hyphens `-` to separate ID parts

An ID MUST NOT start or end with a hyphen (`-`).

The special character `$` is used and reserved for Homie *attributes*.

The underscore (`_`) is used and reserved for Homie *property arrays*.


## QoS and Retained Messages

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **QoS 1**.
All messages MUST be sent as **retained**, UNLESS stated otherwise.

## Topology

**Devices:**
An instance of a physical piece of hardware is called a *device*.

Examples: A weather station, an Arduino, an ESP8266, a coffee machine

**Nodes:**
A *device* can expose multiple *nodes*.
Nodes are independent or logically separable parts of a device.

Examples: A weather station might expose an `outdoor-probe` node and a `windsensor` node.

**Properties:**
A *node* can have multiple *properties*.
Properties represent basic characteristics of the node/device, often given as numbers or finite states.

Examples: The `outdoor-probe` node might expose a `temperature` property and a `humidity` property. The `windsensor` node might expose a `speed` and a `direction` property.

Properties can be **arrays**.
For example, An LED strip can have a property `led` ranging from `1` to `10`, to control LEDs independently.

Properties can be **settable**.
For example, you don't want your `temperature` property to be settable in case of a temperature sensor but to be settable in case of a thermostat.

**Attributes:**
*Devices, nodes and properties* have specific *attributes* characterizing them.
Attributes are represented by topic identifier starting with `$`.
The precise definition of attributes is important for the automatic discovery of devices following the Homie convention.

Examples: A device might have an `IP` attribute, a node will have a `name` attribute, and a property will have a `unit` attribute.

### Base Topic

The base topic you will see in the following convention will be `homie/`.
If this base topic does not suit your needs (in case of, e.g., a public broker), you can choose another.

Be aware, that only the default base topic `homie/` is eligible for automatic discovery by third party controllers.

----

### Devices

* `homie` / **`device ID`**: this is the base topic of a device.
Each device must have a unique device ID which adhere to the [ID Format](#id-format).

#### Device Attributes

* `homie` / `device ID` / **`$device-attribute`**:
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
    <td>$name</td>
    <td>Device → Controller</td>
    <td>Friendly name of the device</td>
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
    <td>$nodes</td>
    <td>Device → Controller</td>
    <td>
      Nodes the device exposes, with format <code>id</code> separated by a <code>,</code> if there are multiple nodes.
    </td>
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
</table>

For example, a device with an ID of `686f6d6965` with a `outdoor-probe` and a `windsensor` node would send:

```cpp
homie/686f6d6965/$homie → 2.1.0
homie/686f6d6965/$name → Weather station
homie/686f6d6965/$localip → 192.168.0.10
homie/686f6d6965/$mac → DE:AD:BE:EF:FE:ED
homie/686f6d6965/$stats/uptime → 120
homie/686f6d6965/$stats/interval → 60
homie/686f6d6965/$fw/name → weatherstation-firmware
homie/686f6d6965/$fw/version → 1.0.0
homie/686f6d6965/$nodes → outdoor-probe,windsensor
homie/686f6d6965/$implementation → esp8266
homie/686f6d6965/$online → true
```

----

### Nodes

* `homie` / `device ID` / **`node ID`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adhere to the [ID Format](#id-format).

#### Node Attributes

* `homie` / `device ID` / `node ID` / **`$node-attribute`**:
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
    <td>$name</td>
    <td>Device → Controller</td>
    <td>Friendly name of the Node</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$type</td>
    <td>Device → Controller</td>
    <td>Type of the node</td>
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

For example, our `outdoor-probe` node would send:

```cpp
homie/686f6d6965/outdoor-probe/$name → Weather station outdoor information
homie/686f6d6965/outdoor-probe/$type → sensor-XYZ0815
homie/686f6d6965/outdoor-probe/$properties → temperature,humidity
```

----

### Properties

* `homie` / `device ID` / `node ID` / **`property ID`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adhere to the [ID Format](#id-format).

* A property value (e.g. a sensor reading) is directly published to the property topic, e.g.:
  ```
  homie/686f6d6965/outdoor-probe/temperature → 21.5
  ```

#### Property Attributes

* `homie` / `device ID` / `node ID` / `property ID` / **`$property-attribute`**:
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
       <td>$name</td>
       <td>Device → Controller</td>
       <td>Friendly name of the property.</td>
       <td>Any String </td>
       <td>Yes</td>
       <td>Yes</td>
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

For example, our `temperature` property would send:

```cpp
homie/686f6d6965/outdoor-probe/temperature/$name → Temperature
homie/686f6d6965/outdoor-probe/temperature/$settable → false
homie/686f6d6965/outdoor-probe/temperature/$unit → °C
homie/686f6d6965/outdoor-probe/temperature/$datatype → float
homie/686f6d6965/outdoor-probe/temperature/$format → -20:50
```

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: the device can subscribe to this topic if the property is **settable** from the controller, in case of actuators.

Homie is state-based.
You don't tell your smartlight to `turn on`, but you tell it to put it's `power` state to `on`.
This especially fits well with MQTT, because of retained message.

For example, a `kitchen-light` device exposing a `light` node would subscribe to `homie/kitchen-light/light/power/set` and it would receive:

```cpp
homie/kitchen-light/light/power/set ← on
```

The device would then turn on the light, and update its `power` state.
This provides pessimistic feedback, which is important for home automation.

```cpp
homie/kitchen-light/light/power → true
```

### Arrays

A property can be an array if you've added `[]` to its ID in the `$properties` node attribute, and if its `$array` attribute is set to the range of the array.
A LED strip node would look like this. Note that the topic for an element of the array property is the name of the property followed by a `_` and the index getting updated:

```cpp
homie/ledstrip-device/ledstrip/$type → ledstrip
homie/ledstrip-device/ledstrip/$name → LED strip
homie/ledstrip-device/ledstrip/$properties → led[1-3]

homie/ledstrip-device/ledstrip/led/$name → LEDs
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

Note that you can name each element in your array individually ("Green LEDs", etc.).

----

### Broadcast Channel

Homie defines a broadcast channel, so a controller is able to broadcast a message to every Homie devices:

* `homie` / `$broadcast` / **`level`**: `level` is an arbitrary broadcast identifier.
It must adhere to the [ID format](#id-format).

For example, you might want to broadcast an `alert` event with the alert reason as the payload.
Devices are then free to react or not.
In our case, every buzzer of your home automation system would start buzzing.

```cpp
homie/$broadcast/alert ← Intruder detected
```

Any other topic is not part of the Homie convention.
