Module 1: Deploy a Node.js webapp on EC2
===

In this module, we'll walk through how to create an EC2 instance on AWS, 
and running a web server on it using Node.js. 

While it would be helpful if you're fluent with Node.js / Javascript, no previous
experience with it is required as all the code is already provided for you.

## Solution Architecture

The architecture for this module is really simple --- we'll deploy a single EC2 instance
on AWS, and use that as a web server. All HTTP requests going into our web app will be
received and addressed by this EC2 instance.

![architecture](__assets/architecture.png)

Amazon EC2 instances need to be deployed into a VPC, in one of the network subnets 
configured inside. We'll use this characteristic to improve our application in the next module.
For now, just keep this in mind.

## Implementation Overview

Each of the following sections provides an implementation overview, as well as detailed
step-by-step instructions you can follow to complete the module. The overview should provide
enough context for you to complete the implementation if you're already familiar with
the AWS Management Console , or if you want to explore the services yourself
without following a walkthrough.

> **Note**: We'll just call the **AWS Management Console** as just the **console** from here on.

### Region Selection

If you're completing this module as part of a workshop or classroom setting, you will probably
have been given instructions on which AWS region to use. Please confirm this with your facilitator.

Otherwise, feel free to use any available region on the AWS Management Console.

Once you've chosen a region, you should use that region **for the entire workshop**. 

You can choose which region you're working in at the top-right corner menu of the AWS Management Console.

![region selection](__assets/region-selection.png)

### 1. Create an EC2 instance

Amazon EC2 lets you create virtual machines on the AWS cloud. Once created, you can use
it as you would use most any other computer or virtual machine. For this module,
we'll create and prepare an EC2 instance to run a server we can use to host a website.

#### High-level instructions

Use the console or AWS CLI to create an Amazon EC2 `t3.micro` instance, using an `Ubuntu 18.04 LTS` AMI.
Make sure that this instance is publicly accessible both for `SSH` and `HTTP`, and has an assigned public IPv4 address.

<details>
  <summary><strong>Step-by-step instructions (expand for details)</strong></summary>
  <p>
    
  1. In the console, choose **Services** at the top-left menu, and choose **EC2** under Compute.
    
  2. Click the *Launch Instance** button. This will start a step-by-step wizard for creating a new EC2 instance.
  3. In the `Step 1` screen: select an **Ubuntu 18.04 LTS** AMI. 
  4. In the `Step 2` screen: select a `t3.micro` instance. 
  5. In the `Step 3` screen: all the default values should be OK, however, confirm that the following configuration is set:
     1. For `Network`, the default VPC is selected.
     2. For `Auto-assign public IP`, make sure this is enabled.
  6. In the `Step 4` screen: specify `10 GB` for the root volume.
  7. In the `Step 5` screen: add a **Name** to your instance.

  > **Note**: in a classroom setting, this will help identify your instance from others doing the same workshop.

  8. In the `Step 6` screen:
     1. Opt to create a new security group. **Important**: give your security group a unique name you'll remember.
     2. Add rules to allow `SSH` and `HTTP` from **anywhere** to your security group.
     3. Also add a rule to allow `TCP` traffic through port `3000` from **anywhere** to your security group.
     4. Click **Next**.

  9. In the `Step 7` screen: confirm all your settings.
  10. A dialog box should appear. Opt to **create a new keypair**. Give your keypair a name, a download it to your machine. Take note of where you saved it.
  11. Click **Launch instance**.

  Your instance should be visible from the dashboard immediately, and will be ready for use in about 30 seconds.
  </p>
</details>


### 2. Connect to your instance via SSH

Linux-based instances allow you to SSH into them --- once an SSH connection has been established,
you can run commands from inside the machine, and effectively use the instance as if
it was right in front of you.

To establish an SSH connection, you will need the keypair you created in the previous step:
the private half of that key is what you downloaded, and the public half of it has been
baked into the EC2 instance. Only those who have a copy of the private key can connect
to it, so **keep your keyfiles in a safe place**!

#### High-level instructions

Establish an SSH connection to your EC2 instance. You will need to ensure that your keyfile
has `chmod 400` permissions.

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>
    
  1. Locate the keyfile you downloaded in your computer. Optionally make sure it's in a directory that you can access easily.
    
  2. In your terminal, run `chmod 400 [keyfile]`, where `[keyfile]` is the path to your keyfile `PEM` file.
     Your EC2 instance will reject connections if it detects that your keyfile is too open to the world.

  ```
  e.g.

  chmod 400 ~/keys/my-keyfile.pem
  ```

  3. Locate your EC2 instance's **public IPv4 address** in your EC2 dashboard. It should be in the **Desription** tab when selected.
  4. To establish an SSH connection, run `ssh -i [your keyfile] ubuntu@[public IPv4 address]`.
     Substitute the appropriate values for `[your keyfile]` and `[public IPv4 address]`.

  ```
  e.g.

  ssh -i ~/keys/my-keyfile.pem ubuntu@127.0.0.1
  ```
  5. You should see a welcome message if an SSH connection has been successfully established.
  </p>
