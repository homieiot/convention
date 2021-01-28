# Last-updated timestamp

Version: **<!--VERSION-->1.0.0<!--VERSION-->**
Date: **<!--DATE-->17. Feb 2020<!--DATE-->**
Authors: **<!--AUTHORS-->Max Berger<!--AUTHORS-->**
License: **<!--LICENSE-->[CCA 4.0](https://homieiot.github.io/license)<!--LICENSE-->**

## Abstract
This extension adds best-effort last-updated timestamps to properties.

Homie devices will publish a last-updated timestamp along with any property value changes. The last-update timestamp can be sent by devices or gateways that do not constantly pull data from the real back-end. In this case, they can report when they last actually updated the data, so that controllers can act accordingly, and maybe ignore old data, or display this information in an UI.

A common use case for this is a gateway software which publishes device data in Homie format, but actually uses external sensors to get the actual data. Gateways may re-publish the values the gather from the backend, even if these values are older. Using the last-update timestamp, a controller is then able to distinguish between actual value updates, and value updates which are just a republication of older values. 

## Homie Version
This extension supports Homie `3.0.1` and `4.x`.

## Extension Identifier

There are two extensions in this specification. 

The ID of this first extenstion is `org.homie.ext.last-updated`.
Therefore the **$extensions entry** is `org.homie.ext.last-updated:1.0.0:[3.0.1;4.x]`.

The ID of this extension is `org.homie.ext.last-value-updated`.
Therefore the **$extensions entry** is `org.homie.ext.last-value-updated:1.0.0:[3.0.1;4.x]`.

A device may implement zero, one, or both extensions. The extension entries refer to the matching property attributes.


## Extension Datatypes
This extension defines no new datatypes.

## Extension Attributes

### Device Attributes

This extension defines no device attributes.

### Node Attributes
This extension defines no direct node attributes.

#### Nested Node Attributes

This extension defines no nested node attributes.


### Property Attributes

This extension defines two new property attributes.

#### $last-updated

The **$last-updated** property attribute is **optional**.

If its used, it **must** follow the description below:

| Topic                                 | Description                                       | Payload type                       |
|---------------------------------------|---------------------------------------------------|------------------------------------|
| $last-updated        | Timestamp when the property value was last updated by the Homie device | integer: seconds that have passed since the Unix epoch (00:00:00 UTC on 1 January 1970) OR 0 for unknown |

Usage notes:
* The $last-update **should** always be published immediately before a value update.
* $last-update **must** be 0 or a positive integer
* $last-update **must** be in UTC
* If a device cannot get the actual timestamp for whatever reason (clock is skewed, ntp has not yet finished, etc.) it **should** publish 0
* If a device has published a $last-update in the past and is now unable to determine the last-update timestamp, it **must** publish 0 at least once.
* the Qos and the Retained flags **must** match the value updates.

**Examples**
Assuming the base topic is *homie*, device ID is *super-car*, node is *wheels*, and the property is *pressure* then:
```java
homie/super-car/wheels/pressure/$last-updated → 1579965965
homie/super-car/wheels/pressure/ → 32
```

This means that the property pressure was last fetched from its source at unix timestamp 1579965965 (2020 Jan 25, 16:26:05 UTC, or 2020 Jan 25, 17:26:05 CET)

```java
homie/super-car/wheels/pressure/$last-updated → 0
homie/super-car/wheels/pressure/ → 32
```

This means that the device is usually able to sent timestamps, but is unable to do so at this time for any reason.


**Controller considerations**

Note that MQTT is not atomic and does not guarantee any order. This means that even though both the value and the last-update timestamp are published together and in the oder above, the controllers may receive these messages in any order, or one of them may be lost. Therefore, **$last-updated** is entirely **best-effort**. It **must** **not** be used for any critical operation.

The special value of 0 can be used for a controller to distinguish devices that are currently unable to get the time from devices which do not update, or from lost mqtt messages. If a controller stores the last-updated value, the value of 0 should be used to clear the data storage.

The value 0 was chosen so that the last-updated value is always a valid timestamp. Controllers which chose not to treat it specifically will still have a usable value.

#### $last-value-updated

The **$last-value-updated** property attribute is **optional**.

If its used, it **must** follow the description below:

| Topic                                 | Description                                       | Payload type                       |
|---------------------------------------|---------------------------------------------------|------------------------------------|
| $last-value-updated        | Value and Timestamp, seperated by semicolon | value-type;interger |

Usage notes:
* the rules for the timestamp are the same as for $last-updated above
* a device *should* always publish both the actual value and the $last-update-value quickly one after another.
* if a device has published $last-value-updated, it *must* keep publishing it, with a timestamp of 0 if needed
* the special timestamp of 0 follows the same rules as for $last-updated above

**Examples**
Assuming the base topic is *homie*, device ID is *super-car*, node is *wheels*, and the property is *pressure* then:
```java
homie/super-car/wheels/pressure/$last-value-updated → 32;1579965965
homie/super-car/wheels/pressure/ → 32
```

This means that the property pressure was last fetched from its source at unix timestamp 1579965965 (2020 Jan 25, 16:26:05 UTC, or 2020 Jan 25, 17:26:05 CET)

```java
homie/super-car/wheels/pressure/$last-value-updated → 32;0
homie/super-car/wheels/pressure/ → 32
```

This means that the device is usually able to sent timestamps, but is unable to do so at this time for any reason.

**Controller considerations**

Controllers supporting the extension should prefer values from $last-value-updated. This means once a property value has been read from $last-value-updated, the controler should use that topic from this point on and ignore the regular value updates.

All considerations for the special value 0 from above still hold.

## Attribution
- <sup>\[1\]</sup>: [The Homie Convention](https://homieiot.github.io/specification/#), [CCA 4.0](https://homieiot.github.io/license)
