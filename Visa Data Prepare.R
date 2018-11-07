## Visa Data Preparation
## Authors: Ryan Capps & Ellie Nguyen
## Description: This script prepares our US Permanent Visa Application dataset
##              for use in our MultiStream implementation.



# Load Essential Libraries
library(tidyverse)

# Load in data from CSV
setwd("C:/Users/ryjo4/Desktop/Intro to Visualization/Project/Data Sources")
visaData <- read.csv("us_perm_visas.csv", stringsAsFactors = F)

# Extract Relevant Data Columns
visaData <- visaData %>% select(case_status, class_of_admission,
                                country_of_citzenship,
                                job_info_work_city, job_info_work_state)

# Visa Data By Country
visaDataByCountry <- visaData %>% select(status = case_status,
                                         visa_type = class_of_admission,
                                         country = country_of_citzenship)

visaDataByCountry <- visaDataByCountry %>% filter(country != "")

visaDataByCountry$continent[visaDataByCountry$country %in% c("CANADA", "UNITED STATES OF AMERICA",
                                                             "DOMINICAN REPUBLIC", "BARBADOS",
                                                             "ST LUCIA", "ST KITTS AND NEVIS",
                                                             "EL SALVADOR", "PANAMA",
                                                             "BAHAMAS", "HAITI",
                                                             "MEXICO", "TRINIDAD AND TOBAGO",
                                                             "COSTA RICA", "GUATEMALA",
                                                             "GRENADA", "BELIZE",
                                                             "DOMINICA", "ST VINCENT",
                                                             "NICARAGUA", "JAMAICA", "HONDURAS")] <- "North America"

visaDataByCountry$continent[visaDataByCountry$country %in% c("POLAND",
                                                     "RUSSIA", "BULGARIA", "SLOVAKIA", "ROMANIA",
                                                     "MACEDONIA", "GEORGIA", "SERBIA AND MONTENEGRO",
                                                     "SWITZERLAND", "BELARUS", "BELGIUM", "ESTONIA",
                                                     "FINLAND", "CROATIA", "ICELAND", "ITALY",
                                                     "FRANCE", "SLOVENIA", "ALBANIA", "DENMARK",
                                                     "CYPRUS", "BOSNIA AND HERZEGOVINA", "KOSOVO",
                                                     "SWEDEN", "SPAIN", "UKRAINE",
                                                     "MOLDOVA", "NETHERLANDS", "GREECE", "CZECH REPUBLIC",
                                                     "NORWAY", "LITHUANIA", "LATVIA", "AZERBAIJAN",
                                                     "TURKEY", "PORTUGAL", "AUSTRIA", "IRELAND", "UNITED KINGDOM",
                                                     "HUNGARY", "GERMANY", "YUGOSLAVIA", "MALTA")] <- "Europe"

visaDataByCountry$continent[visaDataByCountry$country %in% c("ARMENIA", "SINGAPORE", "VIETNAM", "BANGLADESH",
                                                     "KUWAIT", "CHINA", "INDONESIA", "MONGOLIA",
                                                     "MALAYSIA", "THAILAND", "INDIA", "PHILIPPINES",
                                                     "IRAN", "TAIWAN", "NEPAL", "UNITED ARAB EMIRATES",
                                                     "SOUTH KOREA", "PAKISTAN", "JAPAN", "SRI LANKA",
                                                     "HONG KONG", "LEBANON", "JORDAN", "TURKMENISTAN",
                                                     "BHUTAN", "BAHRAIN", "KAZAKHSTAN", "SAUDI ARABIA",
                                                     "IRAQ", "LAOS", "BURMA (MYANMAR)", "NORTH KOREA",
                                                     "SYRIA", "CAMBODIA", "UZBEKISTAN", "YEMEN",
                                                     "KYRGYZSTAN", "AFGHANISTAN", "OMAN",
                                                     "PALESTINE", "TAJIKISTAN", "ISRAEL")] <- "Asia"

