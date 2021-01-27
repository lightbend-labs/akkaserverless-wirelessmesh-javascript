# Akka Serverless - Wireless Mesh Example App

A JavaScript-based example app for [Akka Serverless](https://developer.lightbend.com/docs/akka-serverless/)

Features include:

* Customer locations with wireless mesh devices

## What is this example?

To help you get started with Akka Serverless, we've built some example apps that showcase the capabilities of the platform. This example application mimics a company that uses Akka Serverless to keep track of the wireless mesh devices their customers have installed and the devices connected to the meshes.

In this example app you can interact with the devices, assign them to different rooms in the house, and turn them on or off. To make this example even more interactive, you can add an actual nightlight and switch the lights on or off. 

## Prerequisites

To build and deploy this example application, you'll need to have:

* An [Akka Serverless account](https://docs.cloudstate.com/getting-started/lightbend-account.html)
* Node.js v12 or higher installed
* The Docker CLI installed

## Build, Deploy, and Test

### Build your containers

To build your own container, execute the below commands:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Build a container for the service
docker build . -t $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest
```

of if you prefer `npm`, you can run

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Build a container for the service
npm run dockerbuild
```

### Deploy your container

To deploy the container as a service in Akka Serverless, you'll need to:

```bash
## Set your dockerhub username
export DOCKER_REGISTRY=docker.io
export DOCKER_USER=<your dockerhub username>

## Push the containers to a container registry
docker push $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest

## Set your Akka Serverless project name
export AKKASLS_PROJECT=<your project>
akkasls svc deploy wirelessmesh $DOCKER_REGISTRY/$DOCKER_USER/akkaserverless-wirelessmesh-javascript:latest --project $AKKASLS_PROJECT
```

_The above command will deploy your container to your project with the name `wirelessmesh`. If you want to have a different name, you can change that._

### Testing your service

TODO

## Contributing

We welcome all contributions! [Pull requests](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/pulls) are the preferred way to share your contributions. For major changes, please open [an issue](https://github.com/lightbend-labs/akkaserverless-wirelessmesh-javascript/issues) first to discuss what you would like to change.

## Support

This project is provided on an as-is basis and is not covered by the Lightbend Support policy.

## License

See the [LICENSE](./LICENSE).