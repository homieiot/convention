# Legacy Firmware

Version: **<!--VERSION-->0.1.0<!--VERSION-->**
Date: **<!--DATE-->10. Jul 2019<!--DATE-->**
Authors: **<!--AUTHORS-->The Homie Community<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension adds the firmware, mac and localip device attributes of Homie `3.0.1` to Homie `4.0`.

Version `3.0.1` of the Homie Convention specifies some required device attributes.
Newer versions on the other hand, do not specify them.
If a device of a newer Homie version implements this extension, the above mentioned attributes are backwards-compatible to older Homie versions.
Respectively, these attributes of an older device can be made Homie `4.0` compliant, by simply advertising this extension as implemented.
By doing this, these legacy attribute can be kept, and the device doesn't have to be altered much.
In addition to this extension, a second extension, [Legacy Stats]() exists.
If this extension is implemented, too, not only the firmware attributes are backwards-compatible, but the whole device.

## Extension Identifier
The ID of this extension is `org.homie.legacy-firmware`.

## Homie Version
This extension supports Homie `4.0`.

## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Device Attributes

This extension defines **no optional** and **two required** direct device attributes: 

| Topic    | Description                                                                                     | Payload type    |
|----------|-------------------------------------------------------------------------------------------------|-----------------|
| $localip | IP of the device on the local network                                                           | String          |
| $mac     | Mac address of the device network interface; The format MUST be of the type `A1:B2:C3:D4:E5:F6` | String          |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$localip → "192.168.0.10"
homie/super-car/$mac → "DE:AD:BE:EF:FE:ED"
```

#### Nested Device Attributes

This extension defines two nested device attribute.

##### $org.homie.legacy-firmware
The **$org.homie.legacy-firmware** nesting attribute is **required**.

It defines **no optional** attributes and the following **required** nested attributes:

| Topic                                      | Description                                                             | Payload type                            |
|--------------------------------------------|-------------------------------------------------------------------------|-----------------------------------------|
| $org.homie.legacy-firmware/$version        | The version of this extension                                           | String with constant value: "0.1.0"     |
| $org.homie.legacy-firmware/$homie-versions | The Homie versions this extension supports, separated by a comma (`,`)  | String with constant value: "4.0"       |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$org.homie.legacy-firmware/$version → "0.1.0"
homie/super-car/$org.homie.legacy-firmware/$homie-versions → "4.0"
```

##### $fw
The **$fw** nesting attribute is **required**.

It defines **no optional** and **two required** nested attributes:

| Topic       | Description                                                                                  | Payload type |
|-------------|----------------------------------------------------------------------------------------------|--------------|
| $fw/name    | Name of the firmware running on the device; Allowed characters are the same as the device ID | String       |
| $fw/version | Version of the firmware running on the device                                                | String       |

**Examples**
Assuming the base topic is *homie* and device ID is *super-car* then:
```java
homie/super-car/$fw/name → "weatherstation-firmware"
homie/super-car/$fw/version → "1.0.0"
```