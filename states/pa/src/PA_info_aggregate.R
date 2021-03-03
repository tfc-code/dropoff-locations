library(tidyverse)
library(jsonlite)
library(googlesheets4)


PA_Election_commision_info_by_county_manual <- read_csv("states/pa/data/PA_Election_dropoff_info_by_county.csv")
PA_county_wesbites <- read_sheet("https://docs.google.com/spreadsheets/d/1LEoh0OZ1usMluWgHBvyc0zkI0r656ymhGbfmv2_FRLw/edit#gid=0")

PA_county_level_data <- read_sheet("https://docs.google.com/spreadsheets/d/1peF43r2yEvRbYZ2j-ZrNixPgUcJXxyeANNjTfw07xnM/edit#gid=445826513")


PA_Election_commision_info_by_county_manual <- PA_Election_commision_info_by_county_manual %>% 
  left_join(PA_county_level_data %>% mutate(County = gsub(" County", "", county)) %>% select(County, state, phone)) %>%
  mutate(`Street Address 2` = ifelse(is.na(`Street Address 2`), "", paste0(",", `Street Address 2`))) %>%
  mutate(address = paste(`Street Address 1`, `Street Address 2`),
         `notes` = ifelse(is.na(`Additional Hours`), "", paste0("Additional Hours: ", `Additional Hours`)),
         State = "Pennsylvannia") %>%
  select(State, state, County,Zip , Location, address,City, `Operating Hours`, `notes`, phone, `County Website`, `Drop-Off Location`, `Vote-Early Location`) %>%
  rename(name = Location, state_abbreviation = state, schedule = `Operating Hours`, dropoff = `Drop-Off Location`, vote_early = `Vote-Early Location`)

colnames(PA_Election_commision_info_by_county_manual) <- tolower(colnames(PA_Election_commision_info_by_county_manual))

PA_Election_commision_info_by_county_manual_dropoff <- PA_Election_commision_info_by_county_manual %>% filter(dropoff) %>% mutate(type = 'dropbox') %>% select(-dropoff, -vote_early)
PA_Election_commision_info_by_county_manual_vote_early <- PA_Election_commision_info_by_county_manual %>% filter(vote_early) %>% mutate(type = 'earlyVoting') %>% select(-dropoff, -vote_early)

write_csv(PA_Election_commision_info_by_county_manual_dropoff, "states/pa/data/PA_Election_commision_info_by_county_manual_dropoff.csv")
write_csv(PA_Election_commision_info_by_county_manual_vote_early, "states/pa/data/PA_Election_commision_info_by_county_manual_vote_early.csv")

