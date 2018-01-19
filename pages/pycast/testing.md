---
title: Test Suite
tags: [development, v4, pycast, test, testing]
keywords: current, activities, new
permalink: pycast_testing.html
sidebar: pycast_sidebar
folder: pycast
---

Before running the test suite, configure a username and password for pyCast to use. For some SMTP servers (GMail included) you'll need this email to be accessable from "less secure" applications. This should be a setting offered by your email provider. If you've already configured your pyCast instance with an email address, you can skip this step.
~~~
python shakecast/sc/app/sc_config.py --smtpu your.email@email.com --smtpp youRpAssw0rd
~~~

Now you can run the suite:
~~~
sudo python shakecast/sc/test/test.py
~~~

If you wish to receive the test emails generated, you can run it with your own email address as an argument:
~~~
sudo python shakecast/sc/test/test.py my.email@email.com
~~~