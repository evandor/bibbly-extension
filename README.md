# Bookmrkx Extension

Browser Extension to manage...

# Features

* todo

# Installation

Assumption: the github repo has been cloned or downloaded from https://github.com/evandor/bibbly-extension

## Prerequisities

### node (20), 

see https://nodejs.org/en/download/package-manager

### yarn: 

npm install --global yarn

## Install the dependencies

make sure you added the submodules: in the root folder, run

```
git submodule add -b main https://github.com/evandor/submodule-content.git src/content
git submodule add -b main https://github.com/evandor/submodule-core.git src/core
git submodule add -b main https://github.com/evandor/submodule-features.git src/features
```

This has to be done once only.

Hint: running into something like "fatal: 'src/core' already exists in the index" can be fixed with


```bash
yarn install
```
or
```bash
npm install
```

