dropofflocations_path <-  "~/GitHub/dropoff-locations"
google_api_key <- readLines("~/.google_api")
setwd(dropofflocations_path)

libraries <- c("tidyverse", "jsonlite", "googlesheets4", "ggmap", "stringr", "rvest")
installed <- rownames(installed.packages())
missing <- libraries[!(libraries %in% installed)]

if(length(missing)){
  install.packages(missing, repos = "https://cloud.r-project.org")
}

library(tidyverse)
library(rvest)
library(googlesheets4)
library(stringr)
library(ggmap)
library(jsonlite)
register_google(key = google_api_key, write = TRUE)
PA_dropbox <- read_sheet("https://docs.google.com/spreadsheets/d/1mKsvUkWGQQbwkADjNI5wQw_SprMYHYLMBpjDq3100XY/edit#gid=1445931955",
                         sheet = "PAVoteParse") %>% select(`county`,`address`,	`type`,	`tfc-schedule`,`public notes`) %>%
  mutate(schedule = ifelse(is.na(`tfc-schedule`), "Normal Business Hours", `tfc-schedule`)) %>% select(-`tfc-schedule`) %>%
  mutate(type = gsub(", ", " & ", type)) %>% rename(notes = `public notes`)

PA_contact<- read_sheet("https://docs.google.com/spreadsheets/d/1mKsvUkWGQQbwkADjNI5wQw_SprMYHYLMBpjDq3100XY/edit#gid=1445931955",
                         sheet = "county contact") %>% mutate(county = paste( Jurisdiction, "County")) %>% select(county, `Phone Number`)

PA_dropbox <- PA_dropbox %>% mutate(address = gsub("\\n", "\n", address, fixed = T))
PA_dropbox <- PA_dropbox %>% left_join(PA_contact) %>% mutate(address = trimws(address)) %>% mutate(newline_cnt = str_count(string = address, "\n"))%>%
  rowwise() %>% 
  mutate(address = ifelse(newline_cnt == 1, paste0(county, "-" ,gsub('\n',' & ',type), "\n", address), address)) %>% 
  separate(address, into = c("name", "address", "city"), sep = "\n") %>%
  mutate(zip = gsub(".* ", '', city),
         city = gsub(",.*", '', city),
         state = "Pennsylvania", state_abbreviation = "PA") %>%
  mutate(type = ifelse(grepl("drop box", tolower(type)), "dropbox", type)) 


PA_dropbox$type[PA_dropbox$type == "County Election Office"] = "clerk"
PA_dropbox$type[PA_dropbox$type == "Remote Dropoff Location"] = "other"
PA_dropbox$type[PA_dropbox$type == "Satellite Election Office"] = "clerk"




PA <- PA_dropbox %>% rename(phone = `Phone Number`) %>%
  mutate(api_call = paste(gsub(",.*",'',address), city, state, zip)) %>% mutate_geocode(api_call) %>% 
  select(
  state, state_abbreviation, county, zip, name, address, city, schedule, `notes`, phone, type, lat, lon
) %>% rowwise() %>% mutate(reverse_lookup = revgeocode(c(lon, lat)))

PA %>% mutate(flag = gsub(" .*", '', reverse_lookup) == gsub(" .*", '', address)) %>% filter(!flag) %>% View()

PA <- PA %>% mutate(zip = as.numeric(zip))
write(toJSON(PA %>% select(-reverse_lookup) %>% rename( latitude = lat, longitude = lon), dataframe = "rows", pretty = T), "api/data/pa-dem.json")

