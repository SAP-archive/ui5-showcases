# Contributing

## How Do I Contribute a Showcase?

On the [Contribute a Showcase](https://SAP.github.io/ui5-showcases/index.html#/contribute) page, follow the steps of the showcase wizard and download the resulting zip file.

### Submitting a Pull Request

Extract the downloaded zip file and complete the following steps:

1. Fork the [ui5-showcases](https://github.com/SAP/ui5-showcases/) GitHub repository.
1. Add the images from the extracted `large` folder to:
    ````
    <your_fork>/showcaselib/src/showcaselib/shared/data/large
    ````
1. Add the images from the extracted `small` folder to:
    ````
    <your_fork>/showcaselib/src/showcaselib/shared/data/small
    ````
1. Copy and paste the contents from the extracted `myShowcase.json` file into the following file:
    ````
    <your_fork>/showcaselib/src/showcaseslib/shared/data/model/showcases.json
    ````
1. In your fork, [create a pull request](https://help.github.com/articles/creating-a-pull-request) to the master branch of the original repository.

1. Sit back and wait until your pull request is approved.


## How Do I Contribute to the Showcase Application?

### Requirements

You need to have the following tools installed:

- [Git](https://git-scm.com)
- [Node.js](https://nodejs.org) 8.x

### Installation
1. Fork this repository.
1. [Clone the forked repository](https://help.github.com/articles/cloning-a-repository/) to your local machine.
1. In the `showcaseslib/` directory, install the dependencies for the showcases library:
    ``` sh
    cd showcaseslib/
    npm install
    ```
1. In the `application/` directory, install the application dependencies:
    ``` sh
    cd ../application
    npm install
    ```
1. Start the application (in the `application/` folder)
    ``` sh
    npm start
    ```
1. Open `http://localhost:8080`

### Make Your Changes
1. Make sure the `master` branch of your fork is up to date by [syncing your fork](https://help.github.com/articles/syncing-a-fork/). 
1. Create a new feature branch from the latest `master`:
	- Run `git checkout -b the-feature-name`.
1. Make your changes, and save your files.
1. Commit and push your changes to the forked repository:
	- To commit, run `git add -A && git commit -m "Meaningful commit message"`
	- To push, run `git push`

### Create a Pull Request
[Create a pull request](https://help.github.com/articles/creating-a-pull-request) from the feature branch of the forked repository to the master branch of the original repository.

We will review your changes and get back to you.


## Developer Certificate of Origin (DCO)

Due to legal reasons, contributors will be asked to accept a DCO when they create the first pull request to this project. This happens in an automated fashion during the submission process. SAP uses [the standard DCO text of the Linux Foundation](https://developercertificate.org/).
