#!/bin/bash

apt update
apt install python3 python3-pip

cd $(dirname "$0")
pip3 install .
