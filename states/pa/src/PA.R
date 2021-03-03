library(tidyverse)
library(jsonlite)
library(googlesheets4)

# Connection to the google sheets, the googlesheets4 will ask for authenication via google before allow you to read
PA_Election_commision_info_by_county <- read_sheet("https://docs.google.com/spreadsheets/d/1y3r9FkOeknaV_yvYkywX9E6KRUu0u2je5PRY8eiYklY/edit#gid=966615671")
PA_county_wesbites <- read_sheet("https://docs.google.com/spreadsheets/d/1LEoh0OZ1usMluWgHBvyc0zkI0r656ymhGbfmv2_FRLw/edit#gid=0")

PA_county_level_data <- read_sheet("https://docs.google.com/spreadsheets/d/1peF43r2yEvRbYZ2j-ZrNixPgUcJXxyeANNjTfw07xnM/edit#gid=445826513")

PA_Election_commision_info_by_county <- PA_Election_commision_info_by_county %>% 
  group_by(County, Location, `Street Address 1`, `Street Address 2`, City, Zip) %>%
  summarise(`Drop-Off Location` = any(`Drop-Off Location?`), `Vote-Early Location` = any(`Vote-Early Location?`))



# Easier to combine multiple research files 
PA_Election_commision_info_by_county <- PA_Election_commision_info_by_county %>% 
  left_join(PA_county_wesbites %>% mutate(County = gsub(" County", "", County) ) %>% select(County, Website) %>% rename(`County Website` = Website)) %>% rowwise() %>%
  mutate_all(.funs = function(x){ifelse(is.character(x), gsub("\n", " ", x), x)})

# Two forrmat outputs one folder up from the script
# write.csv(PA_Election_commision_info_by_county, file = "states/pa/data/PA_Election_dropoff_info_by_county.csv", row.names = F)
## Manul time check





