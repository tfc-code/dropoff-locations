#!/bin/bash

for x in $(cat flcounties.txt)
do
	wget -O data/$x.json https://api.vls.vrswebapps.com/api/v1/election/$x
done
