Module 5: Improve security with IAM Roles
===

In the previous module, we gave our web application permissions to upload to S3 by creating a user
it can use to authenticate into the AWS cloud. We used access keys and secrets to allow our server to communicate and function.

While there are very valid use cases for access keys, in the previous module, we really used them in an insecure manner. We hardcoded the keys in plaintext in some of our deployment configurations, and, really, we gave our web application more governing power over our bucket than what it just needed. In the event that our access keys were compromised (and at this point, it's really just a matter of time), the keys can be used to, for example, irrecoverably delete our bucket.

We need to improve on this, and we need to do it as early as possible in the development process.


## Solution Architecture

The architecture for this module is almost exactly the same as the one from last module, 
but we'll improve on some security elements of it.

![architecture](__assets/architecture.png)

Namely, we'll use [IAM Roles](https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles.html) to delegate permissions to our EC2 instances that serve as web servers so that we won't have to manage access keys anymore.


## Implementation Overview

Make sure you're using the same application as from the previous module.


### 1. Delete the IAM user used by your web servers

To start our security improvement efforts, let's delete the IAM user we created from last module.
By deleting this IAM user, we are effectively revoking our application's permissions to use our S3 bucket. We'll reinstate the permissions later using better methods.

#### High-level instructions

Delete the IAM user you created from last module.
Confirm that the image upload on your web application does not work anymore.

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>

1. Go to your IAM dashboard, and navigate to the **Users** dashboard.

2. Locate the user you created from last module, and select it and click **Delete user**. A confirmation box will appear that warns you about recent access --- confirm that you're sure, and proceed with deletion.

3. Once the user has been deleted, confirm that your web application cannot anymore save to S3 by attempting to upload another image. You should get an error saying that the access key used is unknown. This shows that your web application has lost permissions to interact with your S3 bucket.

  </p>
</details>

---

### 2. Update your IAM policy

Last module, you created a policy that gave full access to your S3 bucket. 
Best practice dictates that we follow the **principle of least-privilege** --- meaning we should only give enough permissions as necessary for a process to be able to do what it needs to do, and nothing more.

In our scenario, our web application only needs to be able to upload new images into our S3 bucket --- it doesn't need to do anything else.

We should update our policy to reflect this, and not have it over-provision permissions.

#### high-level instructions

Update the IAM policy you created to only allow `s3:PutObject*`. 

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>

1. Go to your IAM dashboard, and go to **Policies**.

2. Look for the policy you created from the previous module, and click the name. 

3. In the resulting page, click **Edit policy**.

4. Under the `S3` section, revoke all permissions, except those that start with `PutObject` and `GetObject`.

> **Note:** This is definitely still too many permissions than needed, but for the purposes of this workshop, let's leave this at that.

5. Save the updated policy.

  </p>
</details>

---

### 3. Create an IAM role for your web servers

You can think of an IAM role as a sort of wrapper of AWS resources --- permissions attached
to roles that have been given to resources inherit the permissions on it, even if there are no
IAM access credentials present on them.

So an IAM role that has permissions to write to an S3 bucket lends that same permission to 
an EC2 instance that has had that role assigned to it. We'll use this mechanism to more securely manage
what our web application can and cannot do.

#### High-level instructions

Create a new IAM role, and assign the policy you just updated to it.

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>

1. Still in your IAM dashboard, go to **Roles**. Click **Create role**.
   
2. This role will be assigned to EC2 instances, so select **EC2** as the service that will use this role.

3. For **Permissions**, select the policy you just updated.

4. At the very last step, give your role a unique, memorable name, then click **Create role**.
  </p>
</details>

---

###  4. Update your launch configuration to assign your new role to your web servers.

You will need to adjust your ASG launch configuration to use your new IAM role for all
EC2 instances it creates. This way, all copies of your web server will have the permission to 
upload images to S3.

#### High-level instructions

Create a copy of your launch configuration, and adjust it to use your new IAM role.
Update your auto-scaling group to use this new launch configuration.

<details>
  <summary><strong>Step-by-step instructions (click to expand):</strong></summary>
  <p>
1. Go to your EC2 dashboard and navigate to your **Launch configurations**.

2. Look for your current configuration, and opt to make a copy of it.

3. In `Step 3` of the resulting wizard, adjust the value of **IAM Role** so that it matches the role you just created. Save all your changes.

4. Navigate to your **Auto scaling groups**, and edit your current ASG so that it uses your updated launch configuration. Save your changes to your ASG.
  1. Also remove the two `export` statements for `AWS_ACCESS_KEY` and `AWS_SECRET_ACCESS_KEY` from the configuration **User data**. This way we our access keys are not hardcoded anywhere in our system.

5. Terminate the current instances under your ASG, and let it self-heal. This may take a few minutes.

6. Confirm that the web server now has permission to upload to your S3 bucket again by attempting to upload a file from the image upload form.
  </p>
</details>

## Summary

Misplaced access keys (being committed to source control, leaving them in plaintext in a file somewhere, etc) is one of the leading causes of unauthorized entry into software systems. By leveraging something like IAM roles, which lets you apply permissions directly to resources without using access keys (essentially branding certain resources as "trusted"), you significantly reduce this risk, and help protect your systems further.
