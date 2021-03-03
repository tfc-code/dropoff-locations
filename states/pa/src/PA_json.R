library(tidyverse)
library(jsonlite)
library(ggmap)
# file  type manually editted
PA_Election_commision_info_by_county_manual_dropoff <- read_csv("states/pa/data/PA_Election_commision_info_by_county_manual_dropoff.csv")
PA_Election_commision_info_by_county_manual_dropoff$schedule <- gsub("\xd0", "-", PA_Election_commision_info_by_county_manual_dropoff$schedule)
PA_Election_commision_info_by_county_manual_dropoff$notes <- gsub("\xd0", "-", PA_Election_commision_info_by_county_manual_dropoff$notes)

PA_Election_commision_info_by_county_manual_dropoff$schedule <- gsub(",", "\n", PA_Election_commision_info_by_county_manual_dropoff$schedule, fixed = T)
PA_Election_commision_info_by_county_manual_dropoff$schedule <- gsub("\n ", "\n", PA_Election_commision_info_by_county_manual_dropoff$schedule, fixed = T)

PA_Election_commision_info_by_county_manual_dropoff$notes <- gsub(",", "\n", PA_Election_commision_info_by_county_manual_dropoff$notes)
PA_Election_commision_info_by_county_manual_dropoff$schedule <- gsub("\n ", "\n", PA_Election_commision_info_by_county_manual_dropoff$schedule, fixed = T)


PA_Election_commision_info_by_county_manual_vote_early <- read_csv("states/pa/data/PA_Election_commision_info_by_county_manual_vote_early.csv")
PA_Election_commision_info_by_county_manual_vote_early$schedule <- gsub("\xd0", "-", PA_Election_commision_info_by_county_manual_vote_early$schedule)
PA_Election_commision_info_by_county_manual_vote_early$notes <- gsub("\xd0", "-", PA_Election_commision_info_by_county_manual_vote_early$notes)
PA_Election_commision_info_by_county_manual_vote_early$notes <- gsub("{", "", PA_Election_commision_info_by_county_manual_vote_early$notes, fixed = T)
PA_Election_commision_info_by_county_manual_vote_early$notes <- gsub("}", "", PA_Election_commision_info_by_county_manual_vote_early$notes, fixed = T)




pa_data <- PA_Election_commision_info_by_county_manual_dropoff

google_api_key <- readLines("~/.google_api")
register_google(key = google_api_key, write = TRUE)

pa_data <- pa_data %>% mutate(api_call = paste(gsub(",.*",'',address), city, state, zip)) %>% mutate_geocode(api_call) %>% select(
  state, state_abbreviation, county, zip, name, address, city, schedule, notes, phone, `county website`, type, lat, lon
) %>% rowwise() %>% mutate(reverse_lookup = revgeocode(c(lon, lat)))


pa_data %>% select(address, city, zip, reverse_lookup) %>% View()

PA <- pa_data %>% mutate(zip = as.numeric(zip))
write(toJSON(PA %>% select(-reverse_lookup) %>% rename( latitude = lat, longitude = lon), dataframe = "rows", pretty = T), "api/data/pa-dem.json")
