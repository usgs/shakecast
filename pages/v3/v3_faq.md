---
title: ShakeCast FAQ 
permalink: v3_faq.html
sidebar: v3_sidebar
tags: [troubleshooting]
keywords: frequently asked questions, FAQ, question and answer, collapsible sections, expand, collapse
last_updated: November 30, 2015
folder: v3
---

## Emails and Notifications

**Why do some scenarios send email notifications while others do not?**

```
Notifications are created based on four requests for four different event types, actual, test, scenario, and heartbeat. Unexpected results may happen when you mixed notifications of different event types. I will need more detailed description of this problem if you could share.
```

**How can I add the actual ShakeMap JPEG to our ShakeCast notification template?**

{% raw %}
```
You customize ShakeCast notifications by editing the notification template. In the case of Caltrans notification, this is based on a damage template, located under the directory "C:\ShakeCast\sc\templates\damage\email_html." To add a ShakeMap link, you can simply edit the header segment, such as the following lines to before the table section

<br>

<img src="http://%DNS_ADDRESS%/data/%SHAKEMAP_ID%-%SHAKEMAP_VERSION%/intensity.jpg" alt=""/>

<br> 
```
{% endraw %}

## Errors and Failure Messages

**Why do we receive "http failure 400: authorization" when ShakeCast is run in a virtual environment?**

```
As for the RSS feed errors related to http failure 400: authorization, it might be solved by increasing memory allocation to the virtual server. From a user report, David (IT analyst) changed the memory configuration of server with /PAE /3GB option. Now, we have not had the same error for a while. You could use our case to troubleshoot other people using windows server (especially with virtual server). We will keep eyes on it for more days to assure this.
```

**How about http failure 500?**

{% raw %}
```
According to the official W3 documentation, response code 500 refers to “Internal Error 500”
The server encountered an unexpected condition which prevented it from fulfilling the request.

There should be no database involved in receiving RSS data feed via http request from the upstream USGS servers. The data feed xml is a plain file sitting on the web server and is refreshed frequently. I think this is a common error that even high availability web sites (yahoo, amazon alike) are not immune to it, as long as it does not happen too often. Keep in mind that you are actually receiving the data feed via L3, which makes it unlikely a frequent occurrence. I will pass on this information to our web group and will let you know if I receive any update on this issue.

The ShakeCast user report on 500 error I have received was fairly early in ShakeCast development and was regarding the dispatcher service. The error looks like the following,

2007-06-07 10:15:33 dispw[2660]: http failure: 500 Internal Server Error
2007-06-07 10:15:33 dispw[2660]: get file: HTTP_FAIL, 500 Internal Server Error

This error turned out to be associated with the Apache and local gateway server.
```
{% endraw %}

## Miscellaneous

**Are there any licensing issues in using Google Maps API?**

```
According to EULA on the Google Maps API page, it is free to use for non-commercial purposes. 
```

**I accidentally deleted the "scadmin" account. How do I fix this problem?**

{% raw %}
```
This is a very good reason to change the default password and leave the "scadmin" account untouched.

Anyway, the equivalent command for loading user csv file is the "c:\shakecast\sc\bin\manage_user.pl." You open a DOS window and issue a command like this,
c:\shakecast\sc\bin\manage_user.pl <path_to_csv_file>

Just remember to give the administrative user the user type "ADMIN" instead of "USER." Only ADMIN user will be able to access the administrative interface.
```
{% endraw %}

**Are “HAZUS western US spectral shape factors”, “mid-magnitude ranges”, and “B-C soil amplification Factors” used in shaking and damage estimates for all regions or only those within the western US?**

```
It correct that the current HAZUS fragility settings in ShakeCast is for western US only. At this time, regional implementation needs to adjust the default HAZUS values for the area*.* We haven't had a chance to implement these regional HAZUS fragilities and are hoping to incorporate them along the FEMA ROVER project. 
```

**Is there a quick way to change the table header to read "Inspection Priority" instead of "Damage Level" in the upper right table?**

```
This is because the table actually matches the database definition. To alter the name, you can edit the file "c:\shakecast\sc\lib\SC\Resource\Dictionary.pm" and replace the definition for "Damage_level" to matching "Damage_estimate." 
```

{% include links.html %}