</details>


### 3. Install the necessary software to run the server

When you run commands in an SSH connection, you're actually running them inside your EC2 instance,
and all the output is just fed back to your screen. It uses its own resources in the cloud, and 
doesn't use the computer you're physically using except to show you what's happening.

For example, when you run a script to make your EC2 instance download updates for its software,
it's actually using its own dedicated network connections, and not the internet connection you're
probably using now. Because of this, you'll probably find that your EC2 instance finishes tasks
you instruct it to do **significantly faster** than if you did them on your own physical machine.

In this step, we'll run all the commands required to setup and prepare our machine to run our server.
As you'll discover in the next modules, there are ways so that you won't have to do this manually every time 
you need an EC2 instance. 

For now, bear with us, because we want to give you the full experience of bootstrapping a system on your own.


#### High level instructions

Update the software packages on your EC2 instance, and install **version 8.10** of Node.js on it.
(Any version `> v8.10` should work, but since this workshop was built with v8.10 in mind, it's probably best to just use that.)

Clone this repository into the machine as well, and install the `npm` dependencies for this solution.

Finally you will need to install a terminal multiplexer so that your server doesn't stop when you terminate your SSH connection.
If you don't have any preferences, `tmux` is a good choice.

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>
    
  1. Ensure you're inside an SSH connection to your instance.
  
  2. Run `sudo apt-get update -y`. This will bring all installed packages on your instance up-to-date.
  
  3. To make installing a specific version of Node.js easier, we'll use `nvm` command to manage our Node versions for us.
     You can [follow the instructions here](https://github.com/creationix/nvm#install--update-script) to install `nvm`, or just:

  ```
  curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.34.0/install.sh | bash
  ```

  4. After installing `nvm`, you will need to close the SSH connection by typing `exit`, then reconnect again.
     Doing this step ensures that your SSH connection knows that there is a new `nvm` command available for you.

  5. Install Node.js version 8.10 by running `nvm install 8.10`.
  
  6. Clone this repository onto youjr machine by running `git clone https://github.com/team-siklab/workshop-simple-webapp.git webapp`.
  
  7. We've already prepared this project repository to automatically install everything it needs to run a server.
     `cd webapp` to go into your project directory, and then run `npm install` to install all the project dependencies.

  8. When you terminate your SSH connection later, this will also stop all processes you've run (including your web server).
     To prevent this from happening, we can use a terminal multiplexer to create a process separate from the one governing our connection.
     Install `tmux`, a popular current-generation terminal multiplexer, by running `sudo apt-get install tmux -y`.

  9. Run `tmux` to start the multiplexer.

  > **Note**: By running `tmux`, you're creating a completely separate process from the one you're on with your SSH connection.
  > - To go back to your original process (and leave whatever you're doing in `tmux` temporarily), just type `Ctrl+b` then `d` on your keyboard.
  > - To bo back into the `tmux` process (and go back to what you were doing), just type `tmux a`.

  10. Make sure you're in your project directory, then run `npm start` to start your web server. By default, your server will start listening on port `3000`.
  
  11. Locate your EC2 instance's **public IPv4 address** again, and confirm your web server is viewable by visiting `http://instance-ip-address:3000/hello` from a browser.

  ```
  e.g.

  http://127.0.0.1:3000/hello
  ```

  12. If you get a meaningful response, congratulations, and you've successfully run a web server on your EC2 instance!
  
  13. Back in your terminal, let's exit your SSH connection while leaving your web server running.
      Press `Ctrl-b` then `d` to detach your current `tmux` process, then type in `exit` to terminate your SSH connection.

  14. Confirm that your web server is still viewable even when your SSH connection is closed.
  </p>
</details>

## Summary

In this module, we created a single EC2 instance, and set it up to run a website, so that it can be
visited through the public internet.

In the next modules, we'll look into ways we can improve on that process, as well as look into how we
can use EC2 instances in creative ways to improve web application durability and scalability.


**Next:** [Augment your webapp with load balancing](team-siklab/workshop-simple-webapp/tree/module-02)
