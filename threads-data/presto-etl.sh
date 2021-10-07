#!/bin/zsh

# @TODO:
# Sanity checking

queryFile=$1
startDate=$2
daysToFetch=$3
outputFile=$4
append=$5
verbose=$6

prestoPath="/Users/christopher.millward/Development/trino/prestocss"

echoErr() {
	printf "%s\n" "$*" >&2
}

logVerbose() {
    local message=$1

    if [[ -n $verbose ]]; then
        echoErr $message
    fi
}

buildQuery() {
    local query=$1
    local minDate=$2
    local daysToFetch=$3

    logVerbose "Building query"

    local updatedQuery=$(echo $query | sed -e "s/\${start_date}/$startDate/g")
    updatedQuery=$(echo $updatedQuery | sed -e "s/\${days_to_fetch}/$daysToFetch/g")

    logVerbose "Query"
    logVerbose $updatedQuery

    echo $updatedQuery
}

executeQuery() {
    local query=$1
    local useProduction="1"

    logVerbose "Executing query"

    local csvFormat="CSV"
    if [[ -z "$append" || "$append" == "0" ]]; then
        local csvFormat="CSV_HEADER"
    fi

    local results=$($prestoPath --execute=$query --output-format=$csvFormat ${useProduction})
    echo $results
}

saveResults() {
    local results=$1
    local outputFile=$2
    local append=$3

    logVerbose "Saving results to $outputFile (Append? $append)";
    if [[ -z "$append" || "$append" == "0" ]]; then
        echo $results > $outputFile
    else
        echo $results >> $outputFile
    fi
}

queryTemplate=`cat $queryFile`
query=$(buildQuery $queryTemplate $startDate $daysToFetch)
results=$(executeQuery $query)
saveResults "$results" "$outputFile" "$append"