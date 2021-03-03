# How to generate PA json using a mac

1. [Install R](https://cran.r-project.org/bin/macosx/)
2. [Install RStudio Desktop](https://rstudio.com/products/rstudio/download/)
3. Edit the [PA Dropbox QA Google Sheet](https://docs.google.com/spreadsheets/d/1mKsvUkWGQQbwkADjNI5wQw_SprMYHYLMBpjDq3100XY/edit#gid=1445931955)
3. run each line of the PA_official_dropbox_locations.R script in RStudio if running for the first time, you will need to supply two args:
  1. full path to the dropoff-locations repo
  2. the google api key to do lookups
  
## Good to know:
  The first time this script is ran, it will have to authenticate with Google in order to read the PA Dropbox QA Google Sheet. 
  If the number of Phildelphia boxes change, update `api/src/__tests__/server.ts` line 73
