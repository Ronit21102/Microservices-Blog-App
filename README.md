<img width="1869" height="915" alt="image" src="https://github.com/user-attachments/assets/f5e5b3a9-472d-49a2-8019-37620ed91856" />

<img width="1916" height="920" alt="image" src="https://github.com/user-attachments/assets/c3088b7c-cbc2-43b4-9f3f-d57e3b52196e" />
<img width="1892" height="902" alt="image" src="https://github.com/user-attachments/assets/a374aa33-b110-41e4-ad77-7c957d8a08d7" />


# Microservices
Basic microservices app is done where on every post created or comment created It will trigger a event to inform all the services and they can act accordingly

![image](https://github.com/user-attachments/assets/0f886e15-29a8-4883-ab3a-97860e66310d)

Now the how we will scale and deploy that part starts
![image](https://github.com/user-attachments/assets/167c3019-6913-407a-b6f8-88b562d3fbab)

![image](https://github.com/user-attachments/assets/b1667bf0-d364-452b-8b9a-96c9a37d1468)

When Kubernetes creates a container from an image specified in a configuration file (like a `Deployment`, `Pod`, or `ReplicaSet` YAML file), it follows a series of steps to locate and pull the image. Here's how Kubernetes finds the image:

---

### **1. Image Configuration in the YAML File**
The image is specified in the `image` field of the container specification. For example:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: mycontainer
    image: myrepo/myimage:latest
```

- `myrepo`: The container registry (e.g., Docker Hub, Amazon ECR, Google Container Registry).
- `myimage`: The name of the image.
- `:latest`: The tag specifying the image version (default is `latest` if not specified).

---

### **2. Kubernetes Workflow to Find the Image**
1. **Check Local Cache on the Node:**
   - Kubernetes first checks if the image is already present in the local cache of the node where the Pod is scheduled.
   - If the image exists locally, Kubernetes uses it directly without pulling it again.

2. **Authenticate with the Registry (if needed):**
   - If the image is not found locally, Kubernetes connects to the container registry specified in the image name.
   - Authentication details are provided via a **Secret** linked to the Pod's `imagePullSecrets` field or via the default credentials (if using cloud-specific Kubernetes services).

   **Example of `imagePullSecrets`:**
   ```yaml
   apiVersion: v1
   kind: Pod
   metadata:
     name: mypod
   spec:
     containers:
     - name: mycontainer
       image: private-repo/myimage:1.0
     imagePullSecrets:
     - name: myregistrykey
   ```

3. **Pull the Image:**
   - Kubernetes pulls the image from the registry to the node's local storage. This process involves:
     - Resolving the repository name and tag.
     - Downloading the image layers.
     - Verifying integrity with checksums.
   - The image is then unpacked and stored in the container runtime's local storage.

4. **Run the Container:**
   - Once the image is available locally, Kubernetes instructs the container runtime (e.g., Docker, CRI-O, containerd) to start a container using the image.

---

### **3. Registry Resolution**
- Kubernetes uses the `image` field to determine the container registry:
  - **Implicit Registries:** For example, `myimage:latest` defaults to Docker Hub.
  - **Explicit Registries:** For example, `gcr.io/project/myimage:1.0` points to Google Container Registry.

---

### **4. Image Pull Policy**
The `imagePullPolicy` field in the YAML file determines whether Kubernetes always pulls the image from the registry or checks the local cache.

- **Default Behavior:**
  - If the tag is `:latest`, the default `imagePullPolicy` is `Always`.
  - If a specific tag (e.g., `:1.0`) or no tag is provided, the default is `IfNotPresent`.

- **Configuring Pull Policy:**
  ```yaml
  containers:
  - name: mycontainer
    image: myimage:1.0
    imagePullPolicy: IfNotPresent
  ```

  Values:
  - `Always`: Always pull the image from the registry.
  - `IfNotPresent`: Pull only if the image is not in the local cache.
  - `Never`: Do not attempt to pull the image from a registry.

---

### **5. Container Runtime and Kubernetes**
The actual image handling is done by the **container runtime** (e.g., Docker, containerd). Kubernetes communicates with the runtime via the Container Runtime Interface (CRI) to:
- Pull the image.
- Check for existing images.
- Create and manage containers.

---

### **6. Debugging Image Issues**
If Kubernetes cannot find or pull the image:
1. **Check Pod Events:**
   ```bash
   kubectl describe pod <pod-name>
   ```
   Look for events like:
   ```
   Failed to pull image "myimage:latest": Error response from daemon
   ```

2. **Verify Image Name and Tag:**
   Ensure the `image` field has the correct name, registry, and tag.

3. **Check Registry Credentials:**
   If the image is private, confirm that `imagePullSecrets` is correctly configured.

4. **Inspect Node Logs:**
   Check logs on the node to identify errors related to the container runtime.

---

### **Summary**
- Kubernetes finds the image by checking the local cache or pulling it from a container registry specified in the `image` field.
- It uses `imagePullPolicy` to decide whether to always pull or rely on the local cache.
- Authentication and registry configuration ensure Kubernetes can access private images if needed.

Yes, once Kubernetes successfully pulls the image (or finds it in the local cache), it proceeds to create and run the **Pod** using the specified configuration. Here's how the process flows:

---

### **Steps After Pulling the Image**

1. **Image Pulled/Verified:**
   - Kubernetes ensures the specified image is ready to be used on the node where the Pod is scheduled.

2. **Pod Created:**
   - Kubernetes instructs the container runtime (e.g., Docker, containerd) to create and run containers based on the image.
   - The Pod is created as a wrapper for one or more containers defined in the configuration.

3. **Networking Setup:**
   - Each Pod is assigned a unique IP address in the cluster's network space.
   - Networking rules, such as port forwarding and communication between Pods, are configured.

4. **Volume Mounting (if specified):**
   - Any volumes specified in the Pod's configuration are mounted into the containers.

5. **Container Start:**
   - The container runtime runs the container with the specified `CMD` or `ENTRYPOINT` defined in the Docker image or overridden in the Kubernetes configuration.

---

### **Pod Status**
You can monitor the Pod's status using:

```bash
kubectl get pods
```

Typical statuses include:
- **Pending:** Waiting for image pulling or scheduling to complete.
- **Running:** The Pod and its containers are running successfully.
- **Failed:** Something went wrong, such as an image pull error or container crash.
- **CrashLoopBackOff:** The container repeatedly crashes and restarts.

---

### **Example: Running a Pod**
Here’s a sample configuration and what happens step-by-step:

#### YAML File
```yaml
apiVersion: v1
kind: Pod
metadata:
  name: mypod
spec:
  containers:
  - name: mycontainer
    image: nginx:latest
    ports:
    - containerPort: 80
```

#### Steps:
1. **Schedule the Pod:**
   - Kubernetes schedules the Pod to a node based on resource availability and other criteria.

2. **Image Pulled:**
   - Kubernetes checks if `nginx:latest` exists on the node.
   - If not, it pulls the image from Docker Hub.

3. **Container Created:**
   - The container runtime creates a container using the `nginx:latest` image.
   - The container listens on port 80 as specified in the configuration.

4. **Pod Running:**
   - Once the container is running, the Pod is marked as **Running**.

---

### **Debugging Pod Issues**
If the Pod doesn't start, inspect it with:

```bash
kubectl describe pod mypod
```

Check for:
- **Events:** Look for errors in image pulling, scheduling, or container startup.
- **Logs:** If the container starts but fails, view its logs:
  ```bash
  kubectl logs mypod
  ```

---

### **Summary**
- Kubernetes pulls the image and starts a container using it.
- The container runs within a Pod, with the Pod serving as Kubernetes' smallest deployable unit.
- Once the Pod is running, it provides networking and storage as defined in the configuration.

Once a Deployment creates Pods, it continues to manage and monitor them to ensure the desired state is maintained. Here’s how it handles the Pods after they are created:

---

### **1. Ensures Desired Number of Pods (Replica Management)**
- The Deployment creates a **ReplicaSet** to maintain the specified number of replicas (e.g., 2 Pods).
- If any Pod crashes, is deleted, or becomes unresponsive, the ReplicaSet automatically creates a new Pod to replace it.
- If you scale the Deployment (e.g., from 2 to 3 replicas), the ReplicaSet adds an additional Pod.

---

### **2. Handles Updates**
- When you update the Deployment (e.g., changing the container image), Kubernetes performs a **rolling update**:
  - It creates new Pods with the updated configuration.
  - Gradually replaces old Pods with the new ones while ensuring the desired number of Pods remain running.

---

### **3. Self-Healing**
- If a Pod enters a failed or unhealthy state, the Deployment (via the ReplicaSet) terminates and replaces it with a new Pod.
- This ensures the application remains available.

---

### **4. Monitors Pod Health**
- The Deployment monitors Pods' health using **readiness probes** and **liveness probes**:
  - **Readiness Probes:** Check if the Pod is ready to serve requests.
  - **Liveness Probes:** Restart the Pod if it becomes unresponsive.

---

### **5. Load Balancing**
- All Pods created by the Deployment have the same labels (e.g., `app: myapp`).
- Kubernetes automatically adds these Pods to a Service (if defined) for load balancing.
- The Service ensures traffic is distributed evenly among the Pods.

---

### **Summary**
- The Deployment uses a ReplicaSet to monitor, scale, and replace Pods to maintain the desired state.
- It handles updates with rolling updates, self-healing by replacing failed Pods, and ensures Pods are healthy and responsive.
- Kubernetes ensures the Deployment's specifications are always met, even if individual Pods fail or changes are made.


When you introduce a **Service** in Kubernetes, it acts as an abstraction layer that provides stable network access to a set of Pods, ensuring reliable communication between different parts of your application (or with external clients). Here's how it works alongside a **Deployment**:

---

### **1. What Does a Service Do?**

- A **Service** is a way to expose your Pods to each other, or to the outside world, without worrying about the changing IP addresses of individual Pods.
- It provides a stable **DNS name** and **IP address** that clients can use to access a group of Pods, regardless of whether the Pods are restarted or rescheduled across nodes.

---

### **Key Roles of a Service in Kubernetes**

#### **a. Provides Stable Network Identity**
- Pods are ephemeral, meaning their IPs can change when they are restarted or rescheduled.
- A Service provides a **stable endpoint** (a DNS name like `myapp-service.default.svc.cluster.local` or an IP) that clients can use to connect to the Pods, even if Pods are replaced or moved.

#### **b. Load Balancing**
- A **Service** automatically load balances traffic to the Pods it targets, distributing incoming traffic across all Pods in the Service's **selector**.
- For example, if a Deployment has 3 Pods running, the Service will distribute traffic across these Pods, ensuring even load distribution.

#### **c. Service Discovery**
- Kubernetes Services are discoverable within the cluster. For example, other Pods can access a Service by referring to its DNS name (e.g., `myapp-service`).
- Kubernetes automatically updates the Service's list of endpoints as Pods come and go, so you don't have to manually manage IP addresses.

#### **d. Handles Internal Communication Between Pods**
- Services enable communication between different Pods in the cluster, even across different namespaces. If a Pod in one Deployment needs to communicate with Pods in another, it can send traffic to the Service that manages those Pods.

#### **e. Exposes Pods Externally (if needed)**
- Services can also be used to expose your Pods externally (outside the cluster), allowing external clients or users to access the application running inside the Pods.

---

### **How Does a Service Work with a Deployment?**

1. **Service Definition:**
   - A Service is defined separately from the Deployment but works closely with it. The Service is linked to Pods through a **selector** (matching labels).
   - The Service selects Pods created by the Deployment using labels like `app: nginx`.

2. **Accessing Pods via Service:**
   - Instead of accessing Pods individually by their IPs, clients access the Pods via the Service's stable DNS name or IP.
   - The Service automatically forwards requests to the right Pods.

3. **Dynamic Pod Changes:**
   - As Pods are added or removed (due to scaling, updates, or failures), the Service’s endpoints are updated automatically.
   - Clients do not need to know which Pod is currently serving traffic; the Service handles this behind the scenes.

---

### **Example: How a Service Works with a Deployment**

Here’s an example where we have a **Deployment** with Pods running an Nginx image, and a **Service** that exposes those Pods to other Pods or external clients.

#### **Deployment (2 Pods running Nginx)**

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: nginx-deployment
spec:
  replicas: 2
  selector:
    matchLabels:
      app: nginx
  template:
    metadata:
      labels:
        app: nginx
    spec:
      containers:
      - name: nginx
        image: nginx:latest
        ports:
        - containerPort: 80
```

#### **Service (Exposing Nginx Pods)**

```yaml
apiVersion: v1
kind: Service
metadata:
  name: nginx-service
spec:
  selector:
    app: nginx  # Matches Pods with this label
  ports:
    - protocol: TCP
      port: 80      # Exposes port 80 on the Service
      targetPort: 80 # Forwards traffic to the Pods' port 80
  type: ClusterIP   # Default: internal access only
```

### **How It Works Together:**

1. **Service Creates a Stable Endpoint:**
   - The **nginx-service** is created with the selector `app: nginx`, so it targets the Pods created by the **nginx-deployment** (which has `app: nginx` as its label).
   - The Service will automatically route incoming traffic on port 80 to the Nginx Pods' port 80.

2. **Automatic Load Balancing:**
   - The Service will distribute incoming traffic between the 2 Pods running Nginx, even if one Pod is restarted or rescheduled.

3. **Internal Communication:**
   - Other Pods within the cluster can communicate with the Nginx Pods by simply referring to `nginx-service` (e.g., in their `host` configuration or environment variables).

4. **Exposing Externally:**
   - If you change the Service type to `LoadBalancer` or `NodePort`, the Service can expose the Pods to external traffic (e.g., users accessing a website via an external IP).

---

### **Types of Services**

1. **ClusterIP** (default):
   - Exposes the Service only within the cluster. Other Pods can reach it by the Service name.
   
2. **NodePort**:
   - Exposes the Service on a static port across all nodes in the cluster, making it accessible externally.
   
3. **LoadBalancer**:
   - Exposes the Service externally using a cloud provider’s load balancer.
   
4. **ExternalName**:
   - Maps a Service to an external DNS name (like a third-party service).

---

### **Summary**

- A **Service** provides stable network access to Pods, abstracting away their dynamic IP addresses.
- It load-balances traffic to multiple Pods and ensures continuous communication even if Pods are replaced.
- A Service works seamlessly with a Deployment by selecting Pods based on labels and enabling reliable access to your application, both internally and externally.

![image](https://github.com/user-attachments/assets/6aed47e3-6435-4606-911e-15b8f534dc1b)


To help you understand the important aspects of a Kubernetes config file (usually a **YAML file**), here's a breakdown of the key concepts and sections that you'll encounter. This should prepare you for your video lecture!

### **1. What is a Kubernetes Configuration File?**

A Kubernetes configuration file (or manifest) defines the desired state of objects in your Kubernetes cluster. It tells Kubernetes what resources you want to create (e.g., Pods, Deployments, Services), how they should be configured, and how they should behave.

Most Kubernetes config files are written in **YAML (YAML Ain't Markup Language)**. These files are used to create and manage resources like Pods, Deployments, and Services.

### **2. Common Kubernetes Config File Structure**

A typical Kubernetes config file will look like this:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-container
        image: my-image:latest
        ports:
        - containerPort: 80
```

#### **Key Sections of a Kubernetes Config File**

1. **apiVersion:**
   - Specifies which version of the Kubernetes API you're using for this resource.
   - Example: `apps/v1`, `v1`, `extensions/v1beta1`.

2. **kind:**
   - Defines the type of Kubernetes object (e.g., **Pod**, **Deployment**, **Service**).
   - Example: `Deployment`, `Pod`, `Service`, `ReplicaSet`.

3. **metadata:**
   - Metadata includes information about the object like its name, namespace, labels, and annotations.
   - **name:** The name of the object.
   - **labels:** Used for grouping or selecting resources.
   - **annotations:** Optional, used to add metadata that doesn’t affect the resource’s behavior.

4. **spec:**
   - Describes the **desired state** of the resource. For example, how many replicas of a Pod you want or what containers to run.
   - This is the most important section, where you define the specifics of the resource.

### **3. Common Resource Types**

Here are some of the most common Kubernetes resources and their key components:

#### **a. Pod**

A Pod is the smallest and simplest unit in Kubernetes. It encapsulates one or more containers that share the same network namespace.

Example of a Pod config:

```yaml
apiVersion: v1
kind: Pod
metadata:
  name: my-pod
spec:
  containers:
    - name: my-container
      image: nginx:latest
      ports:
        - containerPort: 80
```

- **spec.containers:** Defines the container(s) that will run inside the Pod.
- **name:** Name of the container.
- **image:** Docker image to use for the container.
- **ports:** Exposes ports from the container.

#### **b. Deployment**

A Deployment manages a set of replicas of your Pods, ensuring that the specified number of Pods are running at any given time. It also manages updates to your Pods.

Example of a Deployment config:

```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: my-deployment
spec:
  replicas: 3
  selector:
    matchLabels:
      app: my-app
  template:
    metadata:
      labels:
        app: my-app
    spec:
      containers:
      - name: my-container
        image: nginx:latest
        ports:
        - containerPort: 80
```

- **replicas:** Number of Pods you want to run.
- **selector:** Defines how to select the Pods managed by this Deployment. Usually, it uses labels to match Pods.
- **template:** Defines the Pod template, which will be used to create Pods.

#### **c. Service**

A Service exposes your Pods to other Pods or to the outside world, ensuring stable access to the Pods even when they are replaced or rescheduled.

Example of a Service config:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: my-service
spec:
  selector:
    app: my-app
  ports:
    - protocol: TCP
      port: 80
      targetPort: 80
```

- **selector:** Defines which Pods the Service should route traffic to (based on labels).
- **ports:** Defines the port the Service exposes and the corresponding target port on the Pod.

#### **d. ConfigMap & Secret**

- **ConfigMap:** Stores non-sensitive configuration data that can be shared across Pods.
- **Secret:** Stores sensitive data, such as passwords or API keys, and ensures it is encrypted at rest.

Example of a ConfigMap config:

```yaml
apiVersion: v1
kind: ConfigMap
metadata:
  name: my-config
data:
  MY_ENV_VAR: "some_value"
```

### **4. Namespaces**

Namespaces are a way to organize your Kubernetes resources into separate environments or groups. For example, you could have a `development` namespace and a `production` namespace.

To specify a namespace:

```yaml
metadata:
  name: my-deployment
  namespace: my-namespace
```

### **5. Volume (Persistent Storage)**

Kubernetes can use volumes to store data that needs to persist even if the Pod is restarted. Volumes are defined under the `spec.volumes` section.

Example of a volume in a Pod:

```yaml
spec:
  volumes:
    - name: my-volume
      persistentVolumeClaim:
        claimName: my-pvc
```

### **6. Important Annotations and Labels**

- **Labels** are key-value pairs attached to objects for identification, selection, and grouping.
  - Example: `app: my-app`
  
- **Annotations** store additional metadata about the resource, often used by tools or libraries.
  - Example: `kubernetes.io/created-by: "admin"`

---

### **7. Applying Config Files**

Once you've written a config file, you can apply it to your Kubernetes cluster using:

```bash
kubectl apply -f my-config.yaml
```

### **8. Basic Commands**

- **View resources:**
  ```bash
  kubectl get pods
  kubectl get services
  kubectl get deployments
  ```

- **View resource details:**
  ```bash
  kubectl describe pod my-pod
  ```

- **Delete a resource:**
  ```bash
  kubectl delete -f my-config.yaml
  ```

---

### **Conclusion**

- Kubernetes config files are used to define the desired state of resources like Pods, Deployments, and Services.
- The **key sections** are `apiVersion`, `kind`, `metadata`, and `spec`.
- The **spec** section describes how the resource should behave, such as how many replicas of a Pod are needed or which container image to use.
- Kubernetes uses these YAML files to create, update, and maintain the state of your resources in the cluster.

![image](https://github.com/user-attachments/assets/4b8e0c63-e991-4c9d-b3b2-7ff7f2beaf5f)

Yes, that's correct! Here's how the process works in detail:

---

### **Flow of Traffic with LoadBalancer and Ingress**

1. **Public IP Creation by LoadBalancer:**
   - When you create a **Service** of type `LoadBalancer`, Kubernetes asks your cloud provider (e.g., AWS, GCP, Azure) to provision a public IP address and set up a load balancer in their infrastructure.
   - This public IP becomes the external entry point for traffic into your Kubernetes cluster.

2. **Routing to Ingress Controller:**
   - The cloud provider's load balancer forwards all incoming requests to the Kubernetes nodes running the **Ingress Controller** (e.g., Ingress NGINX).
   - These requests land on the port (commonly 80 for HTTP or 443 for HTTPS) that the Ingress Controller is listening on.

3. **Ingress Controller Processes Requests:**
   - The **Ingress Controller** checks the request against the rules defined in your **Ingress** resource(s). These rules specify:
     - Which hostname (e.g., `api.example.com`) or path (e.g., `/posts`) maps to which Kubernetes **Service**.
   - Based on the rules, it forwards the request to the appropriate **Service**.

4. **Service to Pods:**
   - The **Service** routes the traffic to one of the backend **pods** associated with it, handling internal load balancing across multiple pod instances.

---

### **Example**

#### **Setup:**
- A `LoadBalancer` Service exposes the Ingress Controller to the internet.
- Ingress rules are defined to route requests to specific backend services.

#### **Scenario:**
1. A user visits `api.example.com/login`.
2. The request flow:
   - Public IP → Cloud Load Balancer → Ingress Controller → Backend Service (based on Ingress rules) → Pod.

---

### **Why Use Both LoadBalancer and Ingress?**

1. **LoadBalancer:**
   - Creates a single public IP address for your cluster.
   - Forwards all traffic to the Ingress Controller.

2. **Ingress:**
   - Acts as the "smart router" inside your cluster.
   - Allows you to define complex routing rules, such as:
     - Path-based routing (e.g., `/posts` → Service A, `/users` → Service B).
     - Host-based routing (e.g., `api.example.com` → Service A, `dashboard.example.com` → Service B).
   - Provides centralized SSL/TLS termination and HTTP enhancements.

---

### **Why Not Use LoadBalancer for Each Service?**

- **Cost:** Each `LoadBalancer` Service would create a separate cloud load balancer with its own public IP, which can get expensive.
- **Manageability:** Ingress allows you to consolidate routing logic in one place instead of managing multiple public endpoints.
- **Scalability:** With Ingress, you handle all external traffic with a single load balancer, simplifying scaling and administration.

---

### **Summary**
- The **LoadBalancer** Service provides a single public IP to expose your cluster to the internet.
- The **Ingress Controller** handles the actual routing of requests inside the cluster to the appropriate services and pods. It acts as a centralized router for external traffic.


This is a snippet from a `skaffold.yaml` file, specifically within the `artifacts` section. It defines how Skaffold should handle the build and synchronization of your React (or other client-side) application. Here's a breakdown of what each part means:

---

### Breakdown of the Configuration:

#### 1. **`artifacts`**:
   - The `artifacts` section specifies the application or service to be built as a Docker image.
   - Each `artifact` describes how to build an image for a specific component of your project (e.g., a frontend or backend).

---

#### 2. **`image: ronit21102/client:latest`**:
   - This defines the name of the Docker image to be built and tagged.
     - **`ronit21102`**: This is likely your Docker Hub username (or the namespace of your container registry).
     - **`client`**: The name of the image.
     - **`latest`**: The tag for the image. Typically used for the most recent version of the image.

---

#### 3. **`context: client`**:
   - The `context` specifies the directory containing the code and `Dockerfile` for this artifact.
   - In this case, Skaffold will look for the `Dockerfile` and source code inside the `client` directory.
   - If your project is structured like this:
     ```
     root/
       client/
         Dockerfile
         src/
     ```
     Then Skaffold will use the `client` directory as the build context.

---

#### 4. **`docker`**:
   - This section specifies how Skaffold should build the Docker image.

##### - `dockerfile: Dockerfile`:
   - The name of the Dockerfile to use for building the image.
   - Skaffold expects this Dockerfile to be located in the `context` directory (`client/Dockerfile`).

---

#### 5. **`sync`**:
   - The `sync` section defines how Skaffold should handle file synchronization between your local development environment and the container running in the Kubernetes pod.
   - Instead of rebuilding the Docker image and redeploying the pod for every code change, Skaffold can copy files directly into the running container.

---

##### - `manual`:
   - **Manual synchronization** requires you to specify `src` (source files on your local machine) and `dest` (destination in the container).

###### Example:
```yaml
sync:
  manual:
    - src: 'src/**/*.js'
      dest: .
```

- **`src: 'src/**/*.js'`**:
  - Specifies the files to watch for changes. In this case, all `.js` files in the `src` directory (and its subdirectories) are included.
  - **Glob pattern**:
    - `src/**/*.js`: Matches `.js` files in `src/` and any subfolders.

- **`dest: .`**:
  - Specifies the destination directory inside the container where the updated files will be synced.
  - A `.` indicates the root of the container's working directory (set in your `Dockerfile` with `WORKDIR`).

---

### What This Does:
1. **Image Build**:
   - Skaffold builds a Docker image named `ronit21102/client:latest` using the `client/Dockerfile`.

2. **Code Sync**:
   - When a `.js` file inside `src/` is changed:
     - Instead of rebuilding the entire image, Skaffold syncs the updated file directly into the container.
     - This enables **hot-reloading** (if your app or framework supports it, like React's Fast Refresh).

3. **Development Workflow**:
   - You can run `skaffold dev`, and Skaffold will:
     - Build the Docker image initially.
     - Deploy the pod to your Kubernetes cluster.
     - Watch for changes to `.js` files in `src/` and sync them into the running container without restarting the pod.

---

### Why Use Sync?

**Without Sync**:
- Any code change would require:
  1. Rebuilding the Docker image.
  2. Pushing the image to the registry.
  3. Redeploying the Kubernetes pod.

This can take a significant amount of time, especially for small changes.

**With Sync**:
- File changes are synced directly into the running container, and the app can hot-reload or refresh immediately.
- This drastically reduces the feedback loop time during development.

---

### TL;DR:
This configuration:
- Builds the Docker image `ronit21102/client:latest` from the `client` directory.
- Watches for changes to `.js` files in `src/`.
- Syncs those changes directly into the container's working directory (`.`) in the pod, enabling rapid feedback during development.