visaDataByCountry$continent[visaDataByCountry$country %in% c("SOUTH AFRICA", "IVORY COAST",
                                                             "SENEGAL", "GUINEA", "NIGERIA",
                                                             "EGYPT", "BURKINA FASO", "MAURITIUS",
                                                             "SUDAN", "TANZANIA", "UGANDA", "GAMBIA",
                                                             "ZAMBIA", "LIBYA", "LIBERIA", "TOGO", 
                                                             "LESOTHO", "CAMEROON", "MOROCCO",
                                                             "KENYA", "GHANA", "MALI", "ZIMBABWE",
                                                             "TUNISIA", "RWANDA", "SIERRA LEONE",
                                                             "ANGOLA", "ETHIOPIA")] <- "Africa"

visaDataByCountry$continent[visaDataByCountry$country %in% c("COLOMBIA", "PERU", "BRAZIL",
                                                             "CHILE", "VENEZUELA", "BOLIVIA",
                                                             "ARGENTINA", "PARAGUAY",
                                                             "GUYANA", "URUGUAY", "ECUADOR")] <- "South America"

visaDataByCountry$continent[visaDataByCountry$country %in% c("AUSTRALIA", "NEW ZEALAND",
                                                             "FIJI")] <- "Australia"




# Visa Data by Employer Information
visaDataByEmployer <- visaData %>% select(status = case_status,
                                          visa_type = class_of_admission,
                                          job_city = job_info_work_city,
                                          job_state = job_info_work_state)

visaDataByEmployer <- visaDataByEmployer %>% filter(job_city != "", job_state != "")
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NY"] <- "NEW YORK"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "TX"] <- "TEXAS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "IL"] <- "ILLINOIS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "WY"] <- "WYOMING"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MA"] <- "MASSACHUSETTS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NC"] <- "NORTH CAROLINA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "AZ"] <- "ARIZONA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "WA"] <- "WASHINGTON"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NV"] <- "NEVADA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "OR"] <- "OREGON"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "DC"] <- "DISTRICT OF COLUMBIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "RI"] <- "RHODE ISLAND"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "SD"] <- "SOUTH DAKOTA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "KS"] <- "KANSAS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "AR"] <- "ARKANSAS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "SC"] <- "SOUTH CAROLINA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "ND"] <- "NORTH DAKOTA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "ME"] <- "MAINE"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MD"] <- "MARYLAND"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NJ"] <- "NEW JERSEY"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "CA"] <- "CALIFORNIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "OH"] <- "OHIO"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "VA"] <- "VIRGINIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MO"] <- "MISSOURI"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "WI"] <- "WISCONSIN"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "CO"] <- "COLORADO"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "UT"] <- "UTAH"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "OK"] <- "OKLAHOMA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MI"] <- "MICHIGAN"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NH"] <- "NEW HAMPSHIRE"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NM"] <- "NEW MEXICO"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "TN"] <- "TENNESSEE"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "GU"] <- "GUAM"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "DE"] <- "DELEWARE"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "HI"] <- "HAWAII"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "AK"] <- "ALASKA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "FL"] <- "FLORIDA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "GA"] <- "GEORGIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "KY"] <- "KENTUCKY"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MS"] <- "MISSISSIPPI"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "ID"] <- "IDAHO"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "CT"] <- "CONNECTICUT"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "PA"] <- "PENNSYLVANIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MN"] <- "MINNESOTA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "AL"] <- "ALABAMA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "LA"] <- "LOUISIANA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "IA"] <- "IOWA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "IN"] <- "INDIANA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "NE"] <- "NEBRASKA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "PR"] <- "PUERTO RICO"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "WV"] <- "WEST VIRGINIA"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "VI"] <- "VIRGIN ISLANDS"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "VT"] <- "VERMONT"
visaDataByEmployer$job_state[visaDataByEmployer$job_state == "MT"] <- "MONTANA"



visaDataByEmployer$job_city <- toupper(visaDataByEmployer$job_city)

