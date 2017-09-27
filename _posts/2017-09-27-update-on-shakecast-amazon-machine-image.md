---
title:  "Update on ShakeCast Amazon Machine Image (AMI)"
published: true
permalink: 2017_shakecast_amazon_machine_image.html
summary: "Status update for ShakeCast Amazon Machine Image (AMI) on Amazon Web Services (AWS)"
tags: ["software_update"]
---

Our apology to users who have been waiting for new releases of the ShakeCast Amazon Machine Image (AMI) on Amazon Web Services (AWS).  The ShakeCast AMI is still not available on AWS after we moved the public AWS ShakeCast to under the USGS Cloud Hosting Service (CHS) under the mandate of the Department of the Interior.

There is one good news in regard to our continuing search for a "cloud" solution, namely **VMWare Cloud on AWS**.  The ShakeCast AMI used to be built as HVM (Hardware Virtual Machine) and PV (Paravirtualization) and requires Xen Hypervisor.  These custom images are not compatiable with our in-house VMWare hosting environment and can not be supported by our IT.  The possiblity of using VMWare Cloud on AWS will streamline the process of image build and release from NEIC.  We are currently working with our IT to explore this option and will report on any progress.   

Meanwhile, you can continue download equivalent standalone Linux ShakeCast system image from the [ftp site](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast%20Image/) or Windows installer from the [github repository](https://github.com/usgs/shakecast/releases).

Lastly, we recommend using the [ShakeCast Inventory Workbook](ftp://ftpext.usgs.gov/pub/cr/co/golden/shakecast/ShakeCast_Workbook/ShakeCastInventory.xlsm) to organize your information and create ShakeCast readable XML files.

Contacts: Kuo-wan Lin (Klin@usgs.gov); David Wald (wald@usgs.gov); Daniel Slosky (dslosky@usgs.gov)
