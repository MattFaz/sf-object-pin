<h1 align="center">Salesforce Object Pin</h1>

![img1.png](/documentation/img1.png)

## Overview

The Salesforce Object Manager tab is frequently used by Salesforce Administrators and Developers, however currently there is no way to pin your favorite _(or most frequently visited)_ objects to the top.

This Userscript aims to provide an easy way to pin your most used objects by adding a Pin to each row and when selected, adding it as a buttom at the top of the Object Manager table.

## Prerequisites

-   A Userscript extension installed into your browser _(this was tested using ViolentMonkey)_
    -   Chrome: [ViolentMonkey](https://chromewebstore.google.com/detail/violentmonkey/jinjaccalgkegednnccohejagnlnfdag?hl=en) or [TamperMonkey](https://chromewebstore.google.com/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo?hl=en)
    -   Firefox: [GreaseMonkey](https://addons.mozilla.org/en-US/firefox/addon/greasemonkey/)

## Process

-   Copy the code from [sf-object-pin.user.js](/sf-object-pin.user.js) into your Userscrupt extension ([or click this link](https://github.com/MattFaz/sf-object-pin/raw/main/sf-object-pin.user.js))
-   Browse to the Salesforce Object Manager

## TODO / Notes:

-   [ ] Bug: Currently only works when you load directly onto the Object Manager page _(or refresh page when on the Object Manager)_. Need to fix this so that it always appears when you navigate to Object Manager

---

<i align="center">Previously this was a Chrome Extension, this was discontinued due and moved into a Userscript to allow for easier development. The old extension can be found in the [archive_extension.zip](/archive_extension.zip) file.</i>
