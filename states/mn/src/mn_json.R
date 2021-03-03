### MN Data formating
library(tidyverse)
library(googlesheets4)
library(ggmap)
library(jsonlite)
google_api_key <- readLines("~/.google_api")
register_google(key = google_api_key, write = TRUE)

MN_scraped <- read_sheet("https://docs.google.com/spreadsheets/d/144dhhO9C5JUvDSSChSnYAdWid7blEnlOAbbH1aGsA6c/edit#gid=1130907629", 
                         sheet = "for_export")


MN_scraped$`Location Type` <- recode(MN_scraped$`Location Type`,"Polling Place" = 'pollingPlace', "Election Office" = 'clerk', "Dropoff Location" = 'dropbox', "Other" = "other")

MN_scraped <- MN_scraped %>% 
  select(`Location Type`, `Location Name` , `Address Line 1`, `Address Line 2`, City, County, State, Zip, 
         URL, `Voting Dates and Times`, `Special Rules and Instructions`) %>%
  mutate(api_call = paste(`Address Line 1`,  City, State, Zip),
         `Address Line 2` = ifelse(is.na(`Address Line 2`), "", paste0(", ", `Address Line 2`))) %>% 
  mutate(address = paste(`Address Line 1`, `Address Line 2`)) %>% mutate_geocode(api_call) %>% 
  rowwise() %>% mutate(reverse_lookup = revgeocode(c(lon, lat)))  %>%
                         rename(type = `Location Type`, name = `Location Name`, source = URL, 
                                `schedule` = `Voting Dates and Times`, `notes` = `Special Rules and Instructions`,
                                latitude = lat, longitude = lon)

names(MN_scraped) = tolower(names(MN_scraped))

MN_scraped %>% select(address, city, zip, reverse_lookup) %>% View()

MN <- MN_scraped %>% 
  select(-reverse_lookup, -`address line 1`, -`address line 2`, -api_call) %>% 
  rename(stateAbbreviation = state) %>% mutate(state = "Minnesota", zip = as.numeric(gsub('-.*','',zip))) %>% 
  as.data.frame()

write(toJSON(MN, dataframe = "rows", pretty = T), "api/data/all-minnesota.json")
