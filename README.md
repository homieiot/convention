![Homie banner](banner.png)

<h1 align="center">The Homie Convention</h1>
<p align="center">Version: <b>2.1.0</b> • <a href="https://github.com/marvinroger/homie/tags">Other versions</a></p>
<p align="center"><i>A lightweight MQTT convention for the IoT</i></p>

**![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) Please note this v2 branch is a work-in-progress. It might change before the final release.**

You can find implementations of the Homie convention on [this page](implementations.md).

----

----

## Table of contents

* [Motivation](#motivation)
* [MQTT restrictions](#mqtt-restrictions)
  * [Topic IDs](#topic-ids)
  * [Payload](#payload)
  * [QoS and retained messages](#qos-and-retained-messages)
* [Topology](#topology)
  * [Base topic](#base-topic)
  * [Devices](#devices)
    * [Device attributes](#device-attributes)
    * [Device behavior](#device-behavior)
    * [Device statistics](#device-statistics)
  * [Nodes](#nodes)
    * [Node attributes](#node-attributes)
  * [Properties](#properties)
    * [Property attributes](#property-attributes)
  * [Arrays](#arrays)
  * [Broadcast channel](#broadcast-channel)

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

## MQTT restrictions

Homie communicates through [MQTT](http://mqtt.org) and is hence based on the basic principles of MQTT topic publication and subscription.

### Topic IDs

An MQTT topic consists of one or more topic levels, separated by the slash character (`/`).
A topic level ID MAY contain lowercase letters from `a` to `z`, numbers from `0` to `9` as well as the hyphen character (`-`).

A topic level ID MUST NOT start or end with a hyphen (`-`).
The special character `$` is used and reserved for Homie *attributes*.
The underscore (`_`) is used and reserved for Homie *node arrays*.

### Payload

Every MQTT message payload MUST be sent as string.
If a value is of a numeric data type, it MUST be converted to string.
Booleans MUST be converted to "true" or "false".
All values MUST be encoded as UTF-8 strings. 

### QoS and retained messages

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **QoS 1**.
All messages MUST be sent as **retained**, UNLESS stated otherwise.

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

**Attributes:**
*Devices, nodes and properties* have specific *attributes* characterizing them.
Attributes are represented by topic identifier starting with `$`.
The precise definition of attributes is important for the automatic discovery of devices following the Homie convention.

Examples: A device might have an `IP` attribute, a node will have a `name` attribute, and a property will have a `unit` attribute.

----

### Base topic

The base topic you will see in the following convention will be `homie/`.
If this base topic does not suit your needs (in case of, e.g., a public broker), you can choose another.

Be aware, that only the default base topic `homie/` is eligible for automatic discovery by third party controllers.

----

### Devices

* `homie` / **`device ID`**: this is the base topic of a device.
Each device must have a unique device ID which adhere to the [ID format](#topic-ids).

#### Device attributes

* `homie` / `device ID` / **`$device-attribute`**:
When the MQTT connection to the broker is established or re-established, the device MUST send its attributes to the broker immediately.

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
    <td>$state</td>
    <td>Device → Controller</td>
    <td>
      See <a href="#device-behavior">Device behavior</a>
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
      To make a node an array, append <code>[]</code> to the ID.
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
  <tr>
    <td>$stats</td>
    <td>Device → Controller</td>
    <td>Specify all optional stats that the device will announce, with format <code>stats</code> separated by a <code>,</code> if there are multiple stats. See next section for an example</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$stats/interval</td>
    <td>Device → Controller</td>
    <td>Interval in seconds at which the device refreshes its <code>$stats/+</code>: See next section for details about statistical attributes</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
</table>

For example, a device with an ID of `super-car` that comprises off a `wheels`, `engine` and a `lights` node would send:

```java
homie/super-car/$homie → "2.1.0"
homie/super-car/$name → "Super car"
homie/super-car/$localip → "192.168.0.10"
homie/super-car/$mac → "DE:AD:BE:EF:FE:ED"
homie/super-car/$fw/name → "weatherstation-firmware"
homie/super-car/$fw/version → "1.0.0"
homie/super-car/$nodes → "wheels,engine,lights[]"
homie/super-car/$implementation → "esp8266"
homie/super-car/$stats/interval → "60"
homie/super-car/$state → "ready"
```

#### Device behavior

The `$state` device attribute represents, as the name suggests, the current state of the device.
There are 6 different states:

* **`init`**: this is the state the device is in when it is connected to the MQTT broker, but has not yet sent all Homie messages and is not yet ready to operate.
This is the first message that must that must be sent.
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

#### Device statistics

* `homie` / `device ID` / `$stats`/ **`$device-statistic-attribute`**:
The `$stats/` hierarchy allows to send device attributes that change over time. The device MUST send them every `$stats/interval` seconds.

<table>
  <tr>
    <th>Topic</th>
    <th>Direction</th>
    <th>Description</th>
    <th>Retained</th>
    <th>Required</th>
  </tr>
  <tr>
    <td>$stats/uptime</td>
    <td>Device → Controller</td>
    <td>Time elapsed in seconds since the boot of the device</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>$stats/signal</td>
    <td>Device → Controller</td>
    <td>Signal strength in %</td>
    <td>Yes</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$stats/cputemp</td>
    <td>Device → Controller</td>
    <td>CPU Temperature in °C</td>
    <td>Yes</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$stats/cpuload</td>
    <td>Device → Controller</td>
    <td>
      CPU Load in %.
      Average of last <code>$interval</code> including all CPUs
    </td>
    <td>Yes</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$stats/battery</td>
    <td>Device → Controller</td>
    <td>Battery level in %</td>
    <td>Yes</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$stats/freeheap</td>
    <td>Device → Controller</td>
    <td>Free heap in bytes</td>
    <td>Yes</td>
    <td>No</td>
  </tr>
  <tr>
    <td>$stats/supply</td>
    <td>Device → Controller</td>
    <td>Supply Voltage in V</td>
    <td>Yes</td>
    <td>No</td>
  </tr>
</table>

For example, our `super-car` device with `$stats/interval` value "60" is supposed to send its current values every 60 seconds:

```java
homie/super-car/$stats → "uptime,cputemp,signal,battery"
homie/super-car/$stats/uptime → "120"
homie/super-car/$stats/cputemp → "48"
homie/super-car/$stats/signal → "24"
homie/super-car/$stats/battery → "80"
```

----

### Nodes

* `homie` / `device ID` / **`node ID`**: this is the base topic of a node.
Each node must have a unique node ID on a per-device basis which adhere to the [ID format](#topic-ids).

#### Node attributes

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
    </td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
    <tr>
       <td>$array</td>
       <td>Device → Controller</td>
       <td>Range separated by a <code>-</code>. e.g. <code>0-2</code> for an array with the indexes <code>0</code>, <code>1</code> and <code>2</code></td>
       <td>Yes</td>
       <td>Yes, if the node is an array</td>
    </tr>
</table>

For example, our `engine` node would send:

```java
homie/super-car/engine/$name → "Car engine"
homie/super-car/engine/$type → "V8"
homie/super-car/engine/$properties → "speed,direction,temperature"
```

----

### Properties

* `homie` / `device ID` / `node ID` / **`property ID`**: this is the base topic of a property.
Each property must have a unique property ID on a per-node basis which adhere to the [ID format](#topic-ids).

* A property value (e.g. a sensor reading) is directly published to the property topic, e.g.:
  ```java
  homie/super-car/engine/temperature → "21.5"
  ```

#### Property attributes

* `homie` / `device ID` / `node ID` / `property ID` / **`$property-attribute`**:
A property attribute MUST be one of these:

<table>
    <tr>
        <th>Topic</th>
        <th>Direction</th>
        <th>Description</th>
        <th>Valid values</th>
        <th>Retained</th>
        <th>Required (Default)</th>
    </tr>
    <tr>
       <td>$name</td>
       <td>Device → Controller</td>
       <td>Friendly name of the property.</td>
       <td>Any String</td>
       <td>Yes</td>
       <td>No ("")</td>
    </tr>
    <tr>
        <td>$settable</td>
        <td>Device → Controller</td>
        <td>Specifies whether the property is settable (<code>true</code>) or readonly (<code>false</code>)</td>
        <td><code>true</code> or <code>false</code></td>
        <td>Yes</td>
        <td>No (<code>false</code>)</td>
    </tr>
    <tr>
        <td>$unit</td>
        <td>Device → Controller</td>
        <td>
          A string containing the unit of this property.
          You are not limited to the recommended values, although they are the only well known ones that will have to be recognized by any Homie consumer.
        </td>
        <td>
            Recommended:<br>
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
        <td>No ("")</td>
    </tr>
    <tr>
       <td>$datatype</td>
       <td>Device → Controller</td>
       <td>Describes the format of data.</td>
       <td>
         <code>integer</code>,
         <code>float</code>,
         <code>boolean</code>,
         <code>string</code>,
         <code>enum</code>,
         <code>color</code>
       </td>
       <td>Yes</td>
       <td>No (<code>string</code>)</td>
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
           <li>
             <code>rgb</code> to provide colors in RGB format e.g. <code>255,255,0</code> for yellow.
             <code>hsv</code> to provide colors in HSV format e.g. <code>60,100,100</code> for yellow.
             <br>Valid for datatype <code>color</code>
           </li>
         </ul>
       </td>
       <td>Yes</td>
       <td>Depends on $datatype</td>
    </tr>
</table>

For example, our `temperature` property would send:

```java
homie/super-car/engine/temperature/$name → "Engine temperature"
homie/super-car/engine/temperature/$settable → "false"
homie/super-car/engine/temperature/$unit → "°C"
homie/super-car/engine/temperature/$datatype → "float"
homie/super-car/engine/temperature/$format → "-20:120"
homie/super-car/engine/temperature → "21.5"
```

* `homie` / `device ID` / `node ID` / `property ID` / **`set`**: the device can subscribe to this topic if the property is **settable** from the controller, in case of actuators.

Homie is state-based.
You don't tell your smartlight to `turn on`, but you tell it to put its `power` state to `on`.
This especially fits well with MQTT, because of retained message.

For example, a `kitchen-light` device exposing a `light` node would subscribe to `homie/kitchen-light/light/power/set` and it would receive:

```java
homie/kitchen-light/light/power/set ← "on"
```

The device would then turn on the light, and update its `power` state.
This provides pessimistic feedback, which is important for home automation.

```java
homie/kitchen-light/light/power → "true"
```

### Arrays

A node can be an array if you've added `[]` to its ID in the `$nodes` device attribute, and if its `$array` attribute is set to the range of the array.
Let's consider we want to control independently the front lights and back lights of our `super-car`. Our `lights` node array would look like this. Note that the topic for an element of the array node is the name of the node followed by a `_` and the index getting updated:

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

----

### Broadcast channel

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
