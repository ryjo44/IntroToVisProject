## Visa Data Preparation
## Authors: Ryan Capps & Ellie Nguyen
## Description: This script prepares our US Permanent Visa Application dataset
##              for use in our MultiStream implementation.



# Load Essential Libraries
library(tidyverse)

# Load in data from CSV
setwd("C:/Users/ryjo4/Desktop/")
visaData <- read.csv("us_perm_visas.csv", stringsAsFactors = F)

# Extract Relevant Data Columns
visaData <- visaData %>% select(case_status, class_of_admission,
                                country_of_citzenship,
                                job_info_work_city, job_info_work_state,
                                decision_date)

# Visa Data By Country
visaDataByCountry <- visaData %>% select(country = country_of_citzenship,
                                         date = decision_date)

visaDataByCountry <- visaDataByCountry %>% filter(country != "", date != "")

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
visaDataByEmployer <- visaData %>% select(city = job_info_work_city,
                                          state = job_info_work_state,
                                          date = decision_date)

visaDataByEmployer <- visaDataByEmployer %>% filter(city != "", state != "", date != "")
visaDataByEmployer$state[visaDataByEmployer$state == "NY"] <- "NEW YORK"
visaDataByEmployer$state[visaDataByEmployer$state == "TX"] <- "TEXAS"
visaDataByEmployer$state[visaDataByEmployer$state == "IL"] <- "ILLINOIS"
visaDataByEmployer$state[visaDataByEmployer$state == "WY"] <- "WYOMING"
visaDataByEmployer$state[visaDataByEmployer$state == "MA"] <- "MASSACHUSETTS"
visaDataByEmployer$state[visaDataByEmployer$state == "NC"] <- "NORTH CAROLINA"
visaDataByEmployer$state[visaDataByEmployer$state == "AZ"] <- "ARIZONA"
visaDataByEmployer$state[visaDataByEmployer$state == "WA"] <- "WASHINGTON"
visaDataByEmployer$state[visaDataByEmployer$state == "NV"] <- "NEVADA"
visaDataByEmployer$state[visaDataByEmployer$state == "OR"] <- "OREGON"
visaDataByEmployer$state[visaDataByEmployer$state == "DC"] <- "DISTRICT OF COLUMBIA"
visaDataByEmployer$state[visaDataByEmployer$state == "RI"] <- "RHODE ISLAND"
visaDataByEmployer$state[visaDataByEmployer$state == "SD"] <- "SOUTH DAKOTA"
visaDataByEmployer$state[visaDataByEmployer$state == "KS"] <- "KANSAS"
visaDataByEmployer$state[visaDataByEmployer$state == "AR"] <- "ARKANSAS"
visaDataByEmployer$state[visaDataByEmployer$state == "SC"] <- "SOUTH CAROLINA"
visaDataByEmployer$state[visaDataByEmployer$state == "ND"] <- "NORTH DAKOTA"
visaDataByEmployer$state[visaDataByEmployer$state == "ME"] <- "MAINE"
visaDataByEmployer$state[visaDataByEmployer$state == "MD"] <- "MARYLAND"
visaDataByEmployer$state[visaDataByEmployer$state == "NJ"] <- "NEW JERSEY"
visaDataByEmployer$state[visaDataByEmployer$state == "CA"] <- "CALIFORNIA"
visaDataByEmployer$state[visaDataByEmployer$state == "OH"] <- "OHIO"
visaDataByEmployer$state[visaDataByEmployer$state == "VA"] <- "VIRGINIA"
visaDataByEmployer$state[visaDataByEmployer$state == "MO"] <- "MISSOURI"
visaDataByEmployer$state[visaDataByEmployer$state == "WI"] <- "WISCONSIN"
visaDataByEmployer$state[visaDataByEmployer$state == "CO"] <- "COLORADO"
visaDataByEmployer$state[visaDataByEmployer$state == "UT"] <- "UTAH"
visaDataByEmployer$state[visaDataByEmployer$state == "OK"] <- "OKLAHOMA"
visaDataByEmployer$state[visaDataByEmployer$state == "MI"] <- "MICHIGAN"
visaDataByEmployer$state[visaDataByEmployer$state == "NH"] <- "NEW HAMPSHIRE"
visaDataByEmployer$state[visaDataByEmployer$state == "NM"] <- "NEW MEXICO"
visaDataByEmployer$state[visaDataByEmployer$state == "TN"] <- "TENNESSEE"
visaDataByEmployer$state[visaDataByEmployer$state == "GU"] <- "GUAM"
visaDataByEmployer$state[visaDataByEmployer$state == "DE"] <- "DELEWARE"
visaDataByEmployer$state[visaDataByEmployer$state == "HI"] <- "HAWAII"
visaDataByEmployer$state[visaDataByEmployer$state == "AK"] <- "ALASKA"
visaDataByEmployer$state[visaDataByEmployer$state == "FL"] <- "FLORIDA"
visaDataByEmployer$state[visaDataByEmployer$state == "GA"] <- "GEORGIA"
visaDataByEmployer$state[visaDataByEmployer$state == "KY"] <- "KENTUCKY"
visaDataByEmployer$state[visaDataByEmployer$state == "MS"] <- "MISSISSIPPI"
visaDataByEmployer$state[visaDataByEmployer$state == "ID"] <- "IDAHO"
visaDataByEmployer$state[visaDataByEmployer$state == "CT"] <- "CONNECTICUT"
visaDataByEmployer$state[visaDataByEmployer$state == "PA"] <- "PENNSYLVANIA"
visaDataByEmployer$state[visaDataByEmployer$state == "MN"] <- "MINNESOTA"
visaDataByEmployer$state[visaDataByEmployer$state == "AL"] <- "ALABAMA"
visaDataByEmployer$state[visaDataByEmployer$state == "LA"] <- "LOUISIANA"
visaDataByEmployer$state[visaDataByEmployer$state == "IA"] <- "IOWA"
visaDataByEmployer$state[visaDataByEmployer$state == "IN"] <- "INDIANA"
visaDataByEmployer$state[visaDataByEmployer$state == "NE"] <- "NEBRASKA"
visaDataByEmployer$state[visaDataByEmployer$state == "PR"] <- "PUERTO RICO"
visaDataByEmployer$state[visaDataByEmployer$state == "WV"] <- "WEST VIRGINIA"
visaDataByEmployer$state[visaDataByEmployer$state == "VI"] <- "VIRGIN ISLANDS"
visaDataByEmployer$state[visaDataByEmployer$state == "VT"] <- "VERMONT"
visaDataByEmployer$state[visaDataByEmployer$state == "MT"] <- "MONTANA"



visaDataByEmployer$city <- toupper(visaDataByEmployer$city)

