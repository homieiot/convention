![Homie banner](banner.png)

<h1 align="center">The Homie convention</h1>

**Please note this v2 branch is a work-in-progress. It might change before the final release.**

Version: **2.0.0**.

Homie is a lightweight MQTT convention for the IoT.

You can find an implementation of the Homie convention:

* An Arduino library built for the ESP8266: [marvinroger/homie-esp8266](https://github.com/marvinroger/homie-esp8266)
* ![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) **WIP** - An opinionated Web UI built with Node.js: [marvinroger/homie-server](https://github.com/marvinroger/homie-server)
* ![WIP](https://cdn2.iconfinder.com/data/icons/thesquid-ink-40-free-flat-icon-pack/64/barricade-24.png) **WIP** - Some Node-RED nodes for automation: [marvinroger/node-red-contrib-homie](https://github.com/marvinroger/node-red-contrib-homie)
* A Python-implementation for Raspberry Pi & Co.: [jalmeroth/homie-python](https://github.com/jalmeroth/homie-python).
* A Ruby-implementation including a command-line-client with OTA-Support for easy adminstration of multiple Homie-devices: [rttools/hodmin](https://github.com/rttools/hodmin)

## Background

An instance of a physical piece of hardware (an Arduino, an ESP8266...) is called a **device**. A device has **device properties**, like the current local IP, the Wi-Fi signal, etc. A device can expose multiple **nodes**. For example, a weather device might expose a `temperature` node and an `humidity` node. A node can have multiple **node properties**. The `temperature` node might for example expose a `degrees` property containing the actual temperature, and an `unit` property. Node properties can be **ranges**. For example, if you have a LED strip, you can have a node property `led` ranging from `1` to `10`, to control LEDs independently. Node properties can be **settable**. For example, you don't want your `degrees` property to be settable in case of a temperature sensor: this depends on the environment and it would not make sense to change it. However, you will want the `degrees` property to be settable in case of a thermostat.

## QoS and retained messages

Homie devices communicate through MQTT.

The nature of the Homie convention makes it safe about duplicate messages, so the recommended QoS for reliability is **QoS 1**. All messages MUST be sent as **retained**, UNLESS stated otherwise.

## ID format

An ID MAY contain only lowercase letters from `a` to `z`, numbers from `0` to `9`, and it MAY contain `-`, but MUST NOT start or end with a `-`.

## Convention

To efficiently parse messages, Homie defines a few rules related to topic names. The base topic you will see in the following convention will be `homie/`. You can however choose whatever base topic you want.

* `homie` / **`device ID`**: this is the base topic of a device. Each device must have an unique device ID which adhere to the [ID format](#id-format).

### Device properties

* `homie` / **`device ID`** / `$` **`device property`**: a topic starting with a `$` after the base topic of a device represents a device property. A device property MUST be one of these:

<table>
  <tr>
    <th>Property</th>
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
    <td><code>true</code> when the device is online, <code>false</code> when the device is offline (through LWT). When sending the device is online, this message must be sent last, to indicate every other required messages are sent and the device is ready</td>
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
    <td>$stats/signal</td>
    <td>Device → Controller</td>
    <td>Integer representing the Wi-Fi signal quality in percentage if applicable</td>
    <td>Yes</td>
    <td>No, this is not applicable to an Ethernet connected device for example</td>
  </tr>
  <tr>
    <td>$stats/interval</td>
    <td>Device → Controller</td>
    <td>Interval in seconds at which the <code>$stats/uptime</code> and <code>$stats/signal</code> are refreshed</td>
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
    <td>$fw/checksum</td>
    <td>Device → Controller</td>
    <td>MD5 checksum of the firmware running on the device</td>
    <td>Yes</td>
    <td>No, depending of your implementation</td>
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
    <td>Nodes the device exposes, with format <code>id</code> separated by a <code>,</code> if there are multiple nodes.</td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
</table>

For example, a device with an ID of `686f6d6965` with a temperature and an humidity sensor would send:

```
homie/686f6d6965/$online → true
homie/686f6d6965/$name → Bedroom temperature sensor
homie/686f6d6965/$localip → 192.168.0.10
homie/686f6d6965/$signal → 72
homie/686f6d6965/$fw/name → 1.0.0
homie/686f6d6965/$fw/version → 1.0.0
```

### Node properties

* `homie` / **`device ID`** / **`node ID`** / **`property`**: `node ID` is the ID of the node, which must be unique on a per-device basis, and which adhere to the [ID format](#id-format). `property` is the property of the node that is getting updated, which must be unique on a per-node basis, and which adhere to the [ID format](#id-format).

Properties starting with a `$` are special properties. It must be one of the following:

<table>
  <tr>
    <th>Property</th>
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
    <td>$properties</td>
    <td>Device → Controller</td>
    <td>Properties the node exposes, with format <code>id</code> separated by a <code>,</code> if there are multiple nodes. For ranges, define the range after the <code>id</code>, within <code>[]</code> and separated by a <code>-</code>. For settable properties, add <code>:settable</code> to the <code>id</code></td>
    <td>Yes</td>
    <td>Yes</td>
  </tr>
</table>

For example, our `686f6d6965` above would send:

```
homie/686f6d6965/temperature/$type → temperature
homie/686f6d6965/temperature/$properties → degrees,unit
homie/686f6d6965/temperature/unit → c
homie/686f6d6965/temperature/degrees → 12.07

homie/686f6d6965/humidity/$type → humidity
homie/686f6d6965/humidity/$properties → percentage
homie/686f6d6965/humidity/percentage → 79
```

A LED strip would look like this. Note that the topic for a range properties is the name of the property followed by a `_` and the index getting updated:

```
homie/ledstrip-device/ledstrip/$type → ledstrip
homie/ledstrip-device/ledstrip/$properties → led[1-3]:settable
homie/ledstrip-device/ledstrip/led_1 → on
homie/ledstrip-device/ledstrip/led_2 → off
homie/ledstrip-device/ledstrip/led_3 → on
```

* `homie` / **`device ID`** / **`node ID`** / **`property`** / `set`: the device can subscribe to this topic if the property is **settable** from the controller, in case of actuators.

Homie is state-based. You don't tell your smartlight to `turn on`, but you tell it to put it's `on` state to `true`. This especially fits well with MQTT, because of retained message.

For example, a `kitchen-light` device exposing a `light` node would subscribe to `homie/kitchen-light/light/on/set` and it would receive:

```
homie/kitchen-light/light/on/set ← true
```

The device would then turn on the light, and update its `on` state. This provides pessimistic feedback, which is important for home automation.

```
homie/kitchen-light/light/on → true
```

### Broadcast channel

Homie defines a broadcast channel, so a controller is able to broadcast a message to every Homie devices:

* `homie` / `$broadcast` / **`level`**: `level` is an arbitrary broadcast identifier. It must adhere to the [ID format](#id-format).

For example, you might want to broadcast an `alert` event with the alert reason as the payload. Devices are then free to react or not. In our case, every buzzer of your home automation system would start buzzing.

```
homie/$broadcast/alert ← Intruder detected
```

Any other topic is not part of the Homie convention.
