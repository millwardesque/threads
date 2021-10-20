#!/bin/zsh

WORKING_DIR=/Users/christopher.millward/Development/threads/threads-data/
YESTERDAY=$(date -v -1d "+%Y-%m-%d")

echo "Processing Virtual Brands orders"
$WORKING_DIR/presto-etl.sh $WORKING_DIR/queries/virtualbrands-orders.sql $YESTERDAY 1 $WORKING_DIR/data/virtualbrands-orders.now.csv 1 1