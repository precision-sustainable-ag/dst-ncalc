## Cover Crop Nitrogen Calculator

The Cover Crop Nitrogen Calculator (CC-NCALC) is a user-friendly tool designed to help farmers and agricultural professionals estimate nitrogen (N) release from decomposing cover crop residues. It provides insights into:

- The rate of N release over time
- The amount of undecomposed residue remaining
- Corn N uptake based on yield goals
- N fertilizer recommendations considering cover crop contributions

CC-NCALC is based on the CERES-N sub-model and incorporates data from lab and field studies across diverse environments. By using real-time and historical weather data, as well as soil properties from the NRCS SSURGO database, the tool enhances nitrogen management by predicting N availability and optimizing fertilizer inputs. Users can input field location, cover crop biomass, and N concentration, with optional advanced inputs for more precise estimations.

To access the live tool, visit [here](https://covercrop-ncalc.org/).

To see the documents for this tool, visit the [wiki pages](https://precision-sustainable-ag.atlassian.net/wiki/spaces/DST/pages/241565697/Nitrogen+Calculator).

**Date Created**: 07/09/21

**Date Last Modified**: 02/25/25

**Table of Contents:**

- [Cover Crop Nitrogen Calculator](#cover-crop-nitrogen-calculator)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Folder Structure](#folder-structure)

## Getting Started

### Prerequisites

Before running the application, ensure you have the following installed:

- [Node.js and NPM](https://nodejs.org/en/download/)
- [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- Code Editor like [Visual Studio Code](https://code.visualstudio.com/docs/setup/setup-overview)

### Installation

To get started with CC-NCalc, clone this repository to your local machine using the following command:

```bash
git clone https://github.com/precision-sustainable-ag/dst-ncalc.git
```

Install the necessary dependencies by running:

```bash
npm install
```

On root directory, create a file named `.env`, the file should contain following keys, ask @mikahpinegar for the values of the keys.

```
VITE_MAPBOX_TOKEN
VITE_API_AUTH0_DOMAIN
VITE_API_AUTH0_CLIENT_ID
VITE_API_AUTH0_AUDIENCE
VITE_API_USER_HISTORY_API_URL
VITE_API_USER_HISTORY_SCHEMA
```

To start the application, run:

```bash
npm start
```

### Folder Structure

```
src/
├── components        # Major pages of the app
├── hooks             # Hooks for retrieving data, calling api, etc
├── shared            # Reusable components across the app
├── store             # Redux store and functions
├── util              # Utility functions

```
