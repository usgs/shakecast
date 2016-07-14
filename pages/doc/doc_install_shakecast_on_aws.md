---
title: Install ShakeCast on AWS
tags: [getting_started, troubleshooting, shakecast_v3]
keywords: install, aws, linux, cloud
sidebar: doc_sidebar
permalink: doc_install_shakecast_on_aws.html
folder: doc
---

## ShakeCast Cloud Installation

ShakeCast V3 is shipped primarily as a pre-packaged Linux system image. Among tested distributions, CentOS (open-source equivalent of the RedHat Enterprise Linux) is the default operating system (OS). With the ready-to-use ShakeCast V3 system image, users can evaluate the software without excessive IT commitment to determine the use case that will satisfy their needs for post-earthquake response.

Amazon Web Services (AWS) offers a one-year, free-tier elastic compute cloud product (EC2) suitable for the ShakeCast program. A custom built private ShakeCast system image using Amazon EC2 streamlines installation and system updates. Users can launch their own ShakeCast system as a "micro" instance on Amazon EC2 without incurring charges during the evaluation period of up to one year.

## ShakeCast Amazon Web Services (AWS) Cloud Installation Steps

This documentation reflects the current AWS configuration. Updated and installation instructions reflecting any changes to the AWS or ShakeCast system are available as a standalone document at:  _http://earthquake.usgs.gov/research/software/shakecast/_

Installing ShakeCast V3 on Amazon Web Services (AWS)

1. **Sign up for an Amazon Web Services (AWS) account**
You must have an AWS account to check out the ShakeCast system image. Sign up at [http://aws.amazon.com](http://aws.amazon.com)

2. **Request Access to the ShakeCast private system image (AMI)**
Once you have your AWS account, send a request to shakecast-help@usgs.gov to access the ShakeCast private system image (AMI). Include the AWS account number in the email request, as you will be using this account to launch your own instance of the ShakeCast system.

3. **Access the ShakeCast AMI**
The ShakeCast AMI will appear under the EC2 Dashboard after you receive the confirmation email from the ShakeCast team.

To verify access to the ShakeCast AMI:

- Select **EC2** Dashboard from AWS Service Console.
- Select **AMIs** under the Images tab and use the filter **Private Images**. Contact ShakeCast team if the ShakeCast AMI is not shown in the image list.

**Note** : Make sure the Region in the top right is set to **N. Virginia** in order to see the private image

1. **Create ShakeCast Security Group**
Begin the ShakeCast installation process by creating a custom security policy permitting only ShakeCast traffic over the Internet, SSH, HTTP, and HTTPS. Select **Security Groups** link under Network Security left-hand navigation list.

Click the Create Security Group button to create the ShakeCast Security Group.

This step should be evaluated by an IT Administrator before using for a production system. For development purposes, allowing SSH, HTTP, and HTTPS will suffice. For development purposes create a custom security policy permitting only ShakeCast-specific traffic over the Internet, SSH, HTTP, and HTTPS. Select **Create a new security group**.

Select the newly created ShakeCast Security Group. Click the Inbound tab to add security rules. This will allow customization of the security groups

2. **Create SSH Key Pairs**
SSH key pairs are used to remotely log into the ShakeCast system to gain system-level access to perform tasks not available from the web interface. Tasks include both ShakeCast and system related work and access to the system is likely required at some point during the operation. Since the ShakeCast system image does not include a graphical user interface for system level access, operations can only be performed from the command line and are reserved primarily for IT administrators and expert ShakeCast users.

Select **Key Pairs** under the Network Security left-hand navigation list.

Click the **Create Key Pair** button to create an SSH key pair for accessing the ShakeCast system from the command line.

Download and save the private key for later use. The created key pair will be displayed in the key pair list window.

3. **Launch the ShakeCast Instance**

- Select the ShakeCast AMI from the AMI image window and click the Launch button to launch a new ShakeCast instance.
- Select **T1 Micro** as the Instance Type. Click the Continue button. Fill in instance details and tags for user-related information if applicable. Free tier eligible customers will get a maximum amount of 30GB of storage. Select **Next: Tag Instance**.
- Fill in instance details and tags for user-related information if applicable. Select **Next: Configure Security Group**. An IT Administrator should evaluate this step before using in a production system. For development purposes, allowing SSH, HTTP, and HTTPS will suffice. For development purposes create a custom security policy permitting only ShakeCast-specific traffic over the Internet, SSH, HTTP, and HTTPS. Select **Create a new security group**.
- Select the security group policy created earlier as the firewall setup for your ShakeCast instance.
- Review the setup of your instance. Click the **Launch** button to launch your ShakeCast instance. To abort the launch at any step during setup, select the **Cancel** checkbox. Repeat Step 8-14 to launch another new instance.
- Select the key pair created earlier for accessing your ShakeCast instance. Select the checkbox for acknowledgement for access to the private key file. If the launch fails it is due to not accepting the terms. Copy and paste the URL in a browser.
- Select **Continue**. Select **Accept Terms & Launch with 1-Click**. Close the screen with the green checkbox. You are now subscribed to the CentOS product.



Congratulations! You have successfully launched your first ShakeCast instance. For details on Amazon EC2, refer to AWS documentation at _https://aws.amazon.com/documentation/_

1. **Access the ShakeCast Web Interface**

- Select the ShakeCast instance from the **Instances** window. The public domain information of the selected instance will be displayed in the status window beneath the instances window.
- Copy the ShakeCast domain and open the URL using another browser window.
- Use the default username **scadmin** and password **scadmin** to log into the system. "scadmin" is the default administrator account for the ShakeCast system and has full access privileges.

**NOTE** : The secure layer is turned on by default, and you will need to switch to the https protocol and append /html to the end of the Public DNS name for browser access using the browser.

For example -->  https://ec2-####.###/###/###compute-1.amazonaws.com/html/

2. **Access the ShakeCast System Using the Key Pair**

Select the ShakeCast instance from Instances window. Select Connect from the Actions pull-down menu. Follow the instructions to use the SSH client and the pre-configured key pair to access the operating system.

{% include links.html %}
