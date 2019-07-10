# Legacy Stats

Version: **<!--VERSION-->0.1.0<!--VERSION-->**
Date: **<!--DATE-->10. Jul 2019<!--DATE-->**
Authors: **<!--AUTHORS-->The Homie Community<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension adds the stats functionality of Homie `3.0.1` to Homie `4.0`.

Version `3.0.1` of the Homie Convention specifies, how device stats should be published.
The community decided, that in subsequent versions of the convention, this feature should be optional,
so it was removed from the convention and decided to offer it as extension (see [issue 102](https://github.com/homieiot/convention/issues/102)).
If a device of a newer Homie version implements this extension, the stats of the device are backwards-compatible to older Homie versions.
Respectively, the *$stats* attribute of an older device can be made Homie `4.0` compliant, by simply advertising this extension as implemented.
By doing this, the legacy *$stats* attribute can be kept, and the device doesn't have to be altered much.
In addition to this extension, a second extension, [Legacy Firmware]() exists.
If this extension is implemented, too, not only the stats are backwards-compatible, but the whole device.

## Extension Identifier
The ID of this extension is `org.homie.legacy-stats`.

## Homie Version
This extension supports Homie `4.0`.

## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Device Attributes

This extension defines no direct device attributes.

#### Nested Device Attributes

This extension defines two nested device attribute.

##### $org.homie.legacy-stats
The **$org.homie.legacy-stats** nesting attribute is **required**.

It defines **no optional** attributes and the following **required** nested attributes:

| Topic                                   | Description                                                             | Payload type                            |
|-----------------------------------------|-------------------------------------------------------------------------|-----------------------------------------|
| $org.homie.legacy-stats/$version        | The version of this extension                                           | String with constant value: "0.1.0"     |
| $org.homie.legacy-stats/$homie-versions | The Homie versions this extension supports, separated by a comma (`,`)  | String with constant value: "4.0"       |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$org.homie.legacy-stats/$version → "0.1.0"
homie/super-car/$org.homie.legacy-stats/$homie-versions → "4.0"
```

##### $stats
The **$stats** nesting attribute is **required**.

It defined **two required** nested attributes:

| Topic           | Description                                                             | Payload type               |
|-----------------|-------------------------------------------------------------------------|----------------------------|
| $stats/interval | Interval in seconds at which the device refreshes its `$stats/+`        | Positive Integer greater 0 |
| $stats/uptime   | Time elapsed in seconds since the boot of the device                    | Positive Integer           |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$stats/interval → "60"
homie/super-car/$stats/uptime → "120"
```
Every *$stats/interval* the device MUST publish new values for each implemented nested **$stats** attribute (except *$stats/interval* itself).
This includes the required *$stats/uptime*.
The following **optional** nested stats attributes exists. If they where used once, they also MUST be refreshed:

| Topic           | Description                                                         | Payload type     |
|-----------------|---------------------------------------------------------------------|------------------|
| $stats/signal   | Signal strength in %                                                | Integer          |
| $stats/cputemp  | CPU Temperature in °C                                               | Float            |
| $stats/cpuload  | CPU Load in %. Average of last *$stats\interval* including all CPUs | Integer          |
| $stats/battery  | Battery level in %                                                  | Integer          |
| $stats/freeheap | Free heap in bytes                                                  | Positive Integer |
| $stats/supply   | Supply Voltage in V                                                 | Float            |