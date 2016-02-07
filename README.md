![Homie logo](logo.png) Homie
=============================

Homie is a very simple MQTT convention for the IoT.

This repository is a *spec* defining the Homie protocol.

You can find an implementation of the Homie system:

* A server part built with Node.js at [marvinroger/homie-server](https://github.com/marvinroger/homie-server)
* A device Arduino library built for the ESP8266 at [marvinroger/homie-esp8266](https://github.com/marvinroger/homie-esp8266)

## Spec

Homie devices communicate through MQTT. The MQTT broker listens on port **35589**, but for more flexibility, any broker on any port may be used.

To efficiently parse messages, Homie defines a few rules related to topic names.

* `devices` / **`device ID`**: this is the base topic name. Each device must have a unique device ID. This ID MAY be composed of lowercase letters from `a` to `z`, numbers from `0` to `9`, and it MAY contain `-`, but MUST NOT start or end with a `-`.

### Device properties

* `devices` / **`device ID`** / `$` **`device property`**: a property starting with a `$` at the third level of the path is related to the device. The property MUST be one of these:

<table>
  <tr>
    <th>Property</th>
    <th>Direction</th>
    <th>Description</th>
  </tr>
  <tr>
    <td>$online</td>
    <td>Device → Controller</td>
    <td>`true` when the device is online, `false` when the device is offline (through LWT)</td>
  </tr>
  <tr>
    <td>$name</td>
    <td>Device → Controller</td>
    <td>Friendly name of the device</td>
  </tr>
  <tr>
    <td>$localip</td>
    <td>Device → Controller</td>
    <td>IP of the device on the local network</td>
  </tr>
  <tr>
    <td>$signal</td>
    <td>Device → Controller</td>
    <td>Integer representing the Wi-Fi signal quality in percentage if applicable</td>
  </tr>
  <tr>
    <td>$fwname</td>
    <td>Device → Controller</td>
    <td>Name of the firmware running on the device. This name MAY be composed of lowercase letters from `a` to `z`, numbers from `0` to `9`, and it MAY contain `-`, but MUST NOT start or end with a `-`</td>
  </tr>
  <tr>
    <td>$fwversion</td>
    <td>Device → Controller</td>
    <td>Version of the firmware running on the device</td>
  </tr>
  <tr>
    <td>$nodes</td>
    <td>Device → Controller</td>
    <td>Nodes the device has, with format `id:type` separated by `,` if there are multiple nodes</td>
  </tr>
  <tr>
    <td>$ota</td>
    <td>Controller → Device</td>
    <td>Latest OTA version available for the device</td>
  </tr>
</table>

For example, a device with an ID of `686f6d6965` with a temperature and an humidity sensor would send:

```
devices/686f6d6965/$online → true
devices/686f6d6965/$name → Bedroom temperature sensor
devices/686f6d6965/$localip → 192.168.0.10
devices/686f6d6965/$signal → 72
devices/686f6d6965/$fwname → 1.0.0
devices/686f6d6965/$fwversion → 1.0.0
devices/686f6d6965/$nodes → temperature:temperature,humidity:humidity
```

And it would receive:

```
devices/686f6d6965/$ota ← 1.0.1
```

At this point, your device would understand there is an OTA update available, as `$ota` is different from `$version`.

### Node properties

* `devices` / **`device ID`** / **`node ID`** / **`property`**: `node ID` is the ID of the node, as defined in the `$nodes` device property. `property` is the property of the node that is getting updated. You can see all properties by node type at [Types of nodes](https://github.com/marvinroger/homie/wiki/Types-of-nodes).

For example, our `686f6d6965` above would send:

```
devices/686f6d6965/temperature/temperature → 12.07
devices/686f6d6965/humidity/humidity → 79
```

* `devices` / **`device ID`** / **`node ID`** / **`property`** / `set`: the device can subscribe to this topic if the property is *settable* from the controller, in case of actuators. 

Any other topic is not part of Homie.
