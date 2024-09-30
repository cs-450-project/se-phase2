# A CLI for Trustworthy Module Re-use

## Description
The purpose of this project is to allow the ACME Company to rank and score different packages to see if they are viable for their company to use.

## Running/Installation
To run this program, you must first install the necessary packages. Using a linux system, you can enter the following command:
./run install
This will run a program to install necessary packages

To run the program, you can enter the command:
./run FILE_PATH
Where FILE_PATH is the entire file path to the text file.

The text file should be a list of repos to check. They should be seperated by a new line.

## Features
This program runs through a text file of npmjs or github links and ranks them based on several metrics

This following is a list of links you could test to get metrics. Simply copy and past them into a text file. Then, run the program as described above to score these packages

https://github.com/cloudinary/cloudinary_npm
https://www.npmjs.com/package/express
https://github.com/nullivex/nodist
https://github.com/lodash/lodash
https://www.npmjs.com/package/browserify

The program will send the output to the standard out in JSON format